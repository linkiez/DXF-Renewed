import { expect } from 'expect'
import { generateNestSVG, generateNestDXF } from '../../../src/nest/output'
import type { NestPlacement } from '../../../src/nest/types'

describe('nest/output', () => {
  const samplePlacement: NestPlacement = {
    partId: 'test-1',
    layer: 'PARTS',
    x: 10,
    y: 10,
    rotation: 0,
    vertices: [
      [10, 10],
      [30, 10],
      [30, 30],
      [10, 30],
    ],
    placedVertices: [
      [10, 10],
      [30, 10],
      [30, 30],
      [10, 30],
    ],
    color: [255, 0, 0],
  }

  describe('generateNestSVG', () => {
    it('produces valid SVG', async () => {
      const svg = generateNestSVG([samplePlacement], [], { width: 100, height: 100 })
      expect(svg).toContain('<svg')
      expect(svg).toContain('</svg>')
      expect(svg).toContain('DXF Nest Result')
    })

    it('includes bin outline', async () => {
      const svg = generateNestSVG([samplePlacement], [], { width: 100, height: 100 })
      expect(svg).toContain('stroke="#4fc3f7"')
    })

    it('includes placed parts', async () => {
      const svg = generateNestSVG([samplePlacement], [], { width: 100, height: 100 })
      expect(svg).toContain('test-1')
    })

    it('shows unplaced warning', async () => {
      const svg = generateNestSVG([], [{ id: 'missed' } as any], { width: 100, height: 100 })
      expect(svg).toContain('could not be placed')
    })
  })

  describe('generateNestDXF', () => {
    it('produces valid DXF structure', async () => {
      const dxf = generateNestDXF([samplePlacement], { width: 100, height: 100 })
      expect(dxf).toContain('SECTION')
      expect(dxf).toContain('HEADER')
      expect(dxf).toContain('ENTITIES')
      expect(dxf).toContain('EOF')
    })

    it('includes bin as LWPOLYLINE', async () => {
      const dxf = generateNestDXF([samplePlacement], { width: 100, height: 100 })
      expect(dxf).toContain('LWPOLYLINE')
    })

    it('includes placed parts', async () => {
      const dxf = generateNestDXF([samplePlacement], { width: 100, height: 100 })
      // Should have at least 2 LWPOLYLINEs (bin + part)
      const count = (dxf.match(/LWPOLYLINE/g) || []).length
      expect(count).toBeGreaterThanOrEqual(2)
    })

    it('sets correct layer for parts', async () => {
      const dxf = generateNestDXF([samplePlacement], { width: 100, height: 100 })
      expect(dxf).toContain('PARTS')
    })
  })
})
