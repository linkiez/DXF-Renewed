import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const extractNumbersFrom = (re, text) => {
  const out = []
  let match
  while ((match = re.exec(text)) !== null) {
    const num = Number.parseFloat(match[1])
    if (Number.isFinite(num)) out.push(num)
  }
  return out
}

const ensureRenderedPng = async (page, fixtureName) => {
  const screenshotPath = resolve(`test/rendered/${fixtureName.replace(/\.dxf$/i, '')}.png`)
  await mkdir(dirname(screenshotPath), { recursive: true })
  await page.locator('#render-output svg').screenshot({ path: screenshotPath })
}

test.describe('SVG browser integration: implemented entity renderers', () => {
  const cases = [
    {
      fixture: 'arc15.dxf',
      assertions: [
        (svg) => expect(svg).toMatch(/<path\s+d="[^"]*A\s+/),
      ],
    },
    {
      fixture: 'circlesellipsesarcs.dxf',
      assertions: [
        (svg) => expect(svg).toContain('<circle'),
        (svg) => expect(svg).toContain('<ellipse'),
        (svg) => expect(svg).toContain('<path'),
      ],
    },
    {
      fixture: 'lines.dxf',
      assertions: [
        (svg) => expect(svg).toContain('<path'),
      ],
    },
    {
      fixture: 'lwpolylines.dxf',
      assertions: [
        (svg) => expect(svg).toContain('<path'),
      ],
    },
    {
      fixture: 'polylines.dxf',
      assertions: [
        (svg) => expect(svg).toContain('<path'),
      ],
    },
    {
      fixture: 'splines.dxf',
      assertions: [
        (svg) => expect(svg).toContain('<path'),
        // Bezier conversion generates C/Q commands with spaces (unlike polyline paths).
        (svg) => expect(svg).toMatch(/\s[QC]\s/),
      ],
    },
    {
      fixture: 'texts.dxf',
      assertions: [
        (svg) => expect(svg).toContain('<text'),
        (svg) => expect(svg).toContain('</text>'),
      ],
    },
    {
      // This fixture includes MTEXT entities.
      fixture: 'dimensions.dxf',
      toSVGOptions: { dimension: { autoScale: true } },
      assertions: [
        (svg) => expect(svg).toContain('<text'),
        (svg) => {
          // Guard against regressions where toSVGOptions are ignored.
          // Default DIMSTYLE arrow size / text height is typically 2.5.
          // With autoScale enabled for this fixture, we expect at least one
          // markerWidth or font-size to differ from 2.5.
          const markerWidths = extractNumbersFrom(/markerWidth="([-0-9.e]+)"/g, svg)
          const fontSizes = extractNumbersFrom(/font-size="([-0-9.e]+)"/g, svg)

          // If the fixture has no markers (unexpected), still allow validation
          // to pass via font-size, and vice-versa.
          expect(markerWidths.length + fontSizes.length).toBeGreaterThan(0)

          const differsFromDefault = (values) => values.some((v) => Math.abs(v - 2.5) > 1e-9)
          expect(differsFromDefault(markerWidths) || differsFromDefault(fontSizes)).toBeTruthy()
        },
      ],
    },
    {
      fixture: 'dimension-type-0-linear.dxf',
      toSVGOptions: { dimension: { autoScale: true } },
      assertions: [
        (svg) => expect(svg).toContain('<text'),
        (svg) => expect(svg).toContain('<path'),
      ],
    },
    {
      fixture: 'dimension-type-1-aligned.dxf',
      toSVGOptions: { dimension: { autoScale: true } },
      assertions: [
        (svg) => expect(svg).toContain('<text'),
        (svg) => expect(svg).toContain('<path'),
      ],
    },
    {
      fixture: 'dimension-type-2-angular-2l.dxf',
      toSVGOptions: { dimension: { autoScale: true } },
      assertions: [
        (svg) => expect(svg).toMatch(/<path\s+d="[^"]*A\s+/),
        (svg) => expect(svg).toContain('°'),
      ],
    },
    {
      fixture: 'dimension-type-3-diameter.dxf',
      toSVGOptions: { dimension: { autoScale: true } },
      assertions: [
        (svg) => expect(svg).toContain('<text'),
        (svg) => expect(svg).toContain('⌀'),
      ],
    },
    {
      fixture: 'dimension-type-4-radius.dxf',
      toSVGOptions: { dimension: { autoScale: true } },
      assertions: [
        (svg) => expect(svg).toContain('<text'),
        (svg) => expect(svg).toContain('R'),
      ],
    },
    {
      fixture: 'dimension-type-5-angular-3p.dxf',
      toSVGOptions: { dimension: { autoScale: true } },
      assertions: [
        (svg) => expect(svg).toMatch(/<path\s+d="[^"]*A\s+/),
        (svg) => expect(svg).toContain('°'),
      ],
    },
    {
      fixture: 'dimension-type-6-ordinate-x.dxf',
      toSVGOptions: { dimension: { autoScale: true } },
      assertions: [
        (svg) => expect(svg).toContain('<text'),
        (svg) => expect(svg).toContain('<line'),
      ],
    },
    {
      fixture: 'dimension-type-6-ordinate-y.dxf',
      toSVGOptions: { dimension: { autoScale: true } },
      assertions: [
        (svg) => expect(svg).toContain('<text'),
        (svg) => expect(svg).toContain('<line'),
      ],
    },
    {
      fixture: 'dimensions-angular-3p.dxf',
      toSVGOptions: { dimension: { autoScale: true } },
      assertions: [
        (svg) => expect(svg).toMatch(/<path\s+d="[^"]*A\s+/),
        (svg) => expect(svg).toContain('°'),
      ],
    },
    {
      fixture: 'dimensions-large-scale.dxf',
      toSVGOptions: { dimension: { autoScale: true } },
      assertions: [
        (svg) => expect(svg).toContain('<text'),
        (svg) => {
          const markerWidths = extractNumbersFrom(/markerWidth="([-0-9.e]+)"/g, svg)
          const fontSizes = extractNumbersFrom(/font-size="([-0-9.e]+)"/g, svg)
          expect(markerWidths.length + fontSizes.length).toBeGreaterThan(0)

          const maxMarker = markerWidths.length ? Math.max(...markerWidths) : 0
          const maxFont = fontSizes.length ? Math.max(...fontSizes) : 0

          // With a very large modelspace extent, viewport-based autoScale should
          // produce noticeably larger markers/text than the default 2.5.
          expect(Math.max(maxMarker, maxFont)).toBeGreaterThan(100)
        },
      ],
    },
    {
      fixture: 'leader-basic.dxf',
      assertions: [
        (svg) => expect(svg).toContain('<path'),
      ],
    },
    {
      fixture: 'tolerance-basic.dxf',
      assertions: [
        (svg) => expect(svg).toContain('<text'),
        (svg) => expect(svg).toContain('</text>'),
      ],
    },
  ]

  for (const { fixture, assertions, toSVGOptions } of cases) {
    test(`renders ${fixture} without throwing`, async ({ page }) => {
      await page.goto('/')

      const svg = await page.evaluate(async ({ fixtureName, options }) => {
        return await globalThis.renderFixtureToSVG(fixtureName, options)
      }, { fixtureName: fixture, options: toSVGOptions })

      await page.evaluate(async (svgString) => {
        globalThis.renderSVGToDom(svgString)
      }, svg)

      expect(svg).toContain('<svg')
      expect(svg).toContain('</svg>')
      expect(svg).toMatch(/viewBox="[^"]+"/)

      for (const assertFn of assertions) {
        assertFn(svg)
      }

      await ensureRenderedPng(page, fixture)
    })
  }
})
