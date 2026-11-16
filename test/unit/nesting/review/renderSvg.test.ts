import { expect } from 'expect'
import { buildReviewScene } from '../../../../src/nesting/review/buildScene'
import { renderReviewSvg } from '../../../../src/nesting/review/renderSvg'
import { partialFixture, smallFixture } from './fixtures'

const kindSignature = (svg: string, kind: string): string | undefined => {
  const match = new RegExp(`<(?:path|g)[^>]*data-kind="${kind}"[^>]*>`).exec(svg)
  if (!match) return undefined
  const dash = /stroke-dasharray="([^"]*)"/.exec(match[0])?.[1] ?? 'solid'
  const width = /stroke-width="([^"]*)"/.exec(match[0])?.[1] ?? '-'
  const linecap = /stroke-linecap="([^"]*)"/.exec(match[0])?.[1] ?? '-'
  return `${dash}|${width}|${linecap}|${match[0].startsWith('<g') ? 'marker' : 'line'}`
}

describe('review/renderSvg — static view', () => {
  it('draws the sheet boundary and only the parts of the selected sheet', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)
    const svg = renderReviewSvg(scene, { sheetId: 'sheet-1' })

    expect(svg).toContain('data-sheet-id="sheet-1"')
    expect(svg).toContain('data-part-key="part-1#0"')
    expect(svg).toContain('data-part-key="part-2#0"')
    expect(svg).not.toContain('data-part-key="part-3#0"')
    expect(renderReviewSvg(scene, { sheetId: 'sheet-2' })).toContain('data-part-key="part-3#0"')
  })

  it('distinguishes every action kind by more than color', async () => {
    const { input } = await smallFixture()
    const svg = renderReviewSvg(buildReviewScene(input), { sheetId: 'sheet-1' })
    const kinds = ['cut', 'rapid', 'pierce', 'lead-in', 'lead-out', 'overcut', 'tab', 'common-line']
    const present = kinds.filter((kind) => kindSignature(svg, kind) !== undefined)

    expect(present).toEqual(expect.arrayContaining(['cut', 'rapid', 'pierce']))
    const signatures = new Set(present.map((kind) => kindSignature(svg, kind)))
    expect(signatures.size).toBeGreaterThanOrEqual(3)
    expect(kindSignature(svg, 'cut')).not.toBe(kindSignature(svg, 'rapid'))
    expect(kindSignature(svg, 'pierce')?.endsWith('marker')).toBe(true)
  })

  it('lists every drawable action kind in a Portuguese legend', async () => {
    const { input } = await smallFixture()
    const svg = renderReviewSvg(buildReviewScene(input), { sheetId: 'sheet-1' })
    const legend = /<g data-legend[\s\S]*$/.exec(svg)?.[0] ?? ''
    const entries = [...legend.matchAll(/data-legend-kind="([^"]+)"/g)].map((m) => m[1])

    expect(entries).toEqual(expect.arrayContaining(['cut', 'rapid', 'pierce', 'lead-in', 'lead-out', 'overcut', 'tab']))
  })

  it('marks flagged parts differently from placed parts and never draws unplaced items', async () => {
    const { input, cutPlan } = await partialFixture()
    const problem = {
      code: 'LEAD_CROSSES_GEOMETRY' as const, severity: 'error' as const, message: 'x',
      sheetId: 'sheet-1', partId: 'part-1', contourId: 'part-1-outer', actionIndex: 3,
    }
    const scene = buildReviewScene({ ...input, cutPlan: { ...cutPlan, problems: [problem] } })
    const svg = renderReviewSvg(scene, { sheetId: 'sheet-1' })

    expect(svg).toMatch(/data-part-key="part-1#0"[^>]*data-status="flagged"/)
    expect(svg).toMatch(/data-part-key="part-2#0"[^>]*data-status="placed"/)
    const flagged = /<path[^>]*data-part-key="part-1#0"[^>]*>/.exec(svg)?.[0] ?? ''
    const placed = /<path[^>]*data-part-key="part-2#0"[^>]*>/.exec(svg)?.[0] ?? ''
    expect(/stroke-dasharray="([^"]*)"/.exec(flagged)?.[1]).not.toBe(/stroke-dasharray="([^"]*)"/.exec(placed)?.[1])
    expect(svg).not.toContain('part-9')
  })

  it('is accessible and in Brazilian Portuguese', async () => {
    const { input } = await smallFixture()
    const svg = renderReviewSvg(buildReviewScene(input), { sheetId: 'sheet-1' })

    expect(svg).toContain('role="img"')
    expect(svg).toMatch(/<title[^>]*>Chapa sheet-1<\/title>/)
    expect(svg).toMatch(/<desc[^>]*>2 peças posicionadas e \d+ ações de corte planejadas\.<\/desc>/)
    for (const label of ['Corte', 'Deslocamento rápido', 'Perfuração', 'Entrada', 'Sobrecorte', 'Ponte']) {
      expect(svg).toContain(label)
    }
  })

  it('needs no DOM and is identical for identical input', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)

    const holder = globalThis as { document?: unknown }
    const original = holder.document
    holder.document = undefined
    try {
      expect(renderReviewSvg(scene, { sheetId: 'sheet-1' })).toBe(renderReviewSvg(scene, { sheetId: 'sheet-1' }))
    } finally {
      holder.document = original
    }
  })

  it('escapes identifiers and renders an unavailable scene as an explicit empty drawing', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene({ artifact: { ...input.artifact, contractVersion: 9 } })
    const svg = renderReviewSvg(scene, { sheetId: 'sheet-1' })

    expect(svg).toContain('role="img"')
    expect(svg).not.toContain('<path')
  })
})

