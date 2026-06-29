/**
 * Nesting Module — Geometry Analysis Tests
 */

import { expect } from 'expect'
import {
  analyzeShape,
  analyzeShapes,
  sortShapes,
  enlargeBbox,
} from '../../../src/nesting/geometryAnalysis'
import type { NestableShape } from '../../../src/nesting/types'

function createSquareShape(
  size: number,
  rotations: number[] = [0, 90, 180, 270]
): NestableShape {
  return {
    id: `test-${size}`,
    layer: 'TEST',
    vertices: [
      { x: 0, y: 0 },
      { x: size, y: 0 },
      { x: size, y: size },
      { x: 0, y: size },
      { x: 0, y: 0 },
    ],
    bbox: { minX: 0, minY: 0, maxX: size, maxY: size, width: size, height: size },
    area: size * size,
    perimeter: 4 * size,
    centroid: { x: size / 2, y: size / 2 },
    allowedRotations: rotations,
    kerf: 2,
    isHole: false,
  }
}

describe('nesting/geometryAnalysis', () => {
  describe('analyzeShape', () => {
    it('should compute best rotation for a square', () => {
      const shape = createSquareShape(10)
      const analyzed = analyzeShape(shape)
      expect(analyzed.bestRotation).toBeDefined()
      expect(analyzed.enlargedBbox).toBeDefined()
      expect(analyzed.enlargedBbox.width).toBeGreaterThan(shape.bbox.width)
    })

    it('should enlarge bounding box by kerf', () => {
      const shape = createSquareShape(10, [0])
      shape.kerf = 4
      const analyzed = analyzeShape(shape)
      expect(analyzed.enlargedBbox.width).toBeCloseTo(14)
      expect(analyzed.enlargedBbox.height).toBeCloseTo(14)
    })
  })

  describe('analyzeShapes', () => {
    it('should analyze multiple shapes', () => {
      const shapes = [
        createSquareShape(10),
        createSquareShape(20),
        createSquareShape(5),
      ]
      const analyzed = analyzeShapes(shapes)
      expect(analyzed.length).toBe(3)
      for (const a of analyzed) {
        expect(a.bestRotation).toBeDefined()
        expect(a.enlargedBbox).toBeDefined()
      }
    })
  })

  describe('sortShapes', () => {
    it('should sort by area descending', () => {
      const shapes = [
        createSquareShape(5),
        createSquareShape(20),
        createSquareShape(10),
      ]
      const sorted = sortShapes(shapes, 'area-desc')
      expect(sorted[0].area).toBe(400)
      expect(sorted[1].area).toBe(100)
      expect(sorted[2].area).toBe(25)
    })

    it('should sort by area ascending', () => {
      const shapes = [
        createSquareShape(10),
        createSquareShape(5),
        createSquareShape(20),
      ]
      const sorted = sortShapes(shapes, 'area-asc')
      expect(sorted[0].area).toBe(25)
      expect(sorted[1].area).toBe(100)
      expect(sorted[2].area).toBe(400)
    })

    it('should not modify order when strategy is none', () => {
      const shapes = [
        createSquareShape(20),
        createSquareShape(5),
        createSquareShape(10),
      ]
      const sorted = sortShapes(shapes, 'none')
      expect(sorted[0].area).toBe(400)
      expect(sorted[1].area).toBe(25)
      expect(sorted[2].area).toBe(100)
    })
  })

  describe('enlargeBbox', () => {
    it('should enlarge bounding box by margin', () => {
      const bbox = { minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10 }
      const enlarged = enlargeBbox(bbox, 2)
      expect(enlarged.minX).toBe(-2)
      expect(enlarged.minY).toBe(-2)
      expect(enlarged.maxX).toBe(12)
      expect(enlarged.maxY).toBe(12)
      expect(enlarged.width).toBe(14)
      expect(enlarged.height).toBe(14)
    })
  })
})
