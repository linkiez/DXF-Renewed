import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const closedPolylineDxf = `0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
1
0
LAYER
2
0
70
0
62
3
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
0
LWPOLYLINE
8
0
90
4
70
1
10
0
20
0
10
20
20
0
10
20
20
10
10
0
20
10
0
ENDSEC
0
EOF
`

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
  const screenshotPath = resolve(
    `test/rendered/${fixtureName.replace(/\.dxf$/i, '')}.png`,
  )
  await mkdir(dirname(screenshotPath), { recursive: true })
  await page.locator('#render-output svg').screenshot({ path: screenshotPath })
}

const renderSvg = async (page, svg) => {
  await page.evaluate((svgString) => {
    globalThis.renderSVGToDom(svgString)
  }, svg)
  await expect(page.locator('#render-output svg')).toBeVisible()
}

test.describe('SVG browser integration: implemented entity renderers', () => {
  const cases = [
    {
      fixture: 'arc15.dxf',
      assertions: [(svg) => expect(svg).toMatch(/<path\s+d="[^"]*A\s+/)],
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
      assertions: [(svg) => expect(svg).toContain('<path')],
    },
    {
      fixture: 'lwpolylines.dxf',
      assertions: [(svg) => expect(svg).toContain('<path')],
    },
    {
      fixture: 'polylines.dxf',
      assertions: [(svg) => expect(svg).toContain('<path')],
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
          const markerWidths = extractNumbersFrom(
            /markerWidth="([-0-9.e]+)"/g,
            svg,
          )
          const fontSizes = extractNumbersFrom(/font-size="([-0-9.e]+)"/g, svg)

          // If the fixture has no markers (unexpected), still allow validation
          // to pass via font-size, and vice-versa.
          expect(markerWidths.length + fontSizes.length).toBeGreaterThan(0)

          const differsFromDefault = (values) =>
            values.some((v) => Math.abs(v - 2.5) > 1e-9)
          expect(
            differsFromDefault(markerWidths) || differsFromDefault(fontSizes),
          ).toBeTruthy()
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
          const markerWidths = extractNumbersFrom(
            /markerWidth="([-0-9.e]+)"/g,
            svg,
          )
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
      assertions: [(svg) => expect(svg).toContain('<path')],
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

      const svg = await page.evaluate(
        async ({ fixtureName, options }) => {
          return await globalThis.renderFixtureToSVG(fixtureName, options)
        },
        { fixtureName: fixture, options: toSVGOptions },
      )

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

  test('fills closed polylines using entity color when the fill toggle is enabled', async ({
    page,
  }) => {
    await page.goto('/')

    const svg = await page.evaluate(
      ({ dxfText }) => {
        const parsed = globalThis.dxf.parseString(dxfText)
        return globalThis.dxf.toSVG(parsed, { fillClosedPolylines: true })
      },
      { dxfText: closedPolylineDxf },
    )

    expect(svg).toContain('fill-rule="evenodd"')
    expect(svg).toContain('fill="rgb(0, 255, 0)"')
    expect(svg).toContain('stroke="rgb(0, 255, 0)"')

    await renderSvg(page, svg)
    await ensureRenderedPng(page, 'session-fill-closed-polylines')
  })

  test('renders solid HATCH loops with holes as one evenodd path', async ({
    page,
  }) => {
    await page.goto('/')

    const svg = await page.evaluate(async () => {
      const response = await fetch('/fixtures/hatches.dxf')
      const dxfText = await response.text()
      const parsed = globalThis.dxf.parseString(dxfText)
      const hatch = parsed.entities[0]

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

      return globalThis.dxf.toSVG(parsed)
    })

    expect(svg).toContain('fill-rule="evenodd"')
    expect(svg).toContain('fill="rgb(0, 0, 0)"')
    expect(svg).toContain('M20,20L80,20L80,80L20,80Z')

    await renderSvg(page, svg)
    await ensureRenderedPng(page, 'session-hatch-evenodd-hole')
  })

  test('supports screen-relative and viewport-relative global stroke-width', async ({
    page,
  }) => {
    await page.goto('/')

    const { screenSvg, viewportSvg } = await page.evaluate(
      ({ dxfText }) => {
        const parsed = globalThis.dxf.parseString(dxfText)
        return {
          screenSvg: globalThis.dxf.toSVG(parsed, {
            strokeWidth: { mode: 'screen', value: 0.25 },
          }),
          viewportSvg: globalThis.dxf.toSVG(parsed, {
            strokeWidth: { mode: 'viewport', value: 1 },
          }),
        }
      },
      { dxfText: closedPolylineDxf },
    )

    expect(screenSvg).toContain('stroke-width="0.25%"')
    expect(viewportSvg).toContain('viewBox="0 -10 20 10"')
    expect(viewportSvg).toContain('stroke-width="0.1"')

    await renderSvg(page, viewportSvg)
    await ensureRenderedPng(page, 'session-stroke-width-viewport')
  })

  test('applies stroke-width scaling to DIMENSION entities', async ({
    page,
  }) => {
    await page.goto('/')

    const { screenSvg, viewportSvg } = await page.evaluate(async () => {
      const response = await fetch('/fixtures/dimensions.dxf')
      const dxfText = await response.text()
      const parsed = globalThis.dxf.parseString(dxfText)

      return {
        screenSvg: globalThis.dxf.toSVG(parsed, {
          strokeWidth: { mode: 'screen', value: 0.25 },
        }),
        viewportSvg: globalThis.dxf.toSVG(parsed, {
          strokeWidth: { mode: 'viewport', value: 1 },
        }),
      }
    })

    expect(screenSvg).toMatch(/stroke-width="0\.25%"/)
    expect(viewportSvg).toContain('stroke-width="0.9"')
    expect(viewportSvg).not.toContain('stroke-width="-')

    await renderSvg(page, viewportSvg)
    await ensureRenderedPng(page, 'session-dimension-stroke-width-viewport')
  })
})
