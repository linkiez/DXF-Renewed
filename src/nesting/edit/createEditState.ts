import { transformedContour } from '../cutPath/geometry'
import type { CutLayout } from '../cutPath/types'
import { ERP_CONTRACT_VERSION } from '../erp/types'
import { erpNestingArtifactSchema } from '../erp/schemas'
import { linkActions } from '../linking/linkActions'
import { placedParts } from '../linking/placedParts'
import type { PlacedPart } from '../linking/placedParts'
import { computeBoundingBox } from '../polygonUtils'
import type { CompoundPlacement, Placement, StockItem } from '../types'
import { createNeighbourIndex } from '../linking/neighbourIndex'
import { freshness } from './freshness'
import { notice } from './notice'
import type {
  CreateEditStateResult, EditInput, EditNotice, EditState, WorkingLayout, WorkingPart,
} from './types'

const DEFAULT_LOG_LENGTH = 100
const FALLBACK_CELL = 50
const RESULTS = { plan: '', cost: '', validation: '', risk: '' } as const

type ArtifactLayout = NonNullable<EditInput['artifact']['layout']>

const limitProblem = (input: EditInput): string | null => {
  const max = input.limits?.maxLogLength
  return max !== undefined && (!Number.isInteger(max) || max < DEFAULT_LOG_LENGTH) ? 'limits.maxLogLength' : null
}

const grainProblem = (input: EditInput): string | null => {
  const rules = Object.entries(input.constraints?.parts ?? {})
  const missing = rules.find(([, rule]) => rule.grainLocked && rule.grainAngle === undefined)
  return missing ? `constraints.parts.${missing[0]}.grainAngle` : null
}

const artifactRefusal = (input: EditInput): EditNotice | null => {
  const parsed = erpNestingArtifactSchema.safeParse(input.artifact)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return notice('error', 'INVALID_ARTIFACT', { detail: issue ? issue.path.join('.') || 'artifact' : 'artifact' })
  }
  if (input.artifact.contractVersion !== ERP_CONTRACT_VERSION) {
    return notice('error', 'UNSUPPORTED_CONTRACT_VERSION', { value: input.artifact.contractVersion, limit: ERP_CONTRACT_VERSION })
  }
  const layout = input.artifact.layout
  return !layout || layout.placements.length + (layout.compoundPlacements?.length ?? 0) === 0 ? notice('error', 'NO_LAYOUT') : null
}

const refusal = (input: EditInput): EditNotice | null => {
  const refused = artifactRefusal(input)
  if (refused) return refused
  const problem = limitProblem(input) ?? grainProblem(input)
  return problem ? notice('error', 'INVALID_INPUT', { detail: problem }) : null
}

const holesFromLayout = (layout: CutLayout, keys: readonly string[]): Map<string, { ids: string[]; rings: WorkingPart['outlines'] }> => {
  const { resolve } = linkActions({ partKeys: keys, layout, actions: [] })
  const found = new Map<string, { ids: string[]; rings: WorkingPart['outlines'] }>()
  const ordered = [...layout.contours].sort((a, b) => Number(b.isOuter) - Number(a.isOuter))
  for (const contour of ordered) {
    const key = resolve(contour.partId, undefined)
    if (key === undefined) continue
    const entry = found.get(key) ?? { ids: [], rings: [] }
    if (!contour.isOuter && entry.ids.length === 0) continue
    entry.ids.push(contour.id)
    if (!contour.isOuter) entry.rings.push(transformedContour(contour))
    found.set(key, entry)
  }
  return found
}

