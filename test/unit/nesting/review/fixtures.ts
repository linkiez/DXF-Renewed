import { planCutPath } from '../../../../src/nesting'
import type {
  CutAction,
  CutLayout,
  CutPlan,
  CutPlanResult,
  NestResponse,
  Placement,
  StockItem,
} from '../../../../src/nesting'
import { createNestingArtifact } from '../../../../src/nesting/erp/artifact'
import type { ErpNestingArtifact, ErpNestingRequest } from '../../../../src/nesting/erp/types'
import type { ReviewInput } from '../../../../src/nesting/review/types'
import { contour, placementFor, profile, square } from '../cutPath/fixtures'

export const deepFreeze = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child)
  }
  return value
}

const stockSheet = (id: string, width = 100, height = 100): StockItem => ({
  id,
  kind: 'sheet',
  width,
  height,
})

const request = (stock: StockItem[]): ErpNestingRequest => ({
  contractVersion: 1,
  correlation: { orderId: 'order-1', revisionId: 'rev-1', requestId: 'req-1' },
  job: {
    parts: [],
    stock,
    machine: { id: 'machine-1', revision: '1', capabilities: {} },
    processProfile: { id: 'profile-1', revision: '1', settings: {} },
    nesting: { edgeClearance: 0, partToPartClearance: 0 },
  },
  seed: 42,
})

const nestResponse = (
  sheets: StockItem[],
  placements: Placement[],
  unplaced: NestResponse['unplaced'] = [],
): NestResponse => ({
  placements,
  sheets,
  utilization: 62.5,
  wasteArea: 3750,
  totalArea: 10000,
  unplaced,
  budget: { iterations: 1 },
  seed: 42,
  edgeClearance: 0,
  partToPartClearance: 0,
})

/** Layout with one outer contour and one hole contour per part, spread over the given sheets. */
export const buildLayout = (
  sheets: StockItem[],
  partsPerSheet: number,
  options: { size?: number; pitch?: number; columns?: number } = {},
): { layout: CutLayout; placements: Placement[] } => {
  const size = options.size ?? 20
  const pitch = options.pitch ?? 24
  const columns = options.columns ?? 4
  const contours: CutLayout['contours'][number][] = []
  const placements: Placement[] = []
  let serial = 0
  for (const stock of sheets) {
    for (let index = 0; index < partsPerSheet; index += 1) {
      serial += 1
      const x = 2 + (index % columns) * pitch
      const y = 2 + Math.floor(index / columns) * pitch
      const outer = square(`part-${serial}`, x, y, size)
      const hole = square(`part-${serial}-hole`, x + size / 2 - 3, y + size / 2 - 3, 6)
      const outerPlacement: Placement = { ...placementFor(outer, stock.id), instanceIndex: 0 }
      placements.push(outerPlacement)
      contours.push(
        contour(`part-${serial}-hole`, `part-${serial}`, hole, placementFor(hole, stock.id), false, `part-${serial}-outer`),
        contour(`part-${serial}-outer`, `part-${serial}`, outer, outerPlacement, true),
      )
    }
  }
  const layoutContours = contours.map((item) => ({
    ...item,
    sheetId: item.placement.sheetId as string,
  }))
  return {
    layout: { sheets, contours: layoutContours, startPoint: { x: 0, y: 0 } },
    placements,
  }
}

const withMetadata = (result: CutPlanResult): CutPlanResult => {
  const decorate = (plan: CutPlan): CutPlan => ({
    ...plan,
    actions: plan.actions.map((item) => ({
      ...item,
      metadata: item.kind === 'cut' ? { feed: 1200, power: 80 } : item.metadata,
    })),
  })
  return {
    ...result,
    plan: result.plan ? decorate(result.plan) : undefined,
    plans: result.plans?.map(decorate),
  }
}

export interface Fixture {
  input: ReviewInput
  artifact: ErpNestingArtifact
  layout: CutLayout
  cutPlan: CutPlanResult
}

/** Two sheets, two parts with holes each, planned with the real cut-path planner. */
export const smallFixture = async (): Promise<Fixture> => {
  const sheets = [stockSheet('sheet-1'), stockSheet('sheet-2')]
  const { layout, placements } = buildLayout(sheets, 2)
  const cutPlan = withMetadata(planCutPath(layout, profile({ sequence: { strategy: 'input' } })))
  const artifact = await createNestingArtifact(request(sheets), nestResponse(sheets, placements))
  return { input: { artifact, layout, cutPlan }, artifact, layout, cutPlan }
}

