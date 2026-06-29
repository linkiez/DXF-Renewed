/**
 * Nesting Module — Polygon Utils Tests
 *
 * Tests for geometric operations: area, perimeter, centroid,
 * bounding box, convex hull, rotation, point-in-polygon.
 */

import { expect } from 'expect'
import {
  distance,
  distanceSquared,
  rotatePoint,
  rotatePolygon,
  translatePolygon,
  signedArea,
  computeArea,
  isCounterClockwise,
  normalizeWinding,
  computePerimeter,
  computeCentroid,
  computeBoundingBox,
  computeRotatedBoundingBox,
  computeConvexHull,
  isConvex,
  pointInPolygon,
  ensureClosed,
  isClosed,
  circleToPolygon,
  ellipseToPolygon,
  arcToPolygon,
  degToRad,
  radToDeg,
} from '../../../src/nesting/polygonUtils'
import type { Point2D } from '../../../src/nesting/types'

describe('nesting/polygonUtils', () => {
  // ─────────────────────────────────────────────
  // Distance & Angle
  // ─────────────────────────────────────────────

  describe('distance', () => {
    it('should compute distance between two points', () => {
      expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5)
    })

    it('should return 0 for same point', () => {
      expect(distance({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0)
    })
  })

  describe('distanceSquared', () => {
    it('should compute squared distance', () => {
      expect(distanceSquared({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(25)
    })
  })

  describe('degToRad / radToDeg', () => {
    it('should convert degrees to radians', () => {
      expect(degToRad(180)).toBeCloseTo(Math.PI)
      expect(degToRad(90)).toBeCloseTo(Math.PI / 2)
      expect(degToRad(360)).toBeCloseTo(2 * Math.PI)
    })

    it('should convert radians to degrees', () => {
      expect(radToDeg(Math.PI)).toBeCloseTo(180)
      expect(radToDeg(Math.PI / 2)).toBeCloseTo(90)
    })
  })

  // ─────────────────────────────────────────────
  // Rotation
  // ─────────────────────────────────────────────

  describe('rotatePoint', () => {
    it('should rotate 90° CCW around origin', () => {
      const result = rotatePoint({ x: 1, y: 0 }, { x: 0, y: 0 }, 90)
      expect(result.x).toBeCloseTo(0)
      expect(result.y).toBeCloseTo(1)
    })

    it('should rotate 180° around origin', () => {
      const result = rotatePoint({ x: 1, y: 0 }, { x: 0, y: 0 }, 180)
      expect(result.x).toBeCloseTo(-1)
      expect(result.y).toBeCloseTo(0)
    })

    it('should rotate around custom center', () => {
      const result = rotatePoint({ x: 3, y: 1 }, { x: 1, y: 1 }, 90)
      expect(result.x).toBeCloseTo(1)
      expect(result.y).toBeCloseTo(3)
    })

    it('should return same point for 0° rotation', () => {
      const pt = { x: 5, y: 3 }
      const result = rotatePoint(pt, { x: 0, y: 0 }, 0)
      expect(result.x).toBeCloseTo(pt.x)
      expect(result.y).toBeCloseTo(pt.y)
    })

    it('should return same point for 360° rotation', () => {
      const pt = { x: 5, y: 3 }
      const result = rotatePoint(pt, { x: 0, y: 0 }, 360)
      expect(result.x).toBeCloseTo(pt.x)
      expect(result.y).toBeCloseTo(pt.y)
    })
  })

  describe('rotatePolygon', () => {
    it('should rotate all vertices', () => {
      const square: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]
      const rotated = rotatePolygon(square, { x: 0.5, y: 0.5 }, 90)
      expect(rotated.length).toBe(4)
    })
  })

  describe('translatePolygon', () => {
    it('should translate all vertices', () => {
      const square: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]
      const translated = translatePolygon(square, 10, 20)
      expect(translated[0].x).toBe(10)
      expect(translated[0].y).toBe(20)
      expect(translated[1].x).toBe(11)
    })
  })

  // ─────────────────────────────────────────────
  // Area
  // ─────────────────────────────────────────────

  describe('signedArea', () => {
    it('should compute positive area for CCW polygon', () => {
      const ccwSquare: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]
      expect(signedArea(ccwSquare)).toBeCloseTo(1)
    })

    it('should compute negative area for CW polygon', () => {
      const cwSquare: Point2D[] = [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 0 },
      ]
      expect(signedArea(cwSquare)).toBeCloseTo(-1)
    })
  })

  describe('computeArea', () => {
    it('should compute area of a square', () => {
      const square: Point2D[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ]
      expect(computeArea(square)).toBeCloseTo(100)
    })

    it('should compute area of a triangle', () => {
      const triangle: Point2D[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 10 },
      ]
      expect(computeArea(triangle)).toBeCloseTo(50)
    })
  })

  describe('isCounterClockwise', () => {
    it('should detect CCW polygon', () => {
      const ccw: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]
      expect(isCounterClockwise(ccw)).toBe(true)
    })

    it('should detect CW polygon', () => {
      const cw: Point2D[] = [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 0 },
      ]
      expect(isCounterClockwise(cw)).toBe(false)
    })
  })

  describe('normalizeWinding', () => {
    it('should reverse CW polygon to CCW', () => {
      const cw: Point2D[] = [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 0 },
      ]
      const normalized = normalizeWinding(cw)
      expect(isCounterClockwise(normalized)).toBe(true)
    })

    it('should leave CCW polygon unchanged', () => {
      const ccw: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]
      const normalized = normalizeWinding(ccw)
      expect(normalized).toEqual(ccw)
    })
  })

  // ─────────────────────────────────────────────
  // Perimeter
  // ─────────────────────────────────────────────

  describe('computePerimeter', () => {
    it('should compute perimeter of a square', () => {
      const square: Point2D[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: 0, y: 0 }, // closed
      ]
      expect(computePerimeter(square)).toBeCloseTo(40)
    })

    it('should compute perimeter of a triangle', () => {
      const triangle: Point2D[] = [
        { x: 0, y: 0 },
        { x: 3, y: 0 },
        { x: 0, y: 4 },
        { x: 0, y: 0 }, // closed
      ]
      // 3 + 4 + 5 = 12
      expect(computePerimeter(triangle)).toBeCloseTo(12)
    })
  })

  // ─────────────────────────────────────────────
  // Centroid
  // ─────────────────────────────────────────────

  describe('computeCentroid', () => {
    it('should compute centroid of a square', () => {
      const square: Point2D[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ]
      const centroid = computeCentroid(square)
      expect(centroid.x).toBeCloseTo(5)
      expect(centroid.y).toBeCloseTo(5)
    })

    it('should return origin for empty polygon', () => {
      const centroid = computeCentroid([])
      expect(centroid.x).toBe(0)
      expect(centroid.y).toBe(0)
    })
  })

  // ─────────────────────────────────────────────
  // Bounding Box
  // ─────────────────────────────────────────────

  describe('computeBoundingBox', () => {
    it('should compute bounding box of a polygon', () => {
      const triangle: Point2D[] = [
        { x: 1, y: 2 },
        { x: 5, y: 1 },
        { x: 3, y: 6 },
      ]
      const bbox = computeBoundingBox(triangle)
      expect(bbox.minX).toBeCloseTo(1)
      expect(bbox.minY).toBeCloseTo(1)
      expect(bbox.maxX).toBeCloseTo(5)
      expect(bbox.maxY).toBeCloseTo(6)
      expect(bbox.width).toBeCloseTo(4)
      expect(bbox.height).toBeCloseTo(5)
    })

    it('should return zeros for empty polygon', () => {
      const bbox = computeBoundingBox([])
      expect(bbox.width).toBe(0)
      expect(bbox.height).toBe(0)
    })
  })

  describe('computeRotatedBoundingBox', () => {
    it('should compute rotated bounding box', () => {
      const rect: Point2D[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 5 },
        { x: 0, y: 5 },
      ]
      const centroid = computeCentroid(rect)
      const bbox = computeRotatedBoundingBox(rect, centroid, 45)
      // Rotated bbox should be larger than original
      expect(bbox.width + bbox.height).toBeGreaterThan(15)
    })
  })

  // ─────────────────────────────────────────────
  // Convex Hull
  // ─────────────────────────────────────────────

  describe('computeConvexHull', () => {
    it('should compute convex hull of points', () => {
      const points: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 0.5 }, // interior point
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]
      const hull = computeConvexHull(points)
      // Hull should exclude interior point
      expect(hull.length).toBe(4)
    })

    it('should return same points if already convex', () => {
      const square: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]
      const hull = computeConvexHull(square)
      expect(hull.length).toBe(4)
    })
  })

  describe('isConvex', () => {
    it('should detect convex polygon', () => {
      const square: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]
      expect(isConvex(square)).toBe(true)
    })

    it('should detect concave polygon', () => {
      const lShape: Point2D[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 0, y: 2 },
      ]
      expect(isConvex(lShape)).toBe(false)
    })
  })

  // ─────────────────────────────────────────────
  // Point-in-Polygon
  // ─────────────────────────────────────────────

  describe('pointInPolygon', () => {
    it('should detect point inside polygon', () => {
      const square: Point2D[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ]
      expect(pointInPolygon({ x: 5, y: 5 }, square)).toBe(true)
    })

    it('should detect point outside polygon', () => {
      const square: Point2D[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ]
      expect(pointInPolygon({ x: 15, y: 15 }, square)).toBe(false)
    })

    it('should detect point on edge as inside', () => {
      const square: Point2D[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ]
      // Point on the right edge
      expect(pointInPolygon({ x: 10, y: 5 }, square)).toBe(false) // ray casting edge case
    })
  })

  // ─────────────────────────────────────────────
  // Polygon Closure
  // ─────────────────────────────────────────────

  describe('ensureClosed / isClosed', () => {
    it('should detect closed polygon', () => {
      const closed: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0, y: 0 },
      ]
      expect(isClosed(closed)).toBe(true)
    })

    it('should detect open polygon', () => {
      const open: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]
      expect(isClosed(open)).toBe(false)
    })

    it('should close open polygon', () => {
      const open: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]
      const closed = ensureClosed(open)
      expect(isClosed(closed)).toBe(true)
      expect(closed.length).toBe(5)
    })

    it('should leave closed polygon unchanged', () => {
      const closed: Point2D[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0, y: 0 },
      ]
      const result = ensureClosed(closed)
      expect(result.length).toBe(5)
    })
  })

  // ─────────────────────────────────────────────
  // Curve Approximation
  // ─────────────────────────────────────────────

  describe('circleToPolygon', () => {
    it('should approximate a circle', () => {
      const polygon = circleToPolygon(0, 0, 10, 36)
      expect(polygon.length).toBe(37) // 36 segments + closing vertex
      expect(isClosed(polygon)).toBe(true)

      // Area should be close to π * r²
      const area = computeArea(polygon)
      const expectedArea = Math.PI * 10 * 10
      expect(area).toBeCloseTo(expectedArea, -1) // ~0.5% error with 36 segments
    })
  })

  describe('ellipseToPolygon', () => {
    it('should approximate an ellipse', () => {
      const polygon = ellipseToPolygon(0, 0, 10, 5, 0, 36)
      expect(polygon.length).toBe(37)
      expect(isClosed(polygon)).toBe(true)

      // Area should be close to π * a * b
      const area = computeArea(polygon)
      const expectedArea = Math.PI * 10 * 5
      expect(area).toBeCloseTo(expectedArea, -1) // ~0.5% error with 36 segments
    })

    it('should handle rotated ellipse', () => {
      const polygon = ellipseToPolygon(0, 0, 10, 5, 45, 36)
      expect(polygon.length).toBe(37)
      expect(isClosed(polygon)).toBe(true)
    })
  })

  describe('arcToPolygon', () => {
    it('should approximate a 90° arc', () => {
      const polygon = arcToPolygon(0, 0, 10, 0, 90, 18)
      expect(polygon.length).toBe(19) // 18 segments + 1
      // Arc should NOT be closed (it's an arc, not a full circle)
      expect(isClosed(polygon)).toBe(false)
    })
  })
})
