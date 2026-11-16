import { expect } from 'expect'
import type { CutAction } from '../../../../src/nesting'
import { linkParts } from '../../../../src/nesting/review/linkParts'
import { smallFixture } from './fixtures'

const cut = (partId?: string, contourId?: string): CutAction => ({
  kind: 'cut',
  points: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
  ...(partId ? { partId } : {}),
  ...(contourId ? { contourId } : {}),
})

describe('review/linkParts', () => {
  it('resolves an action to its part through the cut layout contours', async () => {
    const { layout, cutPlan } = await smallFixture()
    const actions = cutPlan.plans?.[0].actions as CutAction[]
    const result = linkParts({ sheetId: 'sheet-1', partKeys: ['part-1#0', 'part-2#0'], layout, actions })

    const holeAction = actions.findIndex((a) => a.contourId === 'part-1-hole')
    expect(result.partKeyByAction[holeAction]).toBe('part-1#0')
    expect(result.notices).toEqual([])
  })

  it('leaves actions without any part or contour reference unlinked and silent', () => {
    const result = linkParts({
      sheetId: 'sheet-1',
      partKeys: ['part-1#0'],
      actions: [{ kind: 'end', points: [{ x: 0, y: 0 }] }],
    })

    expect(result.partKeyByAction).toEqual([undefined])
    expect(result.notices).toEqual([])
  })

  it('falls back to partId equal to a part key or to shapeId', () => {
    const result = linkParts({
      sheetId: 'sheet-1',
      partKeys: ['part-1#0', 'part-2#1'],
      actions: [cut('part-1'), cut('part-2#1'), cut('part-2')],
    })

    expect(result.partKeyByAction).toEqual(['part-1#0', 'part-2#1', undefined])
  })

  it('raises one UNKNOWN_PART notice per distinct unresolved part id', () => {
    const result = linkParts({
      sheetId: 'sheet-1',
      partKeys: ['part-1#0'],
      actions: [cut('ghost'), cut('ghost'), cut('ghost')],
    })

    expect(result.partKeyByAction).toEqual([undefined, undefined, undefined])
    expect(result.notices).toHaveLength(1)
    expect(result.notices[0]).toMatchObject({
      code: 'UNKNOWN_PART',
      severity: 'warning',
      origin: 'review',
      sheetId: 'sheet-1',
      actionIndex: 0,
    })
    expect(result.notices[0].message).toContain('ghost')
  })

  it('raises UNLINKED_ACTION when only an unknown contour id is available', () => {
    const result = linkParts({
      sheetId: 'sheet-1',
      partKeys: ['part-1#0'],
      actions: [cut(undefined, 'c-9'), cut(undefined, 'c-9')],
    })

    expect(result.notices).toHaveLength(1)
    expect(result.notices[0].code).toBe('UNLINKED_ACTION')
    expect(result.notices[0].message).toContain('c-9')
  })

  it('exposes the same resolution for planning problems', async () => {
    const { layout } = await smallFixture()
    const result = linkParts({ sheetId: 'sheet-1', partKeys: ['part-1#0'], layout, actions: [] })

    expect(result.resolve('part-1', undefined)).toBe('part-1#0')
    expect(result.resolve(undefined, 'part-1-hole')).toBe('part-1#0')
    expect(result.resolve('nobody', undefined)).toBeUndefined()
  })
})
