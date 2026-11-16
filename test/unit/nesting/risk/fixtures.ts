import type { CutAction, CutLayout, CutPlan, CutPlanResult, NestableShape, Placement, Point2D, StockItem } from '../../../../src/nesting'
import { createNestingArtifact } from '../../../../src/nesting/erp/artifact'
import type { ErpNestingArtifact } from '../../../../src/nesting/erp/types'
import type { CutRiskProfile, RiskRequest } from '../../../../src/nesting/risk/types'
import { contour, placementFor, square } from '../cutPath/fixtures'
import { nestResponse, request } from '../review/fixtures'

export { deepFreeze } from '../review/fixtures'

/** Geometry is in millimeters: `geometryUnitsPerMeter` is 1000. */
export const completeRiskProfile = (): CutRiskProfile => ({
  contractVersion: 1,
  geometryUnitsPerMeter: 1000,
  speeds: { cutting: { value: 6 }, rapid: { value: 30 }, pierceDwellSeconds: { value: 0.5 } },
  heat: { radius: { value: 0.03 }, windowSeconds: { value: 60 }, maxCutLength: { value: 0.3 } },
  web: { minimum: { value: 0.002 } },
  loosePart: { maxArea: { value: 0.0001 } },
  headStrike: { clearance: { value: 0.005 } },
  criticalFactor: { value: 1.5 },
  source: 'fixture',
})

/** Removes the value at a dotted path, for example `web.minimum`. */
export const withoutLimit = (profile: CutRiskProfile, path: string): CutRiskProfile => {
  const copy = JSON.parse(JSON.stringify(profile)) as Record<string, Record<string, unknown>>
  const [group, field] = path.split('.')
  if (field === undefined) delete (copy as Record<string, unknown>)[group]
  else delete copy[group][field]
  return copy as unknown as CutRiskProfile
}

/** Replaces the value at a dotted path. */
export const withLimit = (profile: CutRiskProfile, path: string, value: unknown): CutRiskProfile => {
  const copy = JSON.parse(JSON.stringify(profile)) as Record<string, Record<string, unknown>>
  const [group, field] = path.split('.')
  if (field === undefined) (copy as Record<string, unknown>)[group] = value
  else copy[group][field] = value
  return copy as unknown as CutRiskProfile
}

export interface RiskJob {
  artifact: ErpNestingArtifact
  layout: CutLayout
  cutPlan: CutPlanResult
}

interface PartSpec {
  shape: NestableShape
  /** The part keeps a tab on its outer contour, so it is held after the cut. */
  tab?: boolean
}

const SHEET: StockItem = { id: 'sheet-1', kind: 'sheet', width: 400, height: 400 }

const actionsFor = (spec: PartSpec, from: Point2D): { actions: CutAction[]; last: Point2D } => {
  const ring = spec.shape.vertices
  const ids = { contourId: `${spec.shape.id}-outer`, partId: spec.shape.id }
  const actions: CutAction[] = [
    { kind: 'rapid', points: [from, ring[0]], ...ids },
    { kind: 'pierce', points: [ring[0]], ...ids },
    { kind: 'cut', points: ring, ...ids },
  ]
  if (spec.tab) actions.push({ kind: 'tab', points: [ring[0], ring[1]], ...ids })
  return { actions, last: ring[ring.length - 1] }
}

const buildJob = async (specs: PartSpec[]): Promise<RiskJob> => {
  const placements: Placement[] = specs.map((spec) => ({ ...placementFor(spec.shape, SHEET.id), instanceIndex: 0 }))
  const contours = specs.map((spec, index) => ({
    ...contour(`${spec.shape.id}-outer`, spec.shape.id, spec.shape, placements[index], true),
    sheetId: SHEET.id,
  }))
  const layout: CutLayout = { sheets: [SHEET], contours, startPoint: { x: 0, y: 0 } }
  const actions: CutAction[] = []
  let last: Point2D = { x: 0, y: 0 }
  for (const spec of specs) {
    const built = actionsFor(spec, last)
    actions.push(...built.actions)
    last = built.last
  }
  actions.push({ kind: 'end', points: [last] })
  const plan: CutPlan = {
    sheetId: SHEET.id,
    actions,
    stats: { cutLength: 0, rapidLength: 0, pierceCount: specs.length, tabCount: specs.filter((s) => s.tab).length },
    baselineRapidLength: 0,
    optimizedRapidLength: 0,
  }
  const cutPlan: CutPlanResult = {
    valid: true,
    plan,
    plans: [plan],
    problems: [],
    metrics: { baselineRapidLength: 0, optimizedRapidLength: 0, improvementRatio: 0 },
  }
  const artifact = await createNestingArtifact(request([SHEET]), nestResponse([SHEET], placements))
  return { artifact, layout, cutPlan }
}

const squares = (positions: [number, number][], size = 20): PartSpec[] =>
  positions.map(([x, y], index) => ({ shape: square(`part-${index + 1}`, x, y, size) }))

/** Six 20 mm squares with 4 mm gaps cut one after the other: heat accumulates. */
export const denseClusterJob = (): Promise<RiskJob> =>
  buildJob(squares([[10, 10], [34, 10], [58, 10], [10, 34], [34, 34], [58, 34]]))

/** The same six squares 100 mm apart: no accumulation. */
export const spreadJob = (): Promise<RiskJob> =>
  buildJob(squares([[10, 10], [130, 10], [250, 10], [10, 130], [130, 130], [250, 130]]))

/** Two squares 1 mm apart: a thin web. */
export const thinWebJob = (): Promise<RiskJob> => buildJob(squares([[10, 10], [31, 10]]))

/** A small 8 mm square cut first and freed early; the other parts are far away. */
export const smallPartFreedJob = (): Promise<RiskJob> =>
  buildJob([
    { shape: square('small', 100, 100, 8) },
    ...squares([[300, 300]], 40).map((spec) => ({ shape: { ...spec.shape, id: 'big-1' } as NestableShape })),
  ])

/** Small part S between B1 (right) and B2 (left): the rapid from B1 to B2 crosses S after it is freed. */
export const headStrikeJob = (): Promise<RiskJob> =>
  buildJob([
    { shape: square('small', 100, 76, 8) },
    { shape: square('big-1', 200, 80, 40) },
    { shape: square('big-2', 10, 80, 40) },
  ])

/** Same as the head strike job, but the small part keeps a tab and stays held. */
export const tabHeldJob = (): Promise<RiskJob> =>
  buildJob([
    { shape: square('small', 100, 76, 8), tab: true },
    { shape: square('big-1', 200, 80, 40) },
    { shape: square('big-2', 10, 80, 40) },
  ])

/** Four large squares far apart, cut in order: no finding. */
export const safeJob = (): Promise<RiskJob> =>
  buildJob(squares([[10, 10], [200, 10], [10, 200], [200, 200]], 60))

/** A request for a planted job with a profile. */
export const riskRequest = (job: RiskJob, profile: CutRiskProfile = completeRiskProfile()): RiskRequest => ({
  artifact: job.artifact,
  layout: job.layout,
  cutPlan: job.cutPlan,
  profile,
})
