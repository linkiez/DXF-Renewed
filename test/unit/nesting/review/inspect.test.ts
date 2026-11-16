import { expect } from 'expect'
import { buildReviewScene } from '../../../../src/nesting/review/buildScene'
import { inspect } from '../../../../src/nesting/review/inspect'
import { smallFixture } from './fixtures'

const rowsOf = (inspection: { rows: readonly { label: string; value: string }[] }): Record<string, string> =>
  Object.fromEntries(inspection.rows.map((row) => [row.label, row.value]))

describe('review/inspect — parts', () => {
  it('shows identity, orientation, placement, source and the artifact correlation', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)

    const inspection = inspect(scene, { kind: 'part', sheetId: 'sheet-1', partKey: 'part-1#0' })
    const rows = rowsOf(inspection)

    expect(inspection.title).toBe('Peça part-1#0')
    expect(rows['Peça']).toBe('part-1#0')
    expect(rows['Forma']).toBe('part-1')
    expect(rows['Instância']).toBe('0')
    expect(rows['Rotação']).toBe('0')
    expect(rows['Posição']).toBe('2, 2')
    expect(rows['Limites']).toBe('2, 2 – 22, 22')
    expect(rows['Camada']).toBe('CUT')
    expect(rows['Área']).toBe('400')
    expect(rows['Situação']).toBe('Posicionada')
    expect(rows['Pedido']).toBe('order-1')
    expect(rows['Revisão']).toBe('rev-1')
    expect(rows['Requisição']).toBe('req-1')
  })

  it('omits source rows when no shape is available and shows recorded problems', async () => {
    const { input, cutPlan } = await smallFixture()
    const problem = {
      code: 'LEAD_CROSSES_GEOMETRY' as const, severity: 'error' as const, message: 'Lead cruza a geometria',
      sheetId: 'sheet-1', partId: 'part-1', contourId: 'part-1-outer', actionIndex: 3,
    }
    const scene = buildReviewScene({ artifact: input.artifact, cutPlan: { ...cutPlan, problems: [problem] } })

    const inspection = inspect(scene, { kind: 'part', sheetId: 'sheet-1', partKey: 'part-1#0' })
    const rows = rowsOf(inspection)

    expect(rows['Camada']).toBeUndefined()
    expect(rows['Situação']).toBe('Com problema')
    expect(inspection.notices.map((n) => n.code)).toContain('LEAD_CROSSES_GEOMETRY')
    expect(inspection.notices[0].message).toBe('Lead cruza a geometria')
  })
})

describe('review/inspect — actions', () => {
  it('shows kind, owning part and every metadata entry verbatim', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)
    const cut = scene.sheets[0].timeline?.actions.find((a) => a.kind === 'cut')
    if (!cut) throw new Error('fixture without cut')

    const inspection = inspect(scene, { kind: 'action', sheetId: 'sheet-1', actionIndex: cut.index })
    const rows = rowsOf(inspection)

    expect(inspection.title).toBe(`Ação ${cut.index + 1}: Corte`)
    expect(rows['Tipo']).toBe('Corte')
    expect(rows['Peça']).toBe(cut.partKey)
    expect(rows['feed']).toBe('1200')
    expect(rows['power']).toBe('80')
  })

  it('explains an action without a linked part and shows its notices', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene({ artifact: input.artifact, cutPlan: input.cutPlan })
    const unlinked = scene.sheets[0].timeline?.actions.find((a) => a.kind === 'end')
    if (!unlinked) throw new Error('fixture without end action')

    const inspection = inspect(scene, { kind: 'action', sheetId: 'sheet-1', actionIndex: unlinked.index })

    expect(rowsOf(inspection)['Peça']).toBe('sem vínculo')
  })

  it('returns an explicit empty inspection for a selection that does not exist', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)

    const inspection = inspect(scene, { kind: 'part', sheetId: 'sheet-1', partKey: 'ghost#0' })

    expect(inspection.rows).toEqual([])
    expect(inspection.title).toBe('Nenhuma peça ou ação selecionada.')
  })
})
