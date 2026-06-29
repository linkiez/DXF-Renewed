import { expect } from 'expect'
import {
  polygonArea,
  rotatePoint,
  rotatePolygon,
  getBBox,
  translatePolygon,
  simplifyPolygon,
  pointsEqual,
} from '../../../src/nest/geometry'

describe('nest/geometry', () => {
  describe('polygonArea', () => {
    it('calculates area of a square', () => {
      const square: [number, number][] = [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ]
      expect(polygonArea(square)).toBeCloseTo(100)
    })

    it('calculates area of a triangle', () => {
      const triangle: [number, number][] = [
        [0, 0],
        [10, 0],
        [5, 10],
      ]
      expect(polygonArea(triangle)).toBeCloseTo(50)
    })

    it('returns 0 for less than 3 vertices', () => {
      expect(polygonArea([[0, 0], [1, 1]])).toBe(0)
      expect(polygonArea([])).toBe(0)
    })

    it('handles closed polygons (duplicate last vertex)', () => {
      const square: [number, number][] = [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ]
      expect(polygonArea(square)).toBeCloseTo(100)
    })
  })

  describe('rotatePoint', () => {
    it('rotates 90 degrees', () => {
      const result = rotatePoint(1, 0, 90)
      expect(result.x).toBeCloseTo(0)
      expect(result.y).toBeCloseTo(1)
    })

    it('rotates 180 degrees', () => {
      const result = rotatePoint(1, 0, 180)
      expect(result.x).toBeCloseTo(-1)
      expect(result.y).toBeCloseTo(0)
    })

    it('rotates 360 degrees (identity)', () => {
      const result = rotatePoint(3, 4, 360)
      expect(result.x).toBeCloseTo(3)
      expect(result.y).toBeCloseTo(4)
    })

    it('rotates 0 degrees (identity)', () => {
      const result = rotatePoint(3, 4, 0)
      expect(result.x).toBeCloseTo(3)
      expect(result.y).toBeCloseTo(4)
    })
  })

  describe('getBBox', () => {
    it('calculates bounding box', () => {
      const poly: [number, number][] = [
        [10, 20],
        [50, 20],
        [50, 60],
        [10, 60],
      ]
      const bbox = getBBox(poly)
      expect(bbox.x).toBe(10)
      expect(bbox.y).toBe(20)
      expect(bbox.w).toBe(40)
      expect(bbox.h).toBe(40)
    })

    it('handles empty polygon', () => {
      const bbox = getBBox([])
      expect(bbox).toEqual({ x: 0, y: 0, w: 0, h: 0 })
    })
  })

  describe('translatePolygon', () => {
    it('translates all vertices', () => {
      const poly: [number, number][] = [
        [0, 0],
        [10, 0],
        [10, 10],
      ]
      const result = translatePolygon(poly, 5, 5)
      expect(result[0]).toEqual([5, 5])
      expect(result[1]).toEqual([15, 5])
      expect(result[2]).toEqual([15, 15])
    })
  })

  describe('simplifyPolygon', () => {
    it('removes duplicate consecutive vertices', () => {
      const poly: [number, number][] = [
        [0, 0],
        [0, 0],
        [10, 0],
        [10, 0],
        [10, 10],
      ]
      const result = simplifyPolygon(poly)
      expect(result.length).toBeLessThan(poly.length)
    })

    it('preserves valid polygons', () => {
      const poly: [number, number][] = [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ]
      const result = simplifyPolygon(poly)
      expect(result.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('pointsEqual', () => {
    it('returns true for identical points', () => {
      expect(pointsEqual([1, 2], [1, 2])).toBe(true)
    })

    it('returns true for approximately equal points', () => {
      expect(pointsEqual([1, 2], [1.0001, 2.0001])).toBe(true)
    })

    it('returns false for different points', () => {
      expect(pointsEqual([1, 2], [3, 4])).toBe(false)
    })
  })
})
