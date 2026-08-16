/**
 * Nesting Module — Shape Extractor Tests
 *
 * Tests for shape extraction from DXF entities.
 */

import { expect } from 'expect'
import { extractShapes, resetShapeIdCounter } from '../../../src/nesting/shapeExtractor'
import type { Entity } from '../../../src/types'

describe('nesting/shapeExtractor', () => {
  beforeEach(() => {
    resetShapeIdCounter()
  })

  describe('extractShapes', () => {
    it('should extract closed LWPOLYLINE', () => {
      const entity: Entity = {
        type: 'LWPOLYLINE',
        handle: '1A',
        layer: 'TEST',
        vertices: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
          { x: 0, y: 10 },
        ],
        closed: true,
      } as any

      const result = extractShapes([entity], {
        curveSegments: 36,
        allowedRotations: [0, 90, 180, 270],
        kerf: 2,
      })

      expect(result.shapes.length).toBe(1)
      expect(result.shapes[0].area).toBeCloseTo(100)
      expect(result.shapes[0].layer).toBe('TEST')
    })

    it('should skip open LWPOLYLINE', () => {
      const entity: Entity = {
        type: 'LWPOLYLINE',
        handle: '1B',
        layer: 'TEST',
        vertices: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
        ],
        closed: false,
      } as any

      const result = extractShapes([entity], {
        curveSegments: 36,
        allowedRotations: [0],
        kerf: 2,
      })

      expect(result.shapes.length).toBe(0)
      expect(result.skippedEntities.length).toBe(1)
    })

    it('should extract circle as polygon', () => {
      const entity: Entity = {
        type: 'CIRCLE',
        handle: '1C',
        layer: 'CIRCLES',
        x: 50,
        y: 50,
        r: 10,
      } as any

      const result = extractShapes([entity], {
        curveSegments: 36,
        allowedRotations: [0],
        kerf: 2,
      })

      expect(result.shapes.length).toBe(1)
      // Area ≈ π * r² = π * 100 ≈ 314.16
      expect(result.shapes[0].area).toBeCloseTo(Math.PI * 100, -1)
    })

    it('should extract SOLID as polygon', () => {
      const entity: Entity = {
        type: 'SOLID',
        handle: '1D',
        layer: 'SOLIDS',
        points: [
          { x: 0, y: 0, z: 0 },
          { x: 10, y: 0, z: 0 },
          { x: 10, y: 10, z: 0 },
          { x: 0, y: 10, z: 0 },
        ],
      } as any

      const result = extractShapes([entity], {
        curveSegments: 36,
        allowedRotations: [0],
        kerf: 2,
      })

      expect(result.shapes.length).toBe(1)
      expect(result.shapes[0].area).toBeCloseTo(100)
    })

    it('should extract TRACE as polygon', () => {
      const entity: Entity = {
        type: 'TRACE',
        handle: '1E',
        layer: 'TRACES',
        corners: [
          { x: 0, y: 0, z: 0 },
          { x: 20, y: 0, z: 0 },
          { x: 20, y: 15, z: 0 },
          { x: 0, y: 15, z: 0 },
        ],
      } as any

      const result = extractShapes([entity], {
        curveSegments: 36,
        allowedRotations: [0],
        kerf: 2,
      })

      expect(result.shapes.length).toBe(1)
      expect(result.shapes[0].area).toBeCloseTo(300)
    })

    it('should skip unsupported entity types', () => {
      const entity: Entity = {
        type: 'TEXT',
        handle: '1F',
        layer: 'TEXT',
      } as any

      const result = extractShapes([entity], {
        curveSegments: 36,
        allowedRotations: [0],
        kerf: 2,
      })

      expect(result.shapes.length).toBe(0)
      expect(result.skippedEntities.length).toBe(1)
    })

    it('should skip zero-area shapes', () => {
      const entity: Entity = {
        type: 'LWPOLYLINE',
        handle: '1G',
        layer: 'TEST',
        vertices: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 5, y: 0 }, // Collinear → zero area
        ],
        closed: true,
      } as any

      const result = extractShapes([entity], {
        curveSegments: 36,
        allowedRotations: [0],
        kerf: 2,
      })

      expect(result.shapes.length).toBe(0)
    })

    it('should assign unique IDs to shapes', () => {
      const entities: Entity[] = [
        {
          type: 'CIRCLE',
          handle: '2A',
          layer: 'TEST',
          x: 0,
          y: 0,
          r: 5,
        } as any,
        {
          type: 'CIRCLE',
          handle: '2B',
          layer: 'TEST',
          x: 20,
          y: 20,
          r: 5,
        } as any,
      ]

      const result = extractShapes(entities, {
        curveSegments: 36,
        allowedRotations: [0],
        kerf: 2,
      })

      expect(result.shapes.length).toBe(2)
      expect(result.shapes[0].id).not.toBe(result.shapes[1].id)
    })
  })
})
