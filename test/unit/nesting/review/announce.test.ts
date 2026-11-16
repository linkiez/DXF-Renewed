import { expect } from 'expect'
import { announcementFor } from '../../../../src/nesting/review/announce'
import { buildReviewScene } from '../../../../src/nesting/review/buildScene'
import type { ReviewState } from '../../../../src/nesting/review/types'
import { smallFixture } from './fixtures'

const base: ReviewState = {
  position: { sheetId: 'sheet-1', actionIndex: 0, progress: 0 },
  playing: false,
  speed: 1,
  sheetId: 'sheet-1',
  selection: null,
  viewport: { center: { x: 50, y: 50 }, zoom: 1 },
  renderer: 'accelerated',
  notices: [],
}

describe('review/announce', () => {
  it('announces sheet, renderer, playback, selection and seek changes in pt_BR, and stays silent otherwise', async () => {
    const scene = buildReviewScene((await smallFixture()).input)

    expect(announcementFor(scene, null, base)).toBeNull()
    expect(announcementFor(scene, base, { ...base, sheetId: 'sheet-2' })).toBe('Chapa sheet-2')
    expect(announcementFor(scene, base, { ...base, renderer: 'static' })).toBe('Vista estática ativada')
    expect(announcementFor(scene, base, { ...base, playing: true })).toBe('Reprodução iniciada')
    expect(announcementFor(scene, { ...base, playing: true }, base)).toBe('Reprodução pausada')
    expect(announcementFor(scene, base, { ...base, selection: { kind: 'part', sheetId: 'sheet-1', partKey: 'part-1#0' } })).toBe('Selecionado: Peça part-1#0')
    expect(announcementFor(scene, { ...base, selection: { kind: 'part', sheetId: 'sheet-1', partKey: 'part-1#0' } }, base)).toBe('Seleção removida')
    const total = scene.sheets[0].timeline?.actions.length ?? 0
    expect(announcementFor(scene, base, { ...base, position: { sheetId: 'sheet-1', actionIndex: 4, progress: 0 } })).toBe(`Ação 5 de ${total}`)
    expect(announcementFor(scene, { ...base, playing: true }, { ...base, playing: true, position: { sheetId: 'sheet-1', actionIndex: 4, progress: 0 } })).toBeNull()
  })
})
