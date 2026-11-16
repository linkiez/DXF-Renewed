type Pt = { x: number; y: number }

interface BrowserReviewInput {
  artifact: Record<string, unknown>
  cutPlan?: Record<string, unknown>
}

const HEX = (seed: string): string => seed.repeat(64).slice(0, 64)

const box = (x: number, y: number, size: number) => ({
  minX: x, minY: y, maxX: x + size, maxY: y + size, width: size, height: size,
})

const ringOf = (x: number, y: number, size: number): Pt[] => [
  { x, y }, { x: x + size, y }, { x: x + size, y: y + size }, { x, y: y + size }, { x, y },
]

const sheetOf = (id: string, width: number, height: number) => ({ id, kind: 'sheet', width, height })

const artifactOf = (sheets: ReturnType<typeof sheetOf>[], placements: unknown[], extra: Record<string, unknown> = {}) => ({
  contractVersion: 1,
  correlation: { orderId: 'order-1', revisionId: 'rev-1', requestId: 'req-1' },
  status: 'complete',
  snapshots: {
    machine: { id: 'machine-1', revision: '1', capabilities: {} },
    stock: sheets,
    processProfile: { id: 'profile-1', revision: '1', settings: {} },
  },
  layout: {
    placements,
    sheets,
    utilization: 62.5,
    wasteArea: 3750,
    totalArea: 10000,
    unplaced: [],
    budget: { iterations: 1 },
    seed: 42,
    edgeClearance: 0,
    partToPartClearance: 0,
  },
  warnings: [],
  rejections: [],
  unplaced: [],
  overrides: {},
  inputDigest: { algorithm: 'sha256', value: HEX('a') },
  outputDigest: { algorithm: 'sha256', value: HEX('b') },
  ...extra,
})

const partsOn = (sheetId: string, first: number, count: number, columns: number, holes = false) => {
  const placements: unknown[] = []
  const actions: Record<string, unknown>[] = []
  let last: Pt = { x: 0, y: 0 }
  for (let index = 0; index < count; index += 1) {
    const serial = first + index
    const x = 2 + (index % columns) * 24
    const y = 2 + Math.floor(index / columns) * 24
    const ring = ringOf(x, y, 20)
    const ids = { partId: `part-${serial}`, contourId: `part-${serial}-outer` }
    placements.push({
      shapeId: `part-${serial}`, x, y, rotation: 0, sheetId, instanceIndex: 0,
      bbox: box(x, y, 20), transformedVertices: ring,
    })
    if (holes) {
      const hole = ringOf(x + 7, y + 7, 6)
      const holeIds = { partId: `part-${serial}`, contourId: `part-${serial}-hole` }
      actions.push(
        { kind: 'rapid', points: [last, { x: x + 5, y: y + 7 }], ...holeIds },
        { kind: 'pierce', points: [{ x: x + 5, y: y + 7 }], ...holeIds },
        { kind: 'lead-in', points: [{ x: x + 5, y: y + 7 }, hole[0]], ...holeIds },
        { kind: 'cut', points: hole, ...holeIds, metadata: { feed: 900, power: 70 } },
        { kind: 'lead-out', points: [hole[4], { x: x + 5, y: y + 7 }], ...holeIds },
      )
      last = { x: x + 5, y: y + 7 }
    }
    actions.push(
      { kind: 'rapid', points: [last, { x: x - 2, y }], ...ids },
      { kind: 'pierce', points: [{ x: x - 2, y }], ...ids },
      { kind: 'lead-in', points: [{ x: x - 2, y }, ring[0]], ...ids },
      { kind: 'cut', points: ring, ...ids, metadata: { feed: 1200, power: 80 } },
      { kind: 'lead-out', points: [ring[4], { x: x - 2, y }], ...ids },
    )
    last = { x: x - 2, y }
  }
  actions.push({ kind: 'end', points: [last] })
  return { placements, actions }
}

const planOf = (sheetId: string, actions: Record<string, unknown>[]) => ({
  sheetId,
  actions,
  stats: {
    cutLength: 0,
    rapidLength: 0,
    pierceCount: actions.filter((a) => a.kind === 'pierce').length,
    tabCount: 0,
  },
  baselineRapidLength: 0,
  optimizedRapidLength: 0,
})

const resultOf = (plans: ReturnType<typeof planOf>[]) => ({
  valid: true,
  plan: plans[0],
  plans,
  problems: [],
  metrics: { baselineRapidLength: 0, optimizedRapidLength: 0, improvementRatio: 0 },
})

/** Two sheets with two parts each and a hand-built cut plan. */
export const smallInput = (): BrowserReviewInput => {
  const sheets = [sheetOf('sheet-1', 100, 100), sheetOf('sheet-2', 100, 100)]
  const one = partsOn('sheet-1', 1, 2, 4)
  const two = partsOn('sheet-2', 3, 2, 4)
  return {
    artifact: artifactOf(sheets, [...one.placements, ...two.placements]),
    cutPlan: resultOf([planOf('sheet-1', one.actions), planOf('sheet-2', two.actions)]),
  }
}

/** Small input plus an unplaced item, a warning and a rejection. */
export const partialInput = (): BrowserReviewInput => {
  const base = smallInput()
  return {
    ...base,
    artifact: {
      ...base.artifact,
      status: 'partial',
      warnings: [{ severity: 'warning', code: 'LOW_YIELD', message: 'Aproveitamento abaixo do esperado' }],
      rejections: [{ severity: 'rejection', code: 'NO_STOCK', message: 'Sem chapa compatível para part-9' }],
      unplaced: [{ itemId: 'part-9', quantity: 1, reasonCode: 'UNPLACED', reason: 'Não cabe em nenhuma chapa' }],
    },
  }
}

/** Rejected artifact without layout. */
export const rejectedInput = (): BrowserReviewInput => ({
  artifact: {
    ...smallInput().artifact,
    status: 'rejected',
    layout: null,
    rejections: [{ severity: 'rejection', code: 'NO_STOCK', message: 'Nenhuma chapa disponível' }],
  },
})

/** Seeded grid of `count` parts with holes on one sheet and its plan (default 500). */
export const referenceInput = (count = 500): BrowserReviewInput => {
  const columns = 25
  const rows = Math.ceil(count / columns)
  const sheets = [sheetOf('sheet-1', columns * 24 + 4, rows * 24 + 4)]
  const built = partsOn('sheet-1', 1, count, columns, true)
  return {
    artifact: artifactOf(sheets, built.placements),
    cutPlan: resultOf([planOf('sheet-1', built.actions)]),
  }
}
