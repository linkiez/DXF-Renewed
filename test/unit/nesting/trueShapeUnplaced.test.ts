/**
 * T016 — FR-006: unplaced reporting.
 *
 * A part larger than every stock item comes back in `unplaced` with its requested quantity and a
 * non-empty reason, and the call never throws.
 */

import { firstValueFrom } from 'rxjs'
import { expect } from 'expect'
import { nestTrueShape } from '../../../src/nesting/trueShape/index'
import { computeBoundingBox } from '../../../src/nesting/polygonUtils'
import type { NestableShape, Point2D, StockItem } from '../../../src/nesting/types'

function shapeFrom(id: string, vertices: Point2D[]): NestableShape {
  const bbox = computeBoundingBox(vertices)
  return {
    id,
    layer: '0',
    vertices,
    bbox,
    area: bbox.width * bbox.height,
    perimeter: 2 * (bbox.width + bbox.height),
    centroid: { x: bbox.minX + bbox.width / 2, y: bbox.minY + bbox.height / 2 },
    allowedRotations: [0, 90, 180, 270],
    kerf: 0,
    isHole: false,
  }
}

function square(id: string, size: number): NestableShape {
  return shapeFrom(id, [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size },
    { x: 0, y: size },
    { x: 0, y: 0 },
  ])
}

const stock: StockItem[] = [{ id: 's1', kind: 'sheet', width: 100, height: 100 }]

describe('trueShape/unplaced', () => {
  it('reports a part larger than every stock item without throwing', async () => {
    const result = await firstValueFrom(nestTrueShape({
      stock,
      parts: [{ shape: square('huge', 500), quantity: 2 }],
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 1,
    }))
    expect(result.placements).toHaveLength(0)
    expect(result.unplaced).toHaveLength(1)
    expect(result.unplaced[0].shapeId).toBe('huge')
    expect(result.unplaced[0].quantity).toBe(2)
    expect(result.unplaced[0].reason.length).toBeGreaterThan(0)
  })

  it('reports only the unplaced remainder when a part partially fits', async () => {
    const response = await firstValueFrom(nestTrueShape({
      stock,
      parts: [{ shape: square('a', 40), quantity: 9 }],
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 2,
    }))

    const placed = response.placements.length
    const unplaced = response.unplaced.reduce((sum, u) => sum + u.quantity, 0)

    expect(placed + unplaced).toBe(9)
    expect(unplaced).toBeGreaterThan(0)
    expect(response.unplaced[0].reason.length).toBeGreaterThan(0)
  })
})
