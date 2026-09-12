/**
 * T031 — quickstart.md scenario walkthrough (integration).
 *
 * Exercises every scenario in `specs/002-true-shape-nesting/quickstart.md`, including the
 * modified-seed consistency check, end to end through the public `nestTrueShape` entry point.
 */

import { expect } from 'expect'
import { nestTrueShape } from '../../../src/nesting'
import type { PartRequest, StockItem } from '../../../src/nesting'
import { isWithinBounds } from '../../../src/nesting/trueShape/bounds'
import { isSeparated } from '../../../src/nesting/trueShape/separation'
import {
  buildBenchmarkParts,
  buildBenchmarkStock,
  shapeFrom,
} from '../../resources/nest-fixtures/trueShapeBenchmark'

const closed = (pts: Array<[number, number]>) => pts.map(([x, y]) => ({ x, y }))
const edgeClearance = 2
const partToPartClearance = 2
const sheet: StockItem = { id: 's1', kind: 'sheet', width: 200, height: 200 }
const parts: PartRequest[] = [
  {
    shape: shapeFrom(
      'l',
      closed([[0, 0], [60, 0], [60, 20], [20, 20], [20, 60], [0, 60], [0, 0]]),
    ),
    quantity: 2,
  },
  { shape: shapeFrom('r', closed([[0, 0], [40, 0], [40, 30], [0, 30], [0, 0]])), quantity: 2 },
]

describe('quickstart — true-shape nesting scenarios', () => {
  it('scenario 1 — irregular parts fit with no overlap and nothing unplaced', () => {
    const response = nestTrueShape({
      stock: [sheet],
      parts,
      edgeClearance,
      partToPartClearance,
      seed: 1,
    })

    expect(response.unplaced).toEqual([])
    for (const placement of response.placements) {
      expect(
        isWithinBounds(placement.transformedVertices ?? [], sheet, edgeClearance),
      ).toBe(true)
    }
    for (let i = 0; i < response.placements.length; i++) {
      for (let j = i + 1; j < response.placements.length; j++) {
        expect(
          isSeparated(
            response.placements[i].transformedVertices ?? [],
            response.placements[j].transformedVertices ?? [],
            partToPartClearance,
          ),
        ).toBe(true)
      }
    }
  })

  it('scenario 2 — deterministic tie-break, self-consistent seed change, threshold exclusion', () => {
    const request = { stock: [sheet], parts, edgeClearance, partToPartClearance, seed: 42 }
    const first = nestTrueShape(request)
    const second = nestTrueShape(request)
    expect(JSON.stringify(first.placements)).toBe(JSON.stringify(second.placements))

    const changed = nestTrueShape({ ...request, seed: 43 })
    expect(changed.utilization).toBeGreaterThan(0)

    const withRemnant = nestTrueShape({
      stock: [sheet, { id: 'tiny', kind: 'remnant', width: 5, height: 5 }],
      parts,
      edgeClearance,
      partToPartClearance,
      seed: 42,
      remnantThreshold: 1000,
    })
    expect(withRemnant.sheets.map((s) => s.id)).not.toContain('tiny')
  })

  it('scenario 3 — grain-locked rotations and missing grainAngle', () => {
    const grain = shapeFrom('g', closed([[0, 0], [40, 0], [40, 25], [0, 25], [0, 0]]))
    const response = nestTrueShape({
      stock: [sheet],
      parts: [{ shape: grain, quantity: 2, grainLocked: true, grainAngle: 0 }],
      edgeClearance,
      partToPartClearance,
      seed: 7,
    })

    expect(response.unplaced).toEqual([])
    for (const placement of response.placements) {
      expect([0, 180]).toContain(placement.rotation)
    }

    const missing = nestTrueShape({
      stock: [sheet],
      parts: [{ shape: grain, quantity: 1, grainLocked: true }],
      edgeClearance,
      partToPartClearance,
      seed: 7,
    })
    expect(missing.placements).toHaveLength(0)
    expect(missing.unplaced.length).toBeGreaterThan(0)
  })

  it('scenario 4 — a non-fitting part reports quantity and reason without throwing', () => {
    const huge = shapeFrom(
      'huge',
      closed([[0, 0], [500, 0], [500, 500], [0, 500], [0, 0]]),
    )
    const response = nestTrueShape({
      stock: [sheet],
      parts: [{ shape: huge, quantity: 2 }],
      edgeClearance,
      partToPartClearance,
      seed: 1,
    })

    expect(response.placements).toHaveLength(0)
    expect(response.unplaced[0].quantity).toBe(2)
    expect(response.unplaced[0].reason.length).toBeGreaterThan(0)
  })

  it('scenario 5 — 100-part benchmark within 2 s and at least 85% material use', () => {
    const started = Date.now()
    const response = nestTrueShape({
      stock: buildBenchmarkStock(),
      parts: buildBenchmarkParts().map((shape) => ({ shape, quantity: 1 })),
      edgeClearance,
      partToPartClearance,
      seed: 20260912,
    })
    const elapsed = Date.now() - started

    expect(elapsed).toBeLessThan(2000)
    expect(response.utilization).toBeGreaterThanOrEqual(85)
    expect(response.unplaced).toEqual([])
  })
})