/** Small fixture with unplaced items, a warning and a rejection recorded in the artifact. */
export const partialFixture = async (): Promise<Fixture> => {
  const base = await smallFixture()
  const artifact: ErpNestingArtifact = {
    ...base.artifact,
    status: 'partial',
    warnings: [{ severity: 'warning', code: 'LOW_YIELD', message: 'Aproveitamento abaixo do esperado' }],
    rejections: [{ severity: 'rejection', code: 'NO_STOCK', message: 'Sem chapa compatível para part-9' }],
    unplaced: [{ itemId: 'part-9', quantity: 1, reasonCode: 'UNPLACED', reason: 'Não cabe em nenhuma chapa' }],
  }
  return { ...base, artifact, input: { ...base.input, artifact } }
}

/** Artifact and layout without a cut plan. */
export const layoutOnlyFixture = async (): Promise<Fixture> => {
  const base = await smallFixture()
  return { ...base, input: { artifact: base.artifact } }
}

/** Rejected artifact carrying no layout. */
export const rejectedFixture = async (): Promise<ReviewInput> => {
  const base = await smallFixture()
  return {
    artifact: {
      ...base.artifact,
      status: 'rejected',
      layout: null,
      rejections: [{ severity: 'rejection', code: 'NO_STOCK', message: 'Nenhuma chapa disponível' }],
    },
  }
}

/** Placements without sheetId, transformedVertices and instanceIndex. */
export const sparsePlacementFixture = async (sheetCount: 1 | 2): Promise<ReviewInput> => {
  const sheets = [stockSheet('sheet-1'), stockSheet('sheet-2')].slice(0, sheetCount)
  const { placements } = buildLayout(sheets, 2)
  const sparse = placements.map((item) => ({
    shapeId: item.shapeId,
    x: item.x,
    y: item.y,
    rotation: item.rotation,
    bbox: item.bbox,
  })) as Placement[]
  return { artifact: await createNestingArtifact(request(sheets), nestResponse(sheets, sparse)) }
}

/** Artifact carrying one compound placement. */
export const compoundFixture = async (): Promise<ReviewInput> => {
  const sheets = [stockSheet('sheet-1')]
  const { placements } = buildLayout(sheets, 1)
  const outer = placements[0]
  const holeShape = square('part-1-hole', 9, 9, 6)
  const compound = {
    shapeId: 'compound-1',
    x: outer.x,
    y: outer.y,
    rotation: 0,
    bbox: outer.bbox,
    outerPlacement: outer,
    holePlacements: [placementFor(holeShape, 'sheet-1')],
  }
  const response = { ...nestResponse(sheets, []), compoundPlacements: [compound] }
  return { artifact: await createNestingArtifact(request(sheets), response) }
}

const syntheticActions = (layout: CutLayout, sheetId: string): CutAction[] => {
  const actions: CutAction[] = []
  let last = { x: 0, y: 0 }
  for (const item of layout.contours.filter((c) => c.sheetId === sheetId)) {
    const ring = item.placement.transformedVertices as { x: number; y: number }[]
    const entry = ring[0]
    const ids = { contourId: item.id, partId: item.partId }
    actions.push({ kind: 'rapid', points: [last, entry], ...ids })
    actions.push({ kind: 'pierce', points: [entry], ...ids })
    actions.push({ kind: 'cut', points: ring, ...ids, metadata: { feed: 1200, power: 80 } })
    last = ring[ring.length - 1]
  }
  actions.push({ kind: 'end', points: [last] })
  return actions
}

/** Seeded 500-part sheet with holes and a synthetic plan (fast to build, deterministic). */
export const referenceFixture = async (partCount = 500): Promise<Fixture> => {
  const columns = 25
  const rows = Math.ceil(partCount / columns)
  const sheet = stockSheet('sheet-1', columns * 24 + 4, rows * 24 + 4)
  const { layout, placements } = buildLayout([sheet], partCount, { columns })
  const actions = syntheticActions(layout, 'sheet-1')
  const plan: CutPlan = {
    sheetId: 'sheet-1',
    actions,
    stats: {
      cutLength: 0,
      rapidLength: 0,
      pierceCount: actions.filter((a) => a.kind === 'pierce').length,
      tabCount: 0,
    },
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
  const artifact = await createNestingArtifact(request([sheet]), nestResponse([sheet], placements))
  return { input: { artifact, layout, cutPlan }, artifact, layout, cutPlan }
}
