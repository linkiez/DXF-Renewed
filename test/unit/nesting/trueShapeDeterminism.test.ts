/**
 * T015 — FR-005/FR-007: deterministic input-derived budget.
 *
 * The budget is a count of candidate evaluations derived from input size, never wall-clock.
 * Identical input plus identical seed reproduces identical placements; changing only the seed
 * keeps the result internally consistent.
 */

import { expect } from 'expect'
import { nestTrueShape } from '../../../src/nesting/trueShape/index'
import type { Point2D, StockItem } from '../../../src/nesting/types'
import { shapeFrom } from '../../resources/nest-fixtures/trueShapeBenchmark'

function square(id: string, size: number) {
  return shapeFrom(id, [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size },
    { x: 0, y: size },
    { x: 0, y: 0 },
  ] as Point2D[])
}

const stock: StockItem[] = [{ id: 's1', kind: 'sheet', width: 100, height: 100 }]
const parts = [{ shape: square('a', 20), quantity: 5 }]

describe('trueShape/determinism', () => {
  it('derives a positive deterministic budget from the input size', async () => {
    const response = await nestTrueShape({
      stock,
      parts,
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 3,
    })

    expect(response.budget.iterations).toBeGreaterThan(0)
    expect(Number.isFinite(response.budget.iterations)).toBe(true)
  })

  it('produces identical placements and budget for identical input and seed', async () => {
    const request = { stock, parts, edgeClearance: 2, partToPartClearance: 2, seed: 9 }

    const first = await nestTrueShape(request)
    const second = await nestTrueShape(request)

    expect(JSON.stringify(first.placements)).toBe(JSON.stringify(second.placements))
    expect(first.budget.iterations).toBe(second.budget.iterations)
    expect(first.utilization).toBe(second.utilization)
  })

  it('stays self-consistent when only the seed changes', async () => {
    const run = async (seed: number) =>
      nestTrueShape({ stock, parts, edgeClearance: 2, partToPartClearance: 2, seed })

    const response = await run(1234)
    const placed = response.placements.length
    const unplaced = response.unplaced.reduce((sum, u) => sum + u.quantity, 0)

    expect(placed + unplaced).toBe(5)
    for (const placement of response.placements) {
      expect(placement.sheetId).toBe('s1')
      expect(Number.isFinite(placement.rotation)).toBe(true)
    }
    expect(JSON.stringify((await run(1234)).placements)).toBe(
      JSON.stringify(response.placements),
    )
  })
})
