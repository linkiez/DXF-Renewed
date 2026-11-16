import { expect } from 'expect'
import type { CutAction } from '../../../../src/nesting'
import { linkActions } from '../../../../src/nesting/linking/linkActions'
import { smallFixture } from '../review/fixtures'

const cut = (partId?: string, contourId?: string): CutAction => ({
  kind: 'cut',
  points: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
  ...(partId ? { partId } : {}),
  ...(contourId ? { contourId } : {}),
})

describe('linking/linkActions', () => {
  it('resolves an action to its part through the cut layout contours', async () => {
    const { layout, cutPlan } = await smallFixture()
    const actions = cutPlan.plans?.[0].actions as CutAction[]

    const result = linkActions({ partKeys: ['part-1#0', 'part-2#0'], layout, actions })

    const holeAction = actions.findIndex((a) => a.contourId === 'part-1-hole')
    expect(result.partKeyByAction[holeAction]).toBe('part-1#0')
    expect(result.unresolved).toEqual([])
  })

  it('leaves actions without any part or contour reference unlinked and without a finding', () => {
    const result = linkActions({
      partKeys: ['part-1#0'],
      actions: [{ kind: 'end', points: [{ x: 0, y: 0 }] }],
    })

    expect(result.partKeyByAction).toEqual([undefined])
    expect(result.unresolved).toEqual([])
  })

  it('falls back to partId equal to a part key or to a shapeId', () => {
    const result = linkActions({
      partKeys: ['part-1#0', 'part-2#1'],
      actions: [cut('part-1'), cut('part-2#1'), cut('part-2')],
    })

    expect(result.partKeyByAction).toEqual(['part-1#0', 'part-2#1', undefined])
  })

  it('returns one structured finding per distinct unresolved part id, at its first action', () => {
    const result = linkActions({
      partKeys: ['part-1#0'],
      actions: [cut('part-1'), cut('ghost'), cut('ghost'), cut('ghost')],
    })

    expect(result.unresolved).toEqual([{ kind: 'unknown-part', reference: 'ghost', actionIndex: 1 }])
  })

  it('returns an unlinked-action finding when only an unknown contour id is available', () => {
    const result = linkActions({
      partKeys: ['part-1#0'],
      actions: [cut(undefined, 'c-9'), cut(undefined, 'c-9')],
    })

    expect(result.unresolved).toEqual([{ kind: 'unlinked-action', reference: 'c-9', actionIndex: 0 }])
  })

  it('exposes the same resolution for problems and carries no user text', async () => {
    const { layout } = await smallFixture()
    const result = linkActions({ partKeys: ['part-1#0'], layout, actions: [] })

    expect(result.resolve('part-1', undefined)).toBe('part-1#0')
    expect(result.resolve(undefined, 'part-1-hole')).toBe('part-1#0')
    expect(result.resolve('nobody', undefined)).toBeUndefined()
    expect(JSON.stringify(result.unresolved)).not.toMatch(/mensagem|message/i)
  })
})
