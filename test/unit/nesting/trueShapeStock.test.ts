/**
 * T017 — FR-005 / FR-008: stock selection across sheets and remnants.
 *
 * The search may use several sheets when one is not enough, and a `kind: 'remnant'` below the
 * caller-supplied `remnantThreshold` is excluded before search.
 */

import { firstValueFrom } from 'rxjs'
import { expect } from 'expect'
import { nestTrueShape } from '../../../src/nesting/trueShape/index'
import { computeBoundingBox } from '../../../src/nesting/polygonUtils'
import type { NestableShape, Point2D, StockItem } from '../../../src/nesting/types'

function square(id: string, size: number): NestableShape {
  const vertices: Point2D[] = [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size },
    { x: 0, y: size },
    { x: 0, y: 0 },
  ]
  const bbox = computeBoundingBox(vertices)
  return {
    id,
    layer: '0',
    vertices,
    bbox,
    area: size * size,
    perimeter: 4 * size,
    centroid: { x: size / 2, y: size / 2 },
    allowedRotations: [0, 90, 180, 270],
    kerf: 0,
    isHole: false,
  }
}

describe('trueShape/stock', () => {
  it('uses several sheets when one is not enough', async () => {
    const stock: StockItem[] = [
      { id: 's1', kind: 'sheet', width: 50, height: 50 },
      { id: 's2', kind: 'sheet', width: 50, height: 50 },
    ]

    const response = await firstValueFrom(nestTrueShape({
      stock,
      parts: [{ shape: square('a', 20), quantity: 6 }],
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 4,
    }))

    expect(response.placements).toHaveLength(6)
    expect(new Set(response.placements.map((p) => p.sheetId)).size).toBe(2)
  })

  it('excludes a remnant below the caller threshold (FR-008)', async () => {
    const response = await firstValueFrom(nestTrueShape({
      stock: [{ id: 'tiny', kind: 'remnant', width: 30, height: 30 }],
      parts: [{ shape: square('a', 20), quantity: 1 }],
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 1,
      remnantThreshold: 1000,
    }))

    expect(response.sheets).toHaveLength(0)
    expect(response.placements).toHaveLength(0)
    expect(response.unplaced).toHaveLength(1)
    expect(response.unplaced[0].reason.length).toBeGreaterThan(0)
  })

  it('uses a remnant at or above the caller threshold', async () => {
    const response = await firstValueFrom(nestTrueShape({
      stock: [{ id: 'offcut', kind: 'remnant', width: 60, height: 60 }],
      parts: [{ shape: square('a', 20), quantity: 1 }],
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 1,
      remnantThreshold: 1000,
    }))

    expect(response.unplaced).toEqual([])
    expect(response.sheets.map((s) => s.id)).toEqual(['offcut'])
  })
})
