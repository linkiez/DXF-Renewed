import { EPSILON } from '../config'
import type { CutAction, CutLayout, CutPlan } from '../cutPath/types'
import { actionLength } from '../linking/actionLength'
import { linkActions } from '../linking/linkActions'
import { placedParts } from '../linking/placedParts'
import type { PlacedPart } from '../linking/placedParts'
import { computeArea } from '../polygonUtils'
import type { StockItem } from '../types'
import { costMessages } from './messages'
import type { CostNotice, CostRequest } from './types'

/** One action reduced to what the cost needs. */
export interface ActionUsage {
  category: 'cut' | 'travel' | 'pierce'
  /** Geometric length in geometry units. */
  length: number
  /** Numeric `feed` carried by the action (meters per minute), when present. */
  feed: number | null
  /** Numeric `dwell` carried by the action (seconds), when present. */
  dwell: number | null
}

/** Usage of one placed part. */
export interface PartUsageRecord {
  key: string
  shapeId: string
  instanceIndex: number
  sheetId: string
  netArea: number
  actions: ActionUsage[]
}

/** Usage of one sheet: its parts and the actions no part owns. */
export interface SheetUsage {
  sheetId: string
  kind: 'sheet' | 'remnant'
  parts: PartUsageRecord[]
  unallocated: ActionUsage[]
}

/** Everything measured from the artifact and the cut plan. */
export interface UsageResult {
  sheets: SheetUsage[]
  notices: CostNotice[]
  /** Whether the request carried at least one cut plan. */
  planPresent: boolean
}

type ArtifactLayout = NonNullable<CostRequest['artifact']['layout']>

const CATEGORY: Partial<Record<CutAction['kind'], ActionUsage['category']>> = {
  cut: 'cut',
  'lead-in': 'cut',
  'lead-out': 'cut',
  overcut: 'cut',
  tab: 'cut',
  'common-line': 'cut',
  rapid: 'travel',
  pierce: 'pierce',
}

const numeric = (value: string | number | boolean | undefined): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const toUsage = (action: CutAction): ActionUsage | null => {
  const category = CATEGORY[action.kind]
  if (!category) return null
  return {
    category,
    length: actionLength(action.points, action.curve),
    feed: numeric(action.metadata?.feed),
    dwell: numeric(action.metadata?.dwell),
  }
}

const outlineArea = (part: PlacedPart): number => {
  const [outer, ...holes] = part.outlines
  const gross = outer ? computeArea(outer) : 0
  return gross - holes.reduce((total, hole) => total + computeArea(hole), 0)
}

const contourAreas = (layout: CutLayout | undefined, keys: readonly string[]): Map<string, number> => {
  const areas = new Map<string, number>()
  if (!layout) return areas
  const { resolve } = linkActions({ partKeys: keys, layout, actions: [] })
  for (const contour of layout.contours) {
    const key = resolve(contour.partId, undefined)
    if (key === undefined) continue
    const sign = contour.isOuter ? 1 : -1
    areas.set(key, (areas.get(key) ?? 0) + sign * Math.abs(contour.shape.area))
  }
  return areas
}

const plansOf = (request: CostRequest): readonly CutPlan[] =>
  request.cutPlan?.plans ?? (request.cutPlan?.plan ? [request.cutPlan.plan] : [])

const notice = (severity: CostNotice['severity'], code: CostNotice['code'], message: string, extra: Partial<CostNotice> = {}): CostNotice =>
  ({ severity, code, message, ...extra })

const areaNotice = (part: PlacedPart, netArea: number, fromLayout: boolean): CostNotice[] => {
  const notices: CostNotice[] = []
  if (!fromLayout) notices.push(notice('info', 'AREA_WITHOUT_HOLES', costMessages.areaWithoutHoles(part.key), { partKey: part.key, sheetId: part.sheetId }))
  if (!fromLayout && part.approximate) notices.push(notice('warning', 'PART_AREA_APPROXIMATE', costMessages.partAreaApproximate(part.key), { partKey: part.key, sheetId: part.sheetId }))
  if (netArea <= EPSILON) notices.push(notice('warning', 'PART_WITHOUT_AREA', costMessages.partWithoutArea(part.key), { partKey: part.key, sheetId: part.sheetId }))
  return notices
}

