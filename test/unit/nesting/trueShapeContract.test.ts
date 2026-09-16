/**
 * Nesting — True-Shape Contract Tests (T012)
 *
 * Pins the `nestTrueShape` result shape and the quantity-conservation invariant
 * (data-model invariant 3).
 */

import { expect } from 'expect'
import { nestTrueShape } from '../../../src/nesting/trueShape/index'
import { computeBoundingBox } from '../../../src/nesting/polygonUtils'
import type { NestableShape, StockItem } from '../../../src/nesting/types'

function rectShape(id: string, w: number, h: number): NestableShape {
  const vertices = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
    { x: 0, y: 0 },
  ]
  return {
    id,
    layer: '0',
    vertices,
    bbox: computeBoundingBox(vertices),
    area: w * h,
    perimeter: 2 * (w + h),
    centroid: { x: w / 2, y: h / 2 },
    allowedRotations: [0, 90, 180, 270],
    kerf: 0,
    isHole: false,
  }
}

const stock: StockItem[] = [
  { id: 'sheet-1', kind: 'sheet', width: 100, height: 100 },
]

describe('trueShape/contract', () => {
  it('returns the documented result shape', async () => {
    const response = await nestTrueShape({
      stock,
      parts: [{ shape: rectShape('a', 20, 20), quantity: 2 }],
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 42,
    })

    expect(response.placements).toBeInstanceOf(Array)
    expect(response.sheets).toBeInstanceOf(Array)
    expect(response.unplaced).toBeInstanceOf(Array)
    expect(typeof response.utilization).toBe('number')
    expect(typeof response.wasteArea).toBe('number')
    expect(typeof response.totalArea).toBe('number')
    expect(response.budget.iterations).toBeGreaterThan(0)
    expect(response.seed).toBe(42)
    expect(response.edgeClearance).toBe(2)
    expect(response.partToPartClearance).toBe(2)
  })

  it('conserves quantity: placed plus unplaced equals requested', async () => {
    const requests = [
      { shape: rectShape('a', 20, 20), quantity: 3 },
      { shape: rectShape('b', 400, 400), quantity: 2 },
    ]

    const response = await nestTrueShape({
      stock,
      parts: requests,
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 7,
    })

    for (const request of requests) {
      const placed = response.placements.filter(
        (p) => p.shapeId === request.shape.id,
      ).length
      const unplaced = response.unplaced
        .filter((u) => u.shapeId === request.shape.id)
        .reduce((sum, u) => sum + u.quantity, 0)
      expect(placed + unplaced).toBe(request.quantity)
    }
  })

  it('reports an explicit reason for a part that cannot fit', async () => {
    const response = await nestTrueShape({
      stock,
      parts: [{ shape: rectShape('huge', 500, 500), quantity: 1 }],
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 1,
    })

    expect(response.placements).toHaveLength(0)
    expect(response.unplaced).toHaveLength(1)
    expect(response.unplaced[0].quantity).toBe(1)
    expect(response.unplaced[0].reason.length).toBeGreaterThan(0)
  })

  it('is deterministic for identical input and seed', async () => {
    const request = {
      stock,
      parts: [{ shape: rectShape('a', 30, 25), quantity: 4 }],
      edgeClearance: 3,
      partToPartClearance: 3,
      seed: 99,
    }

    const first = await nestTrueShape(request)
    const second = await nestTrueShape(request)

    expect(JSON.stringify(first.placements)).toBe(
      JSON.stringify(second.placements),
    )
    expect(first.budget.iterations).toBe(second.budget.iterations)
  })

  it('excludes remnants below the caller threshold (FR-008)', async () => {
    const response = await nestTrueShape({
      stock: [
        { id: 'sheet-1', kind: 'sheet', width: 100, height: 100 },
        { id: 'tiny', kind: 'remnant', width: 5, height: 5 },
      ],
      parts: [{ shape: rectShape('a', 20, 20), quantity: 1 }],
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 5,
      remnantThreshold: 1000,
    })

    expect(response.sheets.map((s) => s.id)).not.toContain('tiny')
    expect(response.placements.every((p) => p.sheetId !== 'tiny')).toBe(true)
  })
})
