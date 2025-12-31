import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

test.describe('SVG browser integration: DIMENSION', () => {
  test('renders vertical DIMENSION with markers and text', async ({ page }) => {
    await page.goto('/')

    const svg = await page.evaluate(async () => {
      return await globalThis.renderFixtureToSVG('dimension-vertical.dxf')
    })

    await page.evaluate(async (svgString) => {
      globalThis.renderSVGToDom(svgString)
    }, svg)

    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    expect(svg).toMatch(/viewBox="[^"]+"/)

    // Non-deterministic marker IDs (Date.now) must be asserted by pattern.
    expect(svg).toMatch(/dim-arrow-start-\d+/)
    expect(svg).toMatch(/dim-arrow-end-\d+/)
    expect(svg).toMatch(/marker-start="url\(#dim-arrow-start-\d+\)"/)
    expect(svg).toMatch(/marker-end="url\(#dim-arrow-end-\d+\)"/)

    // The fixture includes dimension text 5.35
    expect(svg).toContain('>5.35</text>')

    const screenshotPath = resolve('test/rendered/dimension-vertical.png')
    await mkdir(dirname(screenshotPath), { recursive: true })

    await page.locator('#render-output svg').screenshot({ path: screenshotPath })
  })
})
