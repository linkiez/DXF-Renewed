/**
 * T014 — FR-006: transparent CPU fallback.
 *
 * Acceleration on and acceleration off must produce the identical layout for the same seed. On a
 * host without an adapter the request is still answered (never dropped) and the report states why.
 */

import { expect } from 'expect'
import { nestTrueShape } from '../../../src/nesting'
import type { Point2D } from '../../../src/nesting'
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

const base = {
  stock: [{ id: 's1', kind: 'sheet' as const, width: 200, height: 200 }],
  parts: [
    { shape: square('a', 40), quantity: 4 },
    { shape: square('b', 30), quantity: 4 },
  ],
  edgeClearance: 2,
  partToPartClearance: 2,
  seed: 31415,
}

describe('gpu fallback — acceleration is transparent', () => {
  it('acceleration on and off yield identical placements for the same seed', async () => {
    const on = await nestTrueShape({ ...base, acceleration: true })
    const off = await nestTrueShape({ ...base, acceleration: false })

    expect(JSON.stringify(on.placements)).toBe(JSON.stringify(off.placements))
    expect(on.utilization).toBe(off.utilization)
    expect(on.unplaced).toEqual(off.unplaced)
    expect(on.sheets).toEqual(off.sheets)
  })

  it('an unavailable adapter still completes and reports the fallback reason', async () => {
    const response = await nestTrueShape({ ...base, acceleration: true })
    if (response.backend?.backend === 'cpu') {
      expect(response.backend.requested).toBe(true)
      expect(response.backend.accelerated).toBe(false)
      expect(typeof response.backend.fallbackReason).toBe('string')
    }
    expect(response.placements.length + response.unplaced.reduce((s, u) => s + u.quantity, 0)).toBe(8)
  })
})
