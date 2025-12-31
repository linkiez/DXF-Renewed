import expectModule from 'expect'
import fs from 'node:fs'
import { parseString, toSVG } from '../../src'
import { getResourcePath } from '../unit/test-helpers.js'

const expect = expectModule.expect || expectModule.default

describe('SVG integration: DIMENSION', () => {
  it('renders vertical DIMENSION with markers and text', () => {
    const dxfText = fs.readFileSync(
      getResourcePath(import.meta.url, 'dimension-vertical.dxf'),
      'utf-8',
    )

    const parsed = parseString(dxfText)
    const svg = toSVG(parsed)

    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')

    // Dimension rendering uses marker IDs based on Date.now() (non-deterministic);
    // validate the structure using a stable prefix.
    expect(svg).toMatch(/<marker id="dim-arrow-start-\d+"/)
    expect(svg).toMatch(/<marker id="dim-arrow-end-\d+"/)

    // The dimension line should reference marker-start/marker-end.
    expect(svg).toMatch(/marker-start="url\(#dim-arrow-start-\d+\)"/)
    expect(svg).toMatch(/marker-end="url\(#dim-arrow-end-\d+\)"/)

    // The DXF fixture includes explicit text.
    expect(svg).toContain('>5.35</text>')
  })
})
