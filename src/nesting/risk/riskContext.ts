import type { CutAction, CutActionKind, CutLayout, CutPlan } from '../cutPath/types'
import { actionCategory } from '../linking/actionCategory'
import type { ActionCategory } from '../linking/actionCategory'
import type { ActionSpeeds } from '../linking/actionDuration'
import { actionLength } from '../linking/actionLength'
import { sampleActionPath } from '../linking/actionPath'
import { linkActions } from '../linking/linkActions'
import { placedParts } from '../linking/placedParts'
import { computeArea, computeBoundingBox } from '../polygonUtils'
import type { BoundingBox, Point2D, StockItem } from '../types'
import { actionSchedule } from './actionTimes'
import type { RiskCategory, RiskRequest, RiskRule } from './types'

/** Limits of the rules in SI units; a group is present only when every value it needs was supplied. */
export interface RiskLimits {
  heat?: { radius: number; windowSeconds: number; maxCutLength: number }
  web?: { minimum: number }
  loose?: { maxArea: number }
  strike?: { clearance: number }
  critical?: number
}

/** One placed part reduced to what the rules need. */
export interface ContextPart {
  key: string
  sheetId: string
  outline: Point2D[]
  bbox: BoundingBox
  /** Net area in geometry units squared. */
  area: number
}

/** One planned action reduced to what the rules need. */
export interface ContextAction {
  /** Index within the plan of its sheet. */
  index: number
  sheetId: string
  kind: CutActionKind
  category: ActionCategory | undefined
  path: Point2D[]
  length: number
  start: number | null
  end: number | null
  partKey?: string
}

/** Everything the rules read, derived once from a request. */
export interface RiskContext {
  unitsPerMeter: number
  limits: RiskLimits
  rules: RiskRule[]
  sheets: ReadonlyMap<string, StockItem>
  parts: ContextPart[]
  partsBySheet: ReadonlyMap<string, ContextPart[]>
  actions: ContextAction[]
  actionsBySheet: ReadonlyMap<string, ContextAction[]>
}

type ArtifactLayout = NonNullable<RiskRequest['artifact']['layout']>

const speedsOf = (request: RiskRequest): ActionSpeeds => ({
  cutting: request.profile.speeds?.cutting?.value,
  rapid: request.profile.speeds?.rapid?.value,
  pierceDwellSeconds: request.profile.speeds?.pierceDwellSeconds?.value,
})

type Getter = (profile: RiskRequest['profile']) => number | undefined

const GETTERS = {
  'speeds.cutting': (p) => p.speeds?.cutting?.value,
  'speeds.rapid': (p) => p.speeds?.rapid?.value,
  'speeds.pierceDwellSeconds': (p) => p.speeds?.pierceDwellSeconds?.value,
  'heat.radius': (p) => p.heat?.radius?.value,
  'heat.windowSeconds': (p) => p.heat?.windowSeconds?.value,
  'heat.maxCutLength': (p) => p.heat?.maxCutLength?.value,
  'web.minimum': (p) => p.web?.minimum?.value,
  'loosePart.maxArea': (p) => p.loosePart?.maxArea?.value,
  'headStrike.clearance': (p) => p.headStrike?.clearance?.value,
} satisfies Record<string, Getter>

type Path = keyof typeof GETTERS

const NEEDS: Record<RiskCategory, readonly Path[]> = {
  heat: ['speeds.cutting', 'speeds.rapid', 'speeds.pierceDwellSeconds', 'heat.radius', 'heat.windowSeconds', 'heat.maxCutLength'],
  'thin-web': ['web.minimum'],
  'loose-part': ['loosePart.maxArea'],
  'head-strike': ['headStrike.clearance', 'loosePart.maxArea'],
}

const CATEGORIES = Object.keys(NEEDS) as RiskCategory[]

const valueOf = (profile: RiskRequest['profile'], path: Path): number => GETTERS[path](profile) as number

