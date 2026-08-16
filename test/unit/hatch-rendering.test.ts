import expect from 'expect'
import fs from 'node:fs'

import { parseString, toSVG } from '../../src'
import { getResourcePath } from './test-helpers.ts'

const hatchFixture = fs.readFileSync(
  getResourcePath(import.meta.url, 'hatches.dxf'),
  'utf-8',
)

describe('HATCH SVG rendering', () => {
  it('renders a solid hatch with nested hole contours as one evenodd path', () => {
    const parsed = parseString(hatchFixture)
    const hatch = parsed.entities[0] as {
      type: 'HATCH'
      fillType?: 'SOLID' | 'PATTERN'
      boundary: {
        loops: Array<{
          references: Array<string | number>
          entities: Array<{
            type: 'LINE'
            start: { x: number; y: number }
            end: { x: number; y: number }
          }>
          type?: number
          count?: number
          edgeType?: number
          sourceObjects?: number
        }>
      }
    }

    hatch.fillType = 'SOLID'
    hatch.boundary.loops.push({
      references: [],
      entities: [
        {
          type: 'LINE',
          start: { x: 20, y: 20 },
          end: { x: 80, y: 20 },
        },
        {
          type: 'LINE',
          start: { x: 80, y: 20 },
          end: { x: 80, y: 80 },
        },
        {
          type: 'LINE',
          start: { x: 80, y: 80 },
          end: { x: 20, y: 80 },
        },
        {
          type: 'LINE',
          start: { x: 20, y: 80 },
          end: { x: 20, y: 20 },
        },
      ],
      type: 0,
      count: 4,
      edgeType: 1,
      sourceObjects: 0,
    })
    parsed.entities = [hatch]

    const svg = toSVG(parsed)

    expect(svg).toContain('fill-rule="evenodd"')
    expect(svg).toContain(
      '<path d="M0,100L0,0L100,0L100,100Z M20,20L80,20L80,80L20,80Z" fill-rule="evenodd" />',
    )
    expect(svg).toContain('fill="rgb(0, 0, 0)"')
  })
})