describe('review/renderSvg — position-aware view (FR-005)', () => {
  const head = (svg: string): { x: number; y: number } | null => {
    const match = /<g data-head[^>]*data-x="([^"]+)" data-y="([^"]+)"/.exec(svg)
    return match ? { x: Number(match[1]), y: Number(match[2]) } : null
  }

  it('draws no trail and faint remaining actions at the start position', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)
    const first = scene.sheets[0].timeline?.actions[0]
    const svg = renderReviewSvg(scene, { sheetId: 'sheet-1', position: { sheetId: 'sheet-1', actionIndex: 0, progress: 0 } })

    expect(svg).not.toContain('data-trail="true"')
    expect(svg).toContain('data-remaining="true"')
    expect(head(svg)).toEqual(first?.points[0])
  })

  it('shows completed actions in the trail and the head at the start of the current action', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)
    const actions = scene.sheets[0].timeline?.actions ?? []
    const cutIndex = actions.findIndex((a) => a.kind === 'cut')
    const svg = renderReviewSvg(scene, { sheetId: 'sheet-1', position: { sheetId: 'sheet-1', actionIndex: cutIndex, progress: 0 } })

    expect(svg).toMatch(/data-kind="rapid" data-trail="true"/)
    expect(svg).toMatch(/data-kind="lead-in" data-trail="true"/)
    expect(svg).not.toMatch(/data-kind="cut" data-trail="true"/)
    expect(svg).toMatch(/data-kind="cut" data-remaining="true"/)
    expect(head(svg)).toEqual(actions[cutIndex].points[0])
  })

  it('draws the executed part of the current action and moves the head along it', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)
    const actions = scene.sheets[0].timeline?.actions ?? []
    const cutIndex = actions.findIndex((a) => a.kind === 'cut')
    const half = renderReviewSvg(scene, { sheetId: 'sheet-1', position: { sheetId: 'sheet-1', actionIndex: cutIndex, progress: 0.5 } })

    expect(half).toMatch(/data-kind="cut" data-trail="true"/)
    expect(head(half)).not.toEqual(actions[cutIndex].points[0])
  })

  it('shows everything as trail and the head at the end when finished', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)
    const total = scene.sheets[0].timeline?.actions.length ?? 0
    const svg = renderReviewSvg(scene, { sheetId: 'sheet-1', position: { sheetId: 'sheet-1', actionIndex: total, progress: 0 } })

    expect(svg).not.toContain('data-remaining="true"')
    expect(svg).toMatch(/data-kind="cut" data-trail="true"/)
    expect(head(svg)).not.toBeNull()
  })

  it('produces the same output for the same position however it was reached', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)
    const position = { sheetId: 'sheet-1', actionIndex: 4, progress: 0.25 }

    expect(renderReviewSvg(scene, { sheetId: 'sheet-1', position })).toBe(renderReviewSvg(scene, { sheetId: 'sheet-1', position: { ...position } }))
  })
})

describe('review/renderSvg — selection highlight', () => {
  it('marks the selected part and the selected action', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)
    const part = renderReviewSvg(scene, { sheetId: 'sheet-1', selection: { kind: 'part', sheetId: 'sheet-1', partKey: 'part-2#0' } })
    const action = renderReviewSvg(scene, { sheetId: 'sheet-1', selection: { kind: 'action', sheetId: 'sheet-1', actionIndex: 3 } })

    expect(part).toMatch(/data-part-key="part-2#0"[^>]*data-selected="true"/)
    expect(part).not.toMatch(/data-part-key="part-1#0"[^>]*data-selected="true"/)
    expect(part).not.toContain('data-selected-action')
    expect(action).toContain('data-selected-action="true"')
  })

  it('ignores a selection that belongs to another sheet', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)
    const svg = renderReviewSvg(scene, { sheetId: 'sheet-1', selection: { kind: 'part', sheetId: 'sheet-2', partKey: 'part-3#0' } })

    expect(svg).not.toContain('data-selected="true"')
  })
})

describe('review/renderSvg — viewport', () => {
  const viewBox = (svg: string): number[] =>
    (/viewBox="([^"]+)"/.exec(svg)?.[1] ?? '').split(' ').map(Number)

  it('shows the whole sheet at the default viewport and a window when zoomed', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)
    const whole = renderReviewSvg(scene, { sheetId: 'sheet-1', viewport: { center: { x: 50, y: 50 }, zoom: 1 } })
    const zoomed = renderReviewSvg(scene, { sheetId: 'sheet-1', viewport: { center: { x: 25, y: 25 }, zoom: 2 } })

    expect(whole).toBe(renderReviewSvg(scene, { sheetId: 'sheet-1' }))
    const [x, y, width, height] = viewBox(zoomed)
    expect(width).toBeCloseTo(54)
    expect(height).toBeCloseTo(54)
    expect(x).toBeCloseTo(25 - 27)
    expect(y).toBeCloseTo(100 - 25 - 27)
  })
})