const toWorkingPart = (
  part: PlacedPart,
  layout: ArtifactLayout,
  holes: ReturnType<typeof holesFromLayout> | null,
): WorkingPart => {
  const compoundIndex = (layout.compoundPlacements ?? []).indexOf(part.placement as CompoundPlacement)
  const source: WorkingPart['source'] = compoundIndex >= 0
    ? { kind: 'compound', index: compoundIndex }
    : { kind: 'placement', index: layout.placements.indexOf(part.placement as Placement) }
  const layoutHoles = compoundIndex < 0 ? holes?.get(part.key) : undefined
  return {
    key: part.key,
    shapeId: part.shapeId,
    instanceIndex: part.instanceIndex,
    sheetId: part.sheetId,
    placement: part.placement,
    outlines: [...part.outlines, ...(layoutHoles?.rings ?? [])],
    approximate: part.approximate,
    mirrored: false,
    contourIds: layoutHoles?.ids ?? [],
    source,
    holesKnown: compoundIndex >= 0 || holes !== null,
  }
}

const orderOf = (part: WorkingPart): number => (part.source.kind === 'placement' ? 0 : 1_000_000) + part.source.index

const buildWorking = (input: EditInput, layout: ArtifactLayout): { working: WorkingLayout; parts: WorkingPart[]; findings: ReturnType<typeof placedParts>['findings'] } => {
  const sheets = layout.sheets as StockItem[]
  const placed = placedParts(layout, sheets)
  const keys = [...placed.partsBySheet.values()].flatMap((list) => list.map((part) => part.key))
  const holes = input.layout ? holesFromLayout(input.layout, keys) : null
  const parts = [...placed.partsBySheet.values()].flat().map((part) => toWorkingPart(part, layout, holes)).sort((a, b) => orderOf(a) - orderOf(b))
  const cell = parts.length === 0 ? FALLBACK_CELL : Math.max(1, parts.reduce((sum, p) => sum + Math.max(p.placement.bbox.width, p.placement.bbox.height), 0) / parts.length)
  const index = new Map(sheets.map((sheet) => [
    sheet.id,
    createNeighbourIndex(parts.filter((p) => p.sheetId === sheet.id).map((p) => ({ key: p.key, bbox: computeBoundingBox(p.outlines[0]) })), cell),
  ]))
  const working: WorkingLayout = {
    parts: new Map(parts.map((part) => [part.key, part])),
    order: parts.map((part) => part.key),
    sheets: new Map(sheets.map((sheet) => [sheet.id, sheet])),
    index,
  }
  return { working, parts, findings: placed.findings }
}

const notices = (parts: readonly WorkingPart[], findings: ReturnType<typeof placedParts>['findings']): EditNotice[] => [
  ...parts.filter((part) => part.approximate).map((part) => notice('warning', 'APPROXIMATE_OUTLINE', { partKey: part.key })),
  ...findings.filter((finding) => finding.kind === 'sheet-unresolved').map((finding) => notice('warning', 'PLACEMENT_SHEET_UNRESOLVED', { partKey: finding.key })),
]

/**
 * Starts an edit session from a reviewed artifact.
 *
 * The artifact is validated with the ERP schema; an invalid artifact, an unsupported contract
 * version, an artifact without placements or invalid limits or constraints give no state and an
 * error notice. Nothing is mutated and nothing is stored.
 *
 * @param input - Artifact, optional cut layout and plan, constraints and limits.
 * @returns The session state, or `null` with the reasons.
 * @example
 * ```typescript
 * const { state, notices } = createEditState({ artifact, layout, constraints })
 * ```
 */
export function createEditState(input: EditInput): CreateEditStateResult {
  const refused = refusal(input)
  if (refused) return { state: null, notices: [refused] }
  const layout = input.artifact.layout as ArtifactLayout
  const { working, parts, findings } = buildWorking(input, layout)
  const state: EditState = {
    input,
    maxLogLength: input.limits?.maxLogLength ?? DEFAULT_LOG_LENGTH,
    edits: [],
    cursor: 0,
    revision: 0,
    freshness: freshness(RESULTS, ''),
    computedFor: RESULTS,
    working,
    baseWorking: working,
  }
  return { state, notices: notices(parts, findings) }
}
