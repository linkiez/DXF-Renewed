import { expect } from 'expect'
import { createEditState } from '../../../../src/nesting/edit/createEditState'
import { judgePlacement } from '../../../../src/nesting/edit/judgePlacement'
import type { CandidateEdit, EditInput, EditState } from '../../../../src/nesting/edit/types'
import { referenceFixture } from '../review/fixtures'
import { deepFreeze, editFixture, withApproximateOutlines, withoutConstraints } from './fixtures'

const stateOf = (input: EditInput): EditState => {
  const state = createEditState(input).state
  if (!state) throw new Error('state expected')
  return state
}
const move = (partKey: string, dx: number, dy: number): CandidateEdit => ({ partKey, kind: 'move', delta: { dx, dy } })
const rotate = (partKey: string, degrees: number): CandidateEdit => ({ partKey, kind: 'rotate', delta: { degrees } })
const codes = (state: EditState, edit: CandidateEdit): string[] => judgePlacement(state, edit).violations.map((v) => v.code)

describe('edit/judgePlacement', () => {
  it('accepts a free position', async () => {
    const state = stateOf((await editFixture()).input)

    expect(judgePlacement(state, move('part-A#0', 3, 3))).toEqual({ valid: true, violations: [], approximate: false, group: [] })
  })

  it('reports an overlap with the neighbour involved', async () => {
    const state = stateOf((await editFixture()).input)

    const verdict = judgePlacement(state, move('part-A#0', 15, 0))

    expect(verdict.valid).toBe(false)
    expect(verdict.violations).toMatchObject([{ code: 'OVERLAP', partKey: 'part-A#0', otherPartKey: 'part-B#0' }])
    expect(verdict.violations[0].message).toContain('part-B#0')
  })

  it('refuses a position outside the usable area and accepts the exact edge clearance', async () => {
    const state = stateOf((await editFixture()).input)

    expect(codes(state, move('part-A#0', -9, 0))).toEqual(['OUTSIDE_USABLE_AREA'])
    expect(codes(state, move('part-A#0', -8, 0))).toEqual([])
    expect(codes(state, move('part-F#0', 1, 0))).toEqual(['OUTSIDE_USABLE_AREA'])
  })

  it('reports the stock hole and the caller exclusion zone as forbidden zones', async () => {
    const state = stateOf((await editFixture()).input)

    expect(judgePlacement(state, move('part-F#0', 0, 55)).violations).toMatchObject([{ code: 'FORBIDDEN_ZONE', zoneId: 'stock-hole' }])
    expect(judgePlacement(state, move('part-A#0', 0, 62)).violations).toMatchObject([{ code: 'FORBIDDEN_ZONE', zoneId: 'flaw-1' }])
  })

  it('reports a spacing violation with the measured distance and accepts exactly the clearance', async () => {
    const state = stateOf((await editFixture()).input)

    const verdict = judgePlacement(state, move('part-A#0', 9, 0))

    expect(verdict.violations).toMatchObject([{ code: 'SPACING_TOO_SMALL', otherPartKey: 'part-B#0' }])
    expect(verdict.violations[0].message).toContain('1')
    expect(codes(state, move('part-A#0', 8, 0))).toEqual([])
  })

  it('reports every violation of one candidate in the fixed order', async () => {
    const state = stateOf((await editFixture()).input)

    expect(codes(state, move('part-A#0', 30, -15))).toEqual(['OVERLAP', 'OUTSIDE_USABLE_AREA'])
    expect(codes(state, move('part-A#0', 72, 65))).toEqual(['OUTSIDE_USABLE_AREA', 'FORBIDDEN_ZONE'])
    expect(codes(state, { partKey: 'part-C#0', kind: 'rotate', delta: { degrees: 45 } })).toEqual(['ROTATION_NOT_ALLOWED'])
  })

  it('refuses rotations that are not allowed or that leave the grain', async () => {
    const state = stateOf((await editFixture()).input)

    expect(codes(state, rotate('part-A#0', 90))).toEqual([])
    expect(codes(state, rotate('part-A#0', 45))).toEqual(['ROTATION_NOT_ALLOWED'])
    expect(codes(state, rotate('part-C#0', 90))).toEqual(['GRAIN_LOCKED'])
    expect(codes(state, rotate('part-C#0', 180))).toEqual(['ROTATION_NOT_ALLOWED'])
  })

  it('allows a mirror only for a mirrorable part', async () => {
    const state = stateOf((await editFixture()).input)

    expect(codes(state, { partKey: 'part-A#0', kind: 'mirror' })).toEqual(['MIRROR_NOT_ALLOWED'])
    expect(codes(state, { partKey: 'part-B#0', kind: 'mirror' })).toEqual([])
  })

  it('refuses rotation and mirror with CONSTRAINTS_UNKNOWN when no constraints were supplied, but judges a move', async () => {
    const state = stateOf(withoutConstraints(await editFixture()))

    expect(codes(state, rotate('part-A#0', 90))).toEqual(['CONSTRAINTS_UNKNOWN'])
    expect(codes(state, { partKey: 'part-A#0', kind: 'mirror' })).toEqual(['CONSTRAINTS_UNKNOWN'])
    expect(codes(state, move('part-A#0', 3, 3))).toEqual([])
  })

  it('judges a part with the parts enclosed in its hole and names an invalid member', async () => {
    const state = stateOf((await editFixture()).input)

    const valid = judgePlacement(state, move('part-D#0', -5, 15))
    const invalid = judgePlacement(state, move('part-D#0', -20, 0))

    expect(valid).toMatchObject({ valid: true, group: ['part-E#0'] })
    expect(invalid.violations.map((v) => v.code)).toEqual(expect.arrayContaining(['OVERLAP', 'GROUP_INVALID']))
    expect(invalid.violations.find((v) => v.code === 'GROUP_INVALID')?.otherPartKey).toBe('part-E#0')
  })

  it('lets a part sit in the hole of another part when it keeps the clearance', async () => {
    const state = stateOf((await editFixture()).input)

    expect(codes(state, move('part-E#0', 1, 1))).toEqual([])
    expect(codes(state, move('part-E#0', 2, 0))).toEqual(['SPACING_TOO_SMALL'])
    expect(codes(state, move('part-E#0', 5, 0))).toEqual(['OVERLAP'])
  })

  it('marks the verdict approximate for an outline that is only a bounding box and refuses to rotate it', async () => {
    const state = stateOf(await withApproximateOutlines(await editFixture()))

    expect(judgePlacement(state, move('part-A#0', 3, 3))).toMatchObject({ valid: true, approximate: true })
    expect(codes(state, rotate('part-A#0', 90))).toEqual(['OUTLINE_UNAVAILABLE'])
  })

  it('judges a zero move of every placed part valid, on the edit fixture and on the 500-part sheet (SC-002)', async () => {
    const fixture = await editFixture()
    const small = stateOf(fixture.input)
    for (const key of small.working.order) expect(codes(small, move(key, 0, 0))).toEqual([])

    const reference = await referenceFixture()
    const big = stateOf({ artifact: reference.artifact, layout: reference.layout })
    expect(big.working.order).toHaveLength(500)
    for (const key of big.working.order) expect(codes(big, move(key, 0, 0))).toEqual([])
  })

  it('never mutates the state and is identical for identical input', async () => {
    const state = deepFreeze(stateOf((await editFixture()).input))
    const edit = move('part-A#0', 15, 0)

    expect(judgePlacement(state, edit)).toEqual(judgePlacement(state, edit))
  })

  it('throws for a part key that is not in the session', async () => {
    const state = stateOf((await editFixture()).input)

    expect(() => judgePlacement(state, move('missing#0', 1, 1))).toThrow(RangeError)
  })
})
