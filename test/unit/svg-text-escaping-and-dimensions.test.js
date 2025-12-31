import expectModule from 'expect'
import fs from 'node:fs'
import { parseString, toSVG } from '../../src'
import { getResourcePath } from './test-helpers.js'

// ESM compatibility: extract expect function
const expect = expectModule.expect || expectModule.default

const extractNumbersFrom = (re, text) => {
  const out = []
  let match
  while ((match = re.exec(text)) !== null) {
    const num = Number.parseFloat(match[1])
    if (Number.isFinite(num)) out.push(num)
  }
  return out
}

describe('SVG text escaping', () => {
  it('escapes < and > in TEXT entity content', () => {
    const dxf = [
      '0', 'SECTION',
      '2', 'ENTITIES',
      '0', 'TEXT',
      '8', '0',
      '10', '0',
      '20', '0',
      '40', '1',
      '1', 'A<B',
      '0', 'ENDSEC',
      '0', 'EOF',
      '',
    ].join('\n')

    const svg = toSVG(parseString(dxf))

    expect(svg).toContain('A&lt;B')
    expect(svg).not.toContain('A<B')
  })
})

describe('DIMENSION SVG rendering', () => {
  it('renders numeric dimension text for dimensions.dxf', () => {
    const parsed = parseString(
      fs.readFileSync(getResourcePath(import.meta.url, 'dimensions.dxf'), 'utf-8'),
    )
    const svg = toSVG(parsed)

    // Expect at least one text node to contain a digit.
    // This guards against missing measurement text due to empty DIMENSION text.
    expect(svg).toMatch(/<text[^>]*>[^<]*\d[^<]*<\/text>/)
  })

  it('auto-scales arrow/text sizes when enabled', () => {
    const parsed = parseString(
      fs.readFileSync(getResourcePath(import.meta.url, 'dimensions.dxf'), 'utf-8'),
    )

    const svgDefault = toSVG(parsed)
    const svgAuto = toSVG(parsed, { dimension: { autoScale: true } })

    const markerWidthsDefault = extractNumbersFrom(/markerWidth="([-0-9.e]+)"/g, svgDefault)
    const markerWidthsAuto = extractNumbersFrom(/markerWidth="([-0-9.e]+)"/g, svgAuto)
    expect(markerWidthsDefault.length).toBeGreaterThan(0)
    expect(markerWidthsAuto.length).toBeGreaterThan(0)

    const maxMarkerDefault = Math.max(...markerWidthsDefault)
    const maxMarkerAuto = Math.max(...markerWidthsAuto)
    expect(Math.abs(maxMarkerAuto - maxMarkerDefault)).toBeGreaterThan(1e-9)

    const fontSizesDefault = extractNumbersFrom(/font-size="([-0-9.e]+)"/g, svgDefault)
    const fontSizesAuto = extractNumbersFrom(/font-size="([-0-9.e]+)"/g, svgAuto)
    expect(fontSizesDefault.length).toBeGreaterThan(0)
    expect(fontSizesAuto.length).toBeGreaterThan(0)

    const maxFontDefault = Math.max(...fontSizesDefault)
    const maxFontAuto = Math.max(...fontSizesAuto)
    expect(Math.abs(maxFontAuto - maxFontDefault)).toBeGreaterThan(1e-9)
  })

  it('defines forward and backward arrow markers', () => {
    const parsed = parseString(
      fs.readFileSync(getResourcePath(import.meta.url, 'dimensions.dxf'), 'utf-8'),
    )

    const svg = toSVG(parsed)

    const markerTags = svg.match(/<marker\b[^>]*>/g) ?? []
    expect(markerTags.length).toBeGreaterThan(0)

    const markers = markerTags
      .map((tag) => {
        const markerWidth = /markerWidth="([-0-9.e]+)"/i.exec(tag)?.[1]
        const refX = /refX="([-0-9.e]+)"/i.exec(tag)?.[1]
        return {
          markerWidth: markerWidth ? Number.parseFloat(markerWidth) : Number.NaN,
          refX: refX ? Number.parseFloat(refX) : Number.NaN,
        }
      })
      .filter((m) => Number.isFinite(m.markerWidth) && Number.isFinite(m.refX))

    expect(markers.length).toBeGreaterThan(0)

    const hasBackward = markers.some((m) => Math.abs(m.refX) < 1e-9)
    const hasForward = markers.some((m) => Math.abs(m.refX - m.markerWidth) < 1e-9)

    expect(hasBackward).toBe(true)
    expect(hasForward).toBe(true)
  })

  it('does not render marker-only zero-length lines', () => {
    const parsed = parseString(
      fs.readFileSync(getResourcePath(import.meta.url, 'dimensions.dxf'), 'utf-8'),
    )

    const svg = toSVG(parsed, { dimension: { autoScale: true } })

    const lineTags = svg.match(/<line\b[^>]*>/g) ?? []
    const markerLines = lineTags.filter((t) => /marker-(start|end)=/i.test(t))
    expect(markerLines.length).toBeGreaterThan(0)

    const parseNum = (tag, attr) => {
      const m = new RegExp(`${attr}="([-0-9.e]+)"`, 'i').exec(tag)
      return m ? Number.parseFloat(m[1]) : Number.NaN
    }

    const zeroish = markerLines.filter((tag) => {
      const x1 = parseNum(tag, 'x1')
      const y1 = parseNum(tag, 'y1')
      const x2 = parseNum(tag, 'x2')
      const y2 = parseNum(tag, 'y2')
      if (![x1, y1, x2, y2].every(Number.isFinite)) return false
      const len = Math.hypot(x2 - x1, y2 - y1)
      return len < 1e-6
    })

    expect(zeroish).toEqual([])
  })

  it('supports viewport-percentage autoScale overrides per element', () => {
    const parsed = parseString(
      fs.readFileSync(getResourcePath(import.meta.url, 'dimensions.dxf'), 'utf-8'),
    )

    const svg = toSVG(parsed, {
      dimension: {
        autoScale: true,
        autoScaleViewportPercentages: {
          arrowSize: 10, // 10% of viewport min
          textHeight: 5, // 5% of viewport min
        },
      },
    })

    const viewBox = /viewBox="([-0-9.e]+)\s+([-0-9.e]+)\s+([-0-9.e]+)\s+([-0-9.e]+)"/i.exec(svg)
    expect(viewBox).not.toBeNull()
    const viewBoxWidth = Number.parseFloat(viewBox[3])
    const viewBoxHeight = Number.parseFloat(viewBox[4])
    const viewportMin = Math.min(Math.abs(viewBoxWidth), Math.abs(viewBoxHeight))
    expect(Number.isFinite(viewportMin)).toBe(true)
    expect(viewportMin).toBeGreaterThan(0)

    const targetArrow = viewportMin * 0.1
    const targetText = viewportMin * 0.05

    const markerWidths = extractNumbersFrom(/markerWidth="([-0-9.e]+)"/g, svg)
    const fontSizes = extractNumbersFrom(/font-size="([-0-9.e]+)"/g, svg)
    expect(markerWidths.length).toBeGreaterThan(0)
    expect(fontSizes.length).toBeGreaterThan(0)

    const maxMarker = Math.max(...markerWidths)
    const maxFont = Math.max(...fontSizes)

    // Tolerate small floating point and bbox-related variations.
    expect(Math.abs(maxMarker - targetArrow)).toBeLessThan(viewportMin * 0.02)
    expect(Math.abs(maxFont - targetText)).toBeLessThan(viewportMin * 0.02)
  })

  it('does not throw for angular 3-point DIMENSION (type 5)', () => {
    const parsed = parseString(
      fs.readFileSync(getResourcePath(import.meta.url, 'dimensions-angular-3p.dxf'), 'utf-8'),
    )

    const svg = toSVG(parsed)

    // Should render an angular arc (SVG A command).
    expect(svg).toMatch(/<path\s+d="[^"]*A\s+/)

    // Angular dimensions should render a degree sign in the measurement.
    expect(svg).toContain('°')
  })
})