const limitsOf = (profile: RiskRequest['profile'], assessable: ReadonlySet<RiskCategory>): RiskLimits => {
  const v = (path: Path): number => valueOf(profile, path)
  const limits: RiskLimits = { critical: profile.criticalFactor?.value }
  if (assessable.has('heat')) limits.heat = { radius: v('heat.radius'), windowSeconds: v('heat.windowSeconds'), maxCutLength: v('heat.maxCutLength') }
  if (assessable.has('thin-web')) limits.web = { minimum: v('web.minimum') }
  if (assessable.has('loose-part')) limits.loose = { maxArea: v('loosePart.maxArea') }
  if (assessable.has('head-strike')) limits.strike = { clearance: v('headStrike.clearance') }
  return limits
}

const rulesAndLimits = (request: RiskRequest): { rules: RiskRule[]; limits: RiskLimits } => {
  const profile = request.profile
  const rules = CATEGORIES.map((category): RiskRule => {
    const missing = NEEDS[category].filter((path) => GETTERS[path](profile) === undefined)
    return { category, assessable: missing.length === 0, missing: [...missing] }
  })
  const assessable = new Set(rules.filter((rule) => rule.assessable).map((rule) => rule.category))
  return { rules, limits: limitsOf(profile, assessable) }
}

const netAreas = (layout: CutLayout | undefined, keys: readonly string[]): Map<string, number> => {
  const areas = new Map<string, number>()
  if (!layout) return areas
  const { resolve } = linkActions({ partKeys: keys, layout, actions: [] })
  for (const contour of layout.contours) {
    const key = resolve(contour.partId, undefined)
    if (key !== undefined) areas.set(key, (areas.get(key) ?? 0) + (contour.isOuter ? 1 : -1) * Math.abs(contour.shape.area))
  }
  return areas
}

const partsOf = (layout: ArtifactLayout, request: RiskRequest): ContextPart[] => {
  const placed = [...placedParts(layout, layout.sheets as StockItem[]).partsBySheet.values()].flat()
  const areas = netAreas(request.layout, placed.map((part) => part.key))
  return placed.map((part) => ({
    key: part.key,
    sheetId: part.sheetId,
    outline: part.outlines[0],
    bbox: computeBoundingBox(part.outlines[0]),
    area: areas.get(part.key) ?? Math.abs(computeArea(part.outlines[0])),
  }))
}

const plansOf = (request: RiskRequest): readonly CutPlan[] => request.cutPlan.plans ?? (request.cutPlan.plan ? [request.cutPlan.plan] : [])

const actionsOf = (request: RiskRequest, partKeys: readonly string[]): ContextAction[] =>
  plansOf(request).flatMap((plan) => {
    const linked = linkActions({ partKeys, layout: request.layout, actions: plan.actions as readonly CutAction[] })
    const paths = plan.actions.map((action) => sampleActionPath(action.points, action.curve))
    const lengths = plan.actions.map((action) => actionLength(action.points, action.curve))
    const time = actionSchedule(plan.actions, lengths, speedsOf(request), request.profile.geometryUnitsPerMeter)
    return plan.actions.map((action, index): ContextAction => ({
      index,
      sheetId: plan.sheetId,
      kind: action.kind,
      category: actionCategory(action.kind),
      path: paths[index],
      length: lengths[index],
      start: time.starts[index],
      end: time.ends[index],
      partKey: linked.partKeyByAction[index],
    }))
  })

const grouped = <T extends { sheetId: string }>(items: readonly T[]): Map<string, T[]> => {
  const groups = new Map<string, T[]>()
  for (const item of items) groups.set(item.sheetId, [...(groups.get(item.sheetId) ?? []), item])
  return groups
}

/**
 * Derives, once, everything the risk rules read: the placed parts with their net area, the planned
 * actions with their sampled paths, lengths, plan times and owning parts, the limits in SI units and
 * which rules can be assessed.
 *
 * @param request - Artifact, optional cut layout, cut plan and risk profile; never mutated.
 * @returns The context.
 */
export function buildRiskContext(request: RiskRequest): RiskContext {
  const layout = request.artifact.layout as ArtifactLayout
  const parts = partsOf(layout, request)
  const actions = actionsOf(request, parts.map((part) => part.key))
  const { rules, limits } = rulesAndLimits(request)
  return {
    unitsPerMeter: request.profile.geometryUnitsPerMeter,
    limits,
    rules,
    sheets: new Map((layout.sheets as StockItem[]).map((sheet) => [sheet.id, sheet])),
    parts,
    partsBySheet: grouped(parts),
    actions,
    actionsBySheet: grouped(actions),
  }
}
