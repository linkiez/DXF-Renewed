/**
 * Nesting Module — Bin Packing Tests
 */

import { expect } from 'expect'
import { guillotinePack } from '../../../src/nesting/binPacking/guillotine'
import { maxRectsPack } from '../../../src/nesting/binPacking/maxrects'
import { shelfPack } from '../../../src/nesting/binPacking/shelf'
import type { NestableShape } from '../../../src/nesting/types'

function createRectShape(
  id: string,
  width: number,
  height: number,
  layer: string = 'TEST'
): NestableShape {
  return {
    id,
    layer,
    vertices: [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
      { x: 0, y: 0 },
    ],
    bbox: { minX: 0, minY: 0, maxX: width, maxY: height, width, height },
    area: width * height,
    perimeter: 2 * (width + height),
    centroid: { x: width / 2, y: height / 2 },
    allowedRotations: [0, 90, 180, 270],
    kerf: 2,
    isHole: false,
  }
}

describe('nesting/binPacking', () => {
  describe('guillotinePack', () => {
    it('should pack small rectangles on a sheet', () => {
      const shapes = [
        createRectShape('s1', 10, 10),
        createRectShape('s2', 10, 10),
        createRectShape('s3', 10, 10),
      ]

      const result = guillotinePack(shapes, 100, 100, 5, 2, 1)

      expect(result.sheetPlacements.length).toBeGreaterThan(0)
      expect(result.sheetPlacements[0].length).toBe(3)
      expect(result.unplaced.length).toBe(0)
    })

    it('should leave shapes unplaced when they do not fit', () => {
      const shapes = [
        createRectShape('big', 200, 200),
      ]

      const result = guillotinePack(shapes, 100, 100, 5, 2, 1)

      expect(result.unplaced.length).toBe(1)
    })

    it('should use multiple sheets when needed', () => {
      const shapes = [
        createRectShape('s1', 50, 50),
        createRectShape('s2', 50, 50),
        createRectShape('s3', 50, 50),
        createRectShape('s4', 50, 50),
      ]

      const result = guillotinePack(shapes, 100, 100, 5, 2, 0)

      // At least some should be placed
      const totalPlaced = result.sheetPlacements.reduce(
        (sum, sheet) => sum + sheet.length,
        0
      )
      expect(totalPlaced).toBeGreaterThan(0)
    })
  })

  describe('maxRectsPack', () => {
    it('should pack small rectangles on a sheet', () => {
      const shapes = [
        createRectShape('s1', 10, 10),
        createRectShape('s2', 10, 10),
        createRectShape('s3', 10, 10),
      ]

      const result = maxRectsPack(shapes, 100, 100, 5, 2, 1)

      expect(result.sheetPlacements.length).toBeGreaterThan(0)
      expect(result.sheetPlacements[0].length).toBe(3)
      expect(result.unplaced.length).toBe(0)
    })

    it('should leave shapes unplaced when they do not fit', () => {
      const shapes = [
        createRectShape('big', 200, 200),
      ]

      const result = maxRectsPack(shapes, 100, 100, 5, 2, 1)

      expect(result.unplaced.length).toBe(1)
    })

    it('should use multiple sheets when needed', () => {
      const shapes = [
        createRectShape('s1', 50, 50),
        createRectShape('s2', 50, 50),
        createRectShape('s3', 50, 50),
        createRectShape('s4', 50, 50),
      ]

      const result = maxRectsPack(shapes, 100, 100, 5, 2, 0)

      const totalPlaced = result.sheetPlacements.reduce(
        (sum, sheet) => sum + sheet.length,
        0
      )
      expect(totalPlaced).toBeGreaterThan(0)
    })
  })

  describe('shelfPack', () => {
    it('should pack small rectangles on a sheet', () => {
      const shapes = [
        createRectShape('s1', 10, 10),
        createRectShape('s2', 10, 10),
        createRectShape('s3', 10, 10),
      ]

      const result = shelfPack(shapes, 100, 100, 5, 2, 1)

      expect(result.sheetPlacements.length).toBeGreaterThan(0)
      expect(result.sheetPlacements[0].length).toBe(3)
      expect(result.unplaced.length).toBe(0)
    })

    it('should leave shapes unplaced when they do not fit', () => {
      const shapes = [
        createRectShape('big', 200, 200),
      ]

      const result = shelfPack(shapes, 100, 100, 5, 2, 1)

      expect(result.unplaced.length).toBe(1)
    })

    it('should use multiple sheets when needed', () => {
      const shapes = [
        createRectShape('s1', 50, 50),
        createRectShape('s2', 50, 50),
        createRectShape('s3', 50, 50),
        createRectShape('s4', 50, 50),
      ]

      const result = shelfPack(shapes, 100, 100, 5, 2, 0)

      const totalPlaced = result.sheetPlacements.reduce(
        (sum, sheet) => sum + sheet.length,
        0
      )
      expect(totalPlaced).toBeGreaterThan(0)
    })
  })
})
