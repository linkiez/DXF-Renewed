/**
 * Nesting Module — Collision Detection Tests
 */

import { expect } from 'expect'
import {
  checkCollision,
  bboxesOverlap,
  satCollision,
  validatePlacements,
} from '../../../src/nesting/collision'
import type { BoundingBox, Point2D } from '../../../src/nesting/types'

function makeSquare(
  x: number,
  y: number,
  size: number
): { vertices: Point2D[]; bbox: BoundingBox } {
  const vertices: Point2D[] = [
    { x, y },
    { x: x + size, y },
    { x: x + size, y: y + size },
    { x, y: y + size },
    { x, y },
  ]
  const bbox: BoundingBox = {
    minX: x,
    minY: y,
    maxX: x + size,
    maxY: y + size,
    width: size,
    height: size,
  }
  return { vertices, bbox }
}

describe('nesting/collision', () => {
  describe('bboxesOverlap', () => {
    it('should detect overlapping bounding boxes', () => {
      const a: BoundingBox = { minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10 }
      const b: BoundingBox = { minX: 5, minY: 5, maxX: 15, maxY: 15, width: 10, height: 10 }
      expect(bboxesOverlap(a, b)).toBe(true)
    })

    it('should detect non-overlapping bounding boxes', () => {
      const a: BoundingBox = { minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10 }
      const b: BoundingBox = { minX: 11, minY: 11, maxX: 20, maxY: 20, width: 10, height: 10 }
      expect(bboxesOverlap(a, b)).toBe(false)
    })

    it('should handle touching bounding boxes as overlapping', () => {
      const a: BoundingBox = { minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10 }
      const b: BoundingBox = { minX: 10, minY: 0, maxX: 20, maxY: 10, width: 10, height: 10 }
      expect(bboxesOverlap(a, b)).toBe(false)
    })
  })

  describe('satCollision', () => {
    it('should detect collision between overlapping squares', () => {
      const a = makeSquare(0, 0, 10)
      const b = makeSquare(5, 5, 10)
      expect(satCollision(a.vertices, b.vertices)).toBe(true)
    })

    it('should detect no collision between separated squares', () => {
      const a = makeSquare(0, 0, 10)
      const b = makeSquare(15, 15, 10)
      expect(satCollision(a.vertices, b.vertices)).toBe(false)
    })

    it('should detect no collision with margin', () => {
      const a = makeSquare(0, 0, 10)
      const b = makeSquare(12, 12, 10)
      expect(satCollision(a.vertices, b.vertices, 2)).toBe(false)
    })

    it('should detect collision with margin', () => {
      const a = makeSquare(0, 0, 10)
      const b = makeSquare(11, 11, 10)
      expect(satCollision(a.vertices, b.vertices, 2)).toBe(true)
    })
  })

  describe('checkCollision', () => {
    it('should detect collision with fast reject', () => {
      const a = makeSquare(0, 0, 10)
      const b = makeSquare(100, 100, 10)
      const result = checkCollision(a.vertices, a.bbox, b.vertices, b.bbox, 0)
      expect(result.collides).toBe(false)
    })

    it('should detect collision with SAT', () => {
      const a = makeSquare(0, 0, 10)
      const b = makeSquare(5, 5, 10)
      const result = checkCollision(a.vertices, a.bbox, b.vertices, b.bbox, 0)
      expect(result.collides).toBe(true)
    })
  })

  describe('validatePlacements', () => {
    it('should return no collisions for non-overlapping placements', () => {
      const a = makeSquare(0, 0, 10)
      const b = makeSquare(20, 20, 10)
      const collisions = validatePlacements(
        [
          { id: 'a', vertices: a.vertices, bbox: a.bbox },
          { id: 'b', vertices: b.vertices, bbox: b.bbox },
        ],
        0
      )
      expect(collisions.length).toBe(0)
    })

    it('should return collisions for overlapping placements', () => {
      const a = makeSquare(0, 0, 10)
      const b = makeSquare(5, 5, 10)
      const collisions = validatePlacements(
        [
          { id: 'a', vertices: a.vertices, bbox: a.bbox },
          { id: 'b', vertices: b.vertices, bbox: b.bbox },
        ],
        0
      )
      expect(collisions.length).toBe(1)
      expect(collisions[0]).toEqual(['a', 'b'])
    })
  })
})
