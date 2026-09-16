/**
 * Nesting — True-Shape Bounds and Separation Tests (T005–T008)
 */

import { expect } from 'expect'
import { isWithinBounds, polygonDistance } from '../../../src/nesting/trueShape/bounds'
import { isSeparated } from '../../../src/nesting/trueShape/separation'
import { computeBoundingBox } from '../../../src/nesting/polygonUtils'
import type { NestableShape, Point2D, StockSheet } from '../../../src/nesting/types'

function rect(x: number, y: number, w: number, h: number): Point2D[] {
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
    { x, y },
  ]
}

function holeFrom(vertices: Point2D[]): NestableShape {
  return {
    id: 'hole',
    layer: '0',
    vertices,
    bbox: computeBoundingBox(vertices),
    area: -1,
    perimeter: 0,
    centroid: { x: 0, y: 0 },
    allowedRotations: [0],
    kerf: 0,
    isHole: true,
  }
}

const sheet: StockSheet = { width: 100, height: 100 }

describe('trueShape/bounds', () => {
  it('accepts an instance at exactly the edge clearance', async () => {
    expect(isWithinBounds(rect(5, 5, 90, 90), sheet, 5)).toBe(true)
  })

  it('rejects an instance closer than the edge clearance to the outer edge', async () => {
    expect(isWithinBounds(rect(4, 5, 90, 90), sheet, 5)).toBe(false)
    expect(isWithinBounds(rect(5, 5, 91, 90), sheet, 5)).toBe(false)
  })

  it('rejects an instance crossing a hole contour', async () => {
    const stock: StockSheet = { ...sheet, holes: [holeFrom(rect(40, 40, 20, 20))] }
    expect(isWithinBounds(rect(35, 40, 10, 20), stock, 5)).toBe(false)
  })

  it('rejects an instance closer than the clearance to a hole contour', async () => {
    const stock: StockSheet = { ...sheet, holes: [holeFrom(rect(40, 40, 20, 20))] }
    // Gap of 2 between instance and hole edge, clearance is 5.
    expect(isWithinBounds(rect(30, 40, 8, 20), stock, 5)).toBe(false)
    // Gap of exactly 5.
    expect(isWithinBounds(rect(25, 40, 10, 20), stock, 5)).toBe(true)
  })

  it('measures contour distance, not just bounding boxes', async () => {
    const a = rect(0, 0, 10, 10)
    const b = rect(12, 0, 10, 10)
    expect(polygonDistance(a, b)).toBeCloseTo(2, 6)
  })
})

describe('trueShape/separation', () => {
  it('accepts two instances exactly at the part-to-part clearance', async () => {
    expect(isSeparated(rect(0, 0, 10, 10), rect(12, 0, 10, 10), 2)).toBe(true)
  })

  it('rejects two instances closer than the part-to-part clearance', async () => {
    expect(isSeparated(rect(0, 0, 10, 10), rect(11, 0, 10, 10), 2)).toBe(false)
  })

  it('rejects overlapping instances', async () => {
    expect(isSeparated(rect(0, 0, 10, 10), rect(5, 5, 10, 10), 2)).toBe(false)
  })
})