const collectSheet = (
  stock: StockItem,
  parts: readonly PlacedPart[],
  plan: CutPlan | undefined,
  request: CostRequest,
  areas: ReadonlyMap<string, number>,
): { usage: SheetUsage; notices: CostNotice[] } => {
  const notices: CostNotice[] = []
  const records = parts.map<PartUsageRecord>((part) => {
    const fromLayout = areas.has(part.key)
    const netArea = fromLayout ? (areas.get(part.key) as number) : outlineArea(part)
    notices.push(...areaNotice(part, netArea, fromLayout))
    return { key: part.key, shapeId: part.shapeId, instanceIndex: part.instanceIndex, sheetId: stock.id, netArea, actions: [] }
  })
  const unallocated: ActionUsage[] = []
  if (plan) {
    const link = linkActions({ partKeys: records.map((r) => r.key), layout: request.layout, actions: plan.actions })
    plan.actions.forEach((action, index) => {
      const usage = toUsage(action)
      if (!usage) return
      const key = link.partKeyByAction[index]
      const owner = records.find((record) => record.key === key)
      if (owner) owner.actions.push(usage)
      else unallocated.push(usage)
    })
    for (const finding of link.unresolved) {
      const unknown = finding.kind === 'unknown-part'
      notices.push(notice('warning', unknown ? 'UNKNOWN_PART' : 'UNLINKED_ACTION',
        unknown ? costMessages.unknownPart(finding.reference) : costMessages.unlinkedAction(finding.reference, finding.actionIndex),
        { sheetId: stock.id }))
    }
    for (const record of records) {
      if (!record.actions.some((a) => a.category === 'cut')) {
        notices.push(notice('warning', 'PART_WITHOUT_CUTTING', costMessages.partWithoutCutting(record.key), { partKey: record.key, sheetId: stock.id }))
      }
    }
  }
  return { usage: { sheetId: stock.id, kind: stock.kind, parts: records, unallocated }, notices }
}

const placementNotices = (findings: ReturnType<typeof placedParts>['findings']): CostNotice[] =>
  findings
    .filter((finding) => finding.kind === 'sheet-unresolved')
    .map((finding) => notice('warning', 'PLACEMENT_SHEET_UNRESOLVED', costMessages.placementSheetUnresolved(finding.key), { partKey: finding.key }))

const collectLayout = (request: CostRequest, layout: ArtifactLayout, plans: readonly CutPlan[]) => {
  const stocks = layout.sheets as StockItem[]
  const placed = placedParts(layout, stocks)
  const keys = [...placed.partsBySheet.values()].flat().map((part) => part.key)
  const areas = contourAreas(request.layout, keys)
  const sheets: SheetUsage[] = []
  const notices: CostNotice[] = placementNotices(placed.findings)
  for (const stock of stocks) {
    const result = collectSheet(stock, placed.partsBySheet.get(stock.id) ?? [], plans.find((p) => p.sheetId === stock.id), request, areas)
    sheets.push(result.usage)
    notices.push(...result.notices)
  }
  for (const plan of plans) {
    if (!stocks.some((stock) => stock.id === plan.sheetId)) {
      notices.push(notice('warning', 'PLAN_SHEET_MISSING', costMessages.planSheetMissing(plan.sheetId), { sheetId: plan.sheetId }))
    }
  }
  return { sheets, notices }
}

/**
 * Measures, for every placed part, its net area and the usage of the actions linked to it, and
 * gathers the actions no part owns per sheet. Nothing is recomputed that the artifact or the cut
 * plan already carries, and the request is never mutated.
 *
 * @param request - Artifact, optional layout and cut plan, and the cost model.
 * @returns Usage per sheet and part, notices, and whether a cut plan was present.
 */
export function collectUsage(request: CostRequest): UsageResult {
  const layout = request.artifact.layout
  const plans = plansOf(request)
  const planPresent = plans.length > 0
  if (!layout) return { sheets: [], notices: [], planPresent }
  const { sheets, notices } = collectLayout(request, layout, plans)
  if (!planPresent) notices.push(notice('warning', 'NO_CUT_PLAN', costMessages.noCutPlan()))
  return { sheets, notices, planPresent }
}
