/**
 * Nesting — True-Shape Acceptance Thresholds (T024 SC-002, T025 SC-003, T026 calibration)
 *
 * The 100-part / 5-sheet benchmark is the single corpus for both floors. SC-003 failure means the
 * budget calibration (or the search quality) is the defect — the 85% threshold does not move.
 */

import { expect } from 'expect'
import { nestTrueShape } from '../../../src/nesting/trueShape/index'
import {
  buildBenchmarkParts,
  buildBenchmarkStock,
} from '../../resources/nest-fixtures/trueShapeBenchmark'

const EDGE_CLEARANCE = 2
const PART_TO_PART_CLEARANCE = 2

describe('trueShape/thresholds', () => {
  it('SC-002: 100-part job returns within 2 seconds', async () => {
    const started = Date.now()
    const response = await nestTrueShape({
      stock: buildBenchmarkStock(),
      parts: buildBenchmarkParts().map((shape) => ({ shape, quantity: 1 })),
      edgeClearance: EDGE_CLEARANCE,
      partToPartClearance: PART_TO_PART_CLEARANCE,
      seed: 20260912,
    })
    const elapsed = Date.now() - started

    console.log(
      `      SC-002 elapsed=${elapsed}ms SC-003 utilization=${response.utilization.toFixed(2)}% placed=${response.placements.length} unplaced=${response.unplaced.length}`,
    )

    expect(elapsed).toBeLessThan(2000)
    expect(response.placements.length + response.unplaced.reduce((s, u) => s + u.quantity, 0)).toBe(100)
  })

  it('SC-003: 100-part job reaches at least 85% material use', async () => {
    const response = await nestTrueShape({
      stock: buildBenchmarkStock(),
      parts: buildBenchmarkParts().map((shape) => ({ shape, quantity: 1 })),
      edgeClearance: EDGE_CLEARANCE,
      partToPartClearance: PART_TO_PART_CLEARANCE,
      seed: 20260912,
    })

    expect(response.unplaced).toEqual([])
    expect(response.utilization).toBeGreaterThanOrEqual(85)
  })
})
