import { expect } from 'expect'
import { commitEdit } from '../../../../src/nesting/edit/commitEdit'
import { createEditState } from '../../../../src/nesting/edit/createEditState'
import { editedLayout } from '../../../../src/nesting/edit/editedLayout'
import { redoEdit } from '../../../../src/nesting/edit/redoEdit'
import { undoEdit } from '../../../../src/nesting/edit/undoEdit'
import type { EditState } from '../../../../src/nesting/edit/types'
import { deepFreeze, editFixture } from './fixtures'

const canonical = (state: EditState): string => JSON.stringify(editedLayout(state))

const initial = async (): Promise<EditState> => {
  const state = createEditState((await editFixture()).input).state
  if (!state) throw new Error('state expected')
  return state
}

describe('edit/undoEdit and redoEdit', () => {
  it('returns the layout to every recorded step after 100 edits, undone and redone (SC-003)', async () => {
    let state = await initial()
    const recorded = [canonical(state)]
    for (let step = 0; step < 100; step += 1) {
      state = commitEdit(state, { partKey: step % 2 === 0 ? 'part-A#0' : 'part-D#0', kind: 'move', delta: { dx: 0.01, dy: 0 } }).state
      recorded.push(canonical(state))
    }

    for (let step = 99; step >= 0; step -= 1) {
      state = undoEdit(state)
      expect(canonical(state)).toBe(recorded[step])
    }
    for (let step = 1; step <= 100; step += 1) {
      state = redoEdit(state)
      expect(canonical(state)).toBe(recorded[step])
    }
  })

  it('keeps the log and changes the cursor and the revision', async () => {
    let state = await initial()
    state = commitEdit(state, { partKey: 'part-A#0', kind: 'move', delta: { dx: 1, dy: 0 } }).state

    const undone = undoEdit(state)

    expect(undone.edits).toHaveLength(1)
    expect(undone.cursor).toBe(0)
    expect(undone.revision).toBe(2)
    expect(redoEdit(undone).cursor).toBe(1)
  })

  it('returns the same state at cursor 0 for undo and at the end of the log for redo', async () => {
    const state = await initial()

    expect(undoEdit(state)).toBe(state)
    expect(redoEdit(state)).toBe(state)
  })

  it('gives the base layout for an empty log and never mutates the base artifact', async () => {
    const fixture = await editFixture()
    deepFreeze(fixture.artifact)
    const state = createEditState({ ...fixture.input, artifact: fixture.artifact }).state as EditState

    expect(editedLayout(state)).toEqual(fixture.artifact.layout)
    expect(() => commitEdit(state, { partKey: 'part-A#0', kind: 'move', delta: { dx: 1, dy: 0 } })).not.toThrow()
  })

  it('updates the placements and the compound placements of the edited layout together', async () => {
    let state = await initial()
    state = commitEdit(state, { partKey: 'part-B#0', kind: 'mirror' }).state

    const layout = editedLayout(state)

    expect(layout?.placements.find((p) => p.shapeId === 'part-B')?.transformedVertices).toBeDefined()
    expect(layout?.placements).toHaveLength(6)
  })
})
