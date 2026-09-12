/**
 * T022 — caller-input validation: explicit reasons, never a throw.
 *
 * Covers negative clearances, empty stock, non-positive dimensions, a hole outside its sheet
 * boundary and a grain-locked part without `grainAngle` (FR-004, FR-006).
 */

import { expect } from 'expect'
import { nestTrueShape } from '../../../src/nesting/trueShape/index'
import { computeBoundingBox } from '../../../src/nesting/polygonUtils'
import type {
  NestableShape,
  NestResponse,
  Point2D,
  StockItem,
} from '../../../src/nesting/types'

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
const part = { shape: square('a', 20), quantity: 1 }
const base = { stock, parts: [part], edgeClearance: 2, partToPartClearance: 2, seed: 1 }

function expectReason(build: () => NestResponse, pattern: RegExp): void {
  let response: NestResponse | undefined
  expect(() => {
    response = build()
  }).not.toThrow()
  const result = response!
  expect(result.placements).toHaveLength(0)
  expect(result.unplaced.length).toBeGreaterThan(0)
  expect(result.unplaced[0].reason).toMatch(pattern)
}

describe('trueShape/validation', () => {
  it('rejects a negative edge clearance with an explicit reason', () => {
    expectReason(() => nestTrueShape({ ...base, edgeClearance: -1 }), /edgeClearance/)
  })

  it('rejects a negative part-to-part clearance with an explicit reason', () => {
    expectReason(
      () => nestTrueShape({ ...base, partToPartClearance: -1 }),
      /partToPartClearance/,
    )
  })

  it('rejects empty stock with an explicit reason', () => {
    expectReason(() => nestTrueShape({ ...base, stock: [] }), /stock/)
  })

  it('rejects a non-positive stock dimension with an explicit reason', () => {
    expectReason(
      () =>
        nestTrueShape({
          ...base,
          stock: [{ id: 'bad', kind: 'sheet', width: 0, height: 100 }],
        }),
      /positive/,
    )
  })

  it('rejects a hole outside the sheet boundary with an explicit reason', () => {
    const hole = shapeFrom('h', [
      { x: -5, y: 10 },
      { x: 20, y: 10 },
      { x: 20, y: 40 },
      { x: -5, y: 40 },
      { x: -5, y: 10 },
    ])
    expectReason(
      () =>
        nestTrueShape({
          ...base,
          stock: [{ id: 's1', kind: 'sheet', width: 100, height: 100, holes: [hole] }],
        }),
      /hole/,
    )
  })

  it('reports a grain-locked part without grainAngle as unplaced', () => {
    const response = nestTrueShape({ ...base, parts: [{ ...part, grainLocked: true }] })
    expect(response.placements).toHaveLength(0)
    expect(response.unplaced).toHaveLength(1)
    expect(response.unplaced[0].reason).toMatch(/grainAngle/)
  })

  it('reports a grain-locked part with no aligned permitted rotation', () => {
    const response = nestTrueShape({
      ...base,
      parts: [{ ...part, grainLocked: true, grainAngle: 45 }],
    })
    expect(response.placements).toHaveLength(0)
    expect(response.unplaced).toHaveLength(1)
    expect(response.unplaced[0].reason).toMatch(/grainAngle/)
  })

  it('rejects a non-positive part quantity with an explicit reason', () => {
    expectReason(
      () => nestTrueShape({ ...base, parts: [{ ...part, quantity: 0 }] }),
      /quantity/,
    )
  })
})
