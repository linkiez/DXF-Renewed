/**
 * Nesting — True-Shape Placement Tests (T013, FR-001, FR-002, FR-003, SC-001)
 *
 * Irregular parts plus a rectangular part on one sheet: every placement in bounds at the edge
 * clearance, no overlap, nothing unplaced.
 */

import { expect } from 'expect'
import { nestTrueShape } from '../../../src/nesting/trueShape/index'
import { isWithinBounds } from '../../../src/nesting/trueShape/bounds'
import { isSeparated } from '../../../src/nesting/trueShape/separation'
import { computeBoundingBox } from '../../../src/nesting/polygonUtils'
import type { NestableShape, Point2D, StockItem } from '../../../src/nesting/types'

function shapeFrom(id: string, vertices: Point2D[]): NestableShape {
  const bbox = computeBoundingBox(vertices)
  return {
    id,
    layer: '0',
    vertices,
    bbox,
    area: bbox.width * bbox.height * 0.75,
    perimeter: 2 * (bbox.width + bbox.height),
    centroid: { x: bbox.minX + bbox.width / 2, y: bbox.minY + bbox.height / 2 },
    allowedRotations: [0, 90, 180, 270],
    kerf: 0,
    isHole: false,
  }
}

function rect(id: string, w: number, h: number): NestableShape {
  return shapeFrom(id, [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
    { x: 0, y: 0 },
  ])
}

/** Rectilinear L-shaped irregular contour. */
function lShape(id: string, size: number): NestableShape {
  return shapeFrom(id, [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size / 3 },
    { x: size / 3, y: size / 3 },
    { x: size / 3, y: size },
    { x: 0, y: size },
    { x: 0, y: 0 },
  ])
}

const edgeClearance = 2
const partToPartClearance = 2

const stock: StockItem[] = [
  { id: 'sheet-1', kind: 'sheet', width: 200, height: 200 },
]

describe('trueShape/placement', () => {
  it('places irregular and rectangular parts with nothing unplaced', async () => {
    const response = await nestTrueShape({
      stock,
      parts: [
        { shape: lShape('l1', 60), quantity: 2 },
        { shape: rect('r1', 40, 30), quantity: 3 },
      ],
      edgeClearance,
      partToPartClearance,
      seed: 11,
    })

    expect(response.unplaced).toEqual([])
    expect(response.placements).toHaveLength(5)
  })

  it('keeps every placement in bounds at the edge clearance', async () => {
    const response = await nestTrueShape({
      stock,
      parts: [
        { shape: lShape('l1', 60), quantity: 2 },
        { shape: rect('r1', 40, 30), quantity: 3 },
      ],
      edgeClearance,
      partToPartClearance,
      seed: 11,
    })

    for (const placement of response.placements) {
      expect(placement.transformedVertices).toBeDefined()
      expect(
        isWithinBounds(
          placement.transformedVertices ?? [],
          stock[0],
          edgeClearance,
        ),
      ).toBe(true)
    }
  })

  it('keeps every pair of placements apart by the part-to-part clearance', async () => {
    const response = await nestTrueShape({
      stock,
      parts: [
        { shape: lShape('l1', 60), quantity: 2 },
        { shape: rect('r1', 40, 30), quantity: 3 },
      ],
      edgeClearance,
      partToPartClearance,
      seed: 11,
    })

    const instances = response.placements.map(
      (p) => p.transformedVertices ?? [],
    )
    for (let i = 0; i < instances.length; i++) {
      for (let j = i + 1; j < instances.length; j++) {
        expect(
          isSeparated(instances[i], instances[j], partToPartClearance),
        ).toBe(true)
      }
    }
  })

  it('records sheet identity and instance index on every placement', async () => {
    const response = await nestTrueShape({
      stock,
      parts: [{ shape: rect('r1', 30, 30), quantity: 3 }],
      edgeClearance,
      partToPartClearance,
      seed: 3,
    })

    expect(response.placements.map((p) => p.sheetId)).toEqual([
      'sheet-1',
      'sheet-1',
      'sheet-1',
    ])
    expect(new Set(response.placements.map((p) => p.instanceIndex)).size).toBe(3)
  })
})
