import { expect } from 'expect'
import { commitEdit } from '../../../../src/nesting/edit/commitEdit'
import { createEditState } from '../../../../src/nesting/edit/createEditState'
import { markComputed } from '../../../../src/nesting/edit/markComputed'
import { redoEdit } from '../../../../src/nesting/edit/redoEdit'
import { undoEdit } from '../../../../src/nesting/edit/undoEdit'
import type { EditState } from '../../../../src/nesting/edit/types'
import { editFixture } from './fixtures'

const edit = { partKey: 'part-A#0', kind: 'move' as const, delta: { dx: 1, dy: 0 } }

const initial = async (): Promise<EditState> => {
  const state = createEditState((await editFixture()).input).state
  if (!state) throw new Error('state expected')
  return state
}

describe('edit/freshness', () => {
  it('marks a result current only for the revision it was computed from', async () => {
    const state = commitEdit(await initial(), edit).state

    const marked = markComputed(state, 'plan', state.revision)

    expect(marked.discarded).toBe(false)
    expect(marked.state.freshness).toEqual({ plan: 'current', cost: 'outdated', validation: 'outdated', risk: 'outdated' })
  })

  it('discards a result computed from a revision the state has left and never marks it current (SC-005)', async () => {
    const first = commitEdit(await initial(), edit).state
    const second = commitEdit(first, { ...edit, partKey: 'part-B#0' }).state

    const marked = markComputed(second, 'plan', first.revision)

    expect(marked.discarded).toBe(true)
    expect(marked.state).toBe(second)
    expect(marked.state.freshness.plan).toBe('outdated')
  })

  it('makes a result current again when the cursor returns to the layout it was computed for', async () => {
    const original = await initial()
    const edited = commitEdit(original, edit).state
    const computed = markComputed(edited, 'cost', edited.revision).state

    const back = undoEdit(computed)
    const forward = redoEdit(back)

    expect(back.freshness.plan).toBe('current')
    expect(back.freshness.cost).toBe('outdated')
    expect(forward.freshness.cost).toBe('current')
    expect(forward.freshness.plan).toBe('outdated')
  })

  it('never reports a result current for a layout it was not computed from', async () => {
    let state = await initial()
    state = commitEdit(state, edit).state
    state = markComputed(state, 'risk', state.revision).state
    state = commitEdit(state, { ...edit, partKey: 'part-B#0' }).state

    expect(state.freshness.risk).toBe('outdated')
    expect(undoEdit(state).freshness.risk).toBe('current')
    expect(undoEdit(undoEdit(state)).freshness.risk).toBe('outdated')
  })
})
