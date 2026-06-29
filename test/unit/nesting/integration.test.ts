/**
 * Nesting Module — Integration Tests
 *
 * Tests the full nesting pipeline from DXF string to nesting result.
 */

import { expect } from 'expect'
import { nest, nestFromDxf, resetNestingState } from '../../../src/nesting/applyNesting'
import { toNestedSvg } from '../../../src/nesting/toNestedSvg'
import { NestingHelper } from '../../../src/nesting/NestingHelper'

// Minimal DXF with closed shapes
const MINIMAL_DXF = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1027
0
ENDSEC
0
SECTION
2
TABLES
0
ENDSEC
0
SECTION
2
BLOCKS
0
ENDSEC
0
SECTION
2
ENTITIES
0
CIRCLE
8
PARTS
10
50
20
50
40
10
0
CIRCLE
8
PARTS
10
100
20
100
40
10
0
LWPOLYLINE
8
PARTS
90
4
70
1
10
0
20
0
10
50
20
0
10
50
20
50
10
0
20
50
0
ENDSEC
0
EOF
`

describe('nesting integration', () => {
  beforeEach(() => {
    resetNestingState()
  })

  describe('nestFromDxf', () => {
    it('should nest from a DXF string', async () => {
      const result = await nestFromDxf(MINIMAL_DXF, {
        stockSheet: { width: 300, height: 300 },
        algorithm: 'guillotine',
        kerf: 2,
        margin: 10,
      })

      expect(result.placements.length).toBeGreaterThan(0)
      expect(result.sheetCount).toBeGreaterThan(0)
      expect(result.utilization).toBeGreaterThan(0)
    })

    it('should return empty result for DXF with no closed shapes', async () => {
      const emptyDxf = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1027
0
ENDSEC
0
SECTION
2
ENTITIES
0
LINE
8
0
10
0
20
0
11
10
21
10
0
ENDSEC
0
EOF
`
      const result = await nestFromDxf(emptyDxf, {
        stockSheet: { width: 300, height: 300 },
      })

      expect(result.placements.length).toBe(0)
      expect(result.utilization).toBe(0)
    })
  })

  describe('NestingHelper', () => {
    it('should nest DXF content', async () => {
      const helper = new NestingHelper(MINIMAL_DXF)
      const result = await helper.nest({
        stockSheet: { width: 300, height: 300 },
        algorithm: 'maxrects',
        kerf: 2,
        margin: 10,
      })

      expect(result.placements.length).toBeGreaterThan(0)
      expect(helper.nestingResult).toBe(result)
    })

    it('should generate SVG output', async () => {
      const helper = new NestingHelper(MINIMAL_DXF)
      await helper.nest({
        stockSheet: { width: 300, height: 300 },
      })

      const svg = helper.toNestedSvg()
      expect(svg).toContain('<svg')
      expect(svg).toContain('</svg>')
      expect(svg).toContain('Nesting Metrics')
    })

    it('should generate DXF output', async () => {
      const helper = new NestingHelper(MINIMAL_DXF)
      await helper.nest({
        stockSheet: { width: 300, height: 300 },
      })

      const dxf = helper.toNestedDxf()
      expect(dxf).toContain('SECTION')
      expect(dxf).toContain('ENTITIES')
    })

    it('should throw when accessing result before nesting', () => {
      const helper = new NestingHelper(MINIMAL_DXF)
      expect(() => {
        helper.nestingResult
      }).toThrow()
    })

    it('should throw when generating SVG before nesting', () => {
      const helper = new NestingHelper(MINIMAL_DXF)
      expect(() => {
        helper.toNestedSvg()
      }).toThrow()
    })
  })

  describe('toNestedSvg', () => {
    it('should generate valid SVG', async () => {
      const result = await nestFromDxf(MINIMAL_DXF, {
        stockSheet: { width: 300, height: 300 },
      })

      // Extract shapes for SVG
      const svg = toNestedSvg(result, [], {})
      expect(svg).toContain('<svg')
      expect(svg).toContain('viewBox')
    })

    it('should include metrics overlay', async () => {
      const result = await nestFromDxf(MINIMAL_DXF, {
        stockSheet: { width: 300, height: 300 },
      })

      const svg = toNestedSvg(result, [], { showMetrics: true })
      expect(svg).toContain('Nesting Metrics')
      expect(svg).toContain('Utilization')
    })

    it('should omit metrics when disabled', async () => {
      const result = await nestFromDxf(MINIMAL_DXF, {
        stockSheet: { width: 300, height: 300 },
      })

      const svg = toNestedSvg(result, [], { showMetrics: false })
      expect(svg).not.toContain('Nesting Metrics')
    })
  })
})
