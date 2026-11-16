import { expect } from 'expect'
import { buildReviewScene } from '../../../../src/nesting/review/buildScene'
import { summarize } from '../../../../src/nesting/review/summary'
import { partialFixture, rejectedFixture, smallFixture } from './fixtures'

describe('review/summary — written summary', () => {
  it('states sheets, parts, unplaced items, yield, cut length, rapid length and pierces in pt_BR', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)

    const text = summarize(scene)

    expect(text).toContain('Chapas: 2.')
    expect(text).toContain('Peças: 4.')
    expect(text).toContain('Não alocadas: 0.')
    expect(text).toContain('Aproveitamento: 62,50%.')
    expect(text).toContain(`Furos de perfuração: ${scene.summary.pierceCount}.`)
    expect(text).toMatch(/Comprimento de corte: \d+,\d{2}\./)
  })

  it('counts unplaced quantities for a partial artifact', async () => {
    const { input } = await partialFixture()

    expect(summarize(buildReviewScene(input))).toContain('Não alocadas: 1.')
  })

  it('still produces a summary for an unavailable artifact', async () => {
    const text = summarize(buildReviewScene(await rejectedFixture()))

    expect(text).toContain('Chapas: 0.')
  })

  it('is deterministic', async () => {
    const { input } = await smallFixture()
    const scene = buildReviewScene(input)

    expect(summarize(scene)).toBe(summarize(scene))
  })
})
