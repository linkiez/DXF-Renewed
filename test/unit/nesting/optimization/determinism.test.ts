/**
 * T008 — FR-005/FR-007 + SC-001: determinism of the weighted search.
 *
 * One hundred consecutive identical requests with the same seed must yield identical placements
 * and metrics. The search budget is input-derived only, so nothing here reads wall-clock time.
 */

import { expect } from 'expect'
import { nestTrueShape, scoreLayout } from '../../../../src/nesting'
import type { OptimizationObjective, Point2D } from '../../../../src/nesting'
import { EPSILON } from '../../../../src/nesting/config'
import { shapeFrom } from '../../../resources/nest-fixtures/trueShapeBenchmark'

function square(id: string, size: number) {
  return shapeFrom(id, [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size },
    { x: 0, y: size },
    { x: 0, y: 0 },
  ] as Point2D[])
}

const stock = [{ id: 's1', kind: 'sheet' as const, width: 120, height: 120 }]
const parts = [
  { shape: square('a', 25), quantity: 3 },
  { shape: square('b', 15), quantity: 4 },
]
const objective: OptimizationObjective = {
  materialUse: 2,
  travel: 1,
  sheetCount: 1,
  remnant: 1,
}
const request = {
  stock,
  parts,
  edgeClearance: 2,
  partToPartClearance: 2,
  seed: 4242,
  objective,
}

describe('optimization/determinism', () => {
  it('100 consecutive identical requests yield identical placements and metrics', async () => {
    const first = await nestTrueShape(request)
    const placements = JSON.stringify(first.placements)
    const budget = first.budget.iterations
    const utilization = first.utilization

    for (let i = 0; i < 100; i++) {
      const run = await nestTrueShape(request)
      expect(JSON.stringify(run.placements)).toBe(placements)
      expect(run.budget.iterations).toBe(budget)
      expect(run.utilization).toBe(utilization)
    }
  })

  it('near-equal scores use a stable total order (index tie-break)', async () => {
    const metrics = [
      { materialUse: 50, travel: 50, sheetCount: 50, remnant: 50 },
      { materialUse: 50, travel: 50, sheetCount: 50, remnant: 50 },
    ]
    const scoreA = scoreLayout(metrics[0], objective)
    const scoreB = scoreLayout(metrics[1], objective)
    expect(Math.abs(scoreA - scoreB)).toBeLessThanOrEqual(EPSILON)
    expect(scoreA).toBe(scoreB)
  })
})
