import { expect } from 'expect'
import { commitEdit } from '../../../../src/nesting/edit/commitEdit'
import { createEditState } from '../../../../src/nesting/edit/createEditState'
import { undoEdit } from '../../../../src/nesting/edit/undoEdit'
import type { EditState } from '../../../../src/nesting/edit/types'
import { editFixture } from './fixtures'

const stateOf = async (limits?: { maxLogLength: number }): Promise<EditState> => {
  const state = createEditState({ ...(await editFixture()).input, limits }).state
  if (!state) throw new Error('state expected')
  return state
}

describe('edit/commitEdit', () => {
  it('appends a valid edit at the cursor, advances it and marks every derived result outdated', async () => {
    const state = await stateOf()

    const { state: next, verdict } = commitEdit(state, { partKey: 'part-A#0', kind: 'move', delta: { dx: 3, dy: 3 } })

    expect(verdict.valid).toBe(true)
    expect(next.edits).toHaveLength(1)
    expect(next.cursor).toBe(1)
    expect(next.revision).toBe(1)
    expect(next.freshness).toEqual({ plan: 'outdated', cost: 'outdated', validation: 'outdated', risk: 'outdated' })
    expect(next.edits[0]).toMatchObject({
      partKey: 'part-A#0', kind: 'move', delta: { dx: 3, dy: 3 },
      before: { x: 10, y: 10, rotation: 0, mirrored: false }, after: { x: 13, y: 13, rotation: 0, mirrored: false },
    })
    expect(next.working.parts.get('part-A#0')?.placement.x).toBe(13)
    expect(state.working.parts.get('part-A#0')?.placement.x).toBe(10)
  })

  it('returns the same state for an invalid edit and never applies it', async () => {
    const state = await stateOf()

    const result = commitEdit(state, { partKey: 'part-A#0', kind: 'move', delta: { dx: 15, dy: 0 } })

    expect(result.state).toBe(state)
    expect(result.verdict.valid).toBe(false)
  })

  it('discards the redo branch', async () => {
    let state = await stateOf()
    state = commitEdit(state, { partKey: 'part-A#0', kind: 'move', delta: { dx: 1, dy: 0 } }).state
    state = commitEdit(state, { partKey: 'part-A#0', kind: 'move', delta: { dx: 1, dy: 0 } }).state
    state = undoEdit(state)

    const next = commitEdit(state, { partKey: 'part-B#0', kind: 'move', delta: { dx: 1, dy: 0 } }).state

    expect(next.edits.map((edit) => edit.partKey)).toEqual(['part-A#0', 'part-B#0'])
    expect(next.cursor).toBe(2)
  })

  it('moves the parts enclosed in a hole together with their host', async () => {
    const state = await stateOf()

    const next = commitEdit(state, { partKey: 'part-D#0', kind: 'move', delta: { dx: -5, dy: 15 } }).state

    expect(next.working.parts.get('part-D#0')?.placement.x).toBe(35)
    expect(next.working.parts.get('part-E#0')?.placement.x).toBe(46)
    expect(next.working.parts.get('part-E#0')?.placement.y).toBe(66)
  })

  it('refuses an edit beyond the log limit with EDIT_LOG_FULL instead of dropping history', async () => {
    let state = await stateOf({ maxLogLength: 100 })
    for (let step = 0; step < 100; step += 1) {
      state = commitEdit(state, { partKey: 'part-A#0', kind: 'move', delta: { dx: 0.01, dy: 0 } }).state
    }

    const result = commitEdit(state, { partKey: 'part-A#0', kind: 'move', delta: { dx: 0.01, dy: 0 } })

    expect(result.state).toBe(state)
    expect(result.notices.map((n) => n.code)).toEqual(['EDIT_LOG_FULL'])
    expect(state.edits).toHaveLength(100)
  })
})
