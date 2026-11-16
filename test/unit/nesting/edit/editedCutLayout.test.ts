import { expect } from 'expect'
import { validateCutLayout } from '../../../../src/nesting/cutPath/validate'
import { commitEdit } from '../../../../src/nesting/edit/commitEdit'
import { createEditState } from '../../../../src/nesting/edit/createEditState'
import { editedCutLayout } from '../../../../src/nesting/edit/editedCutLayout'
import type { EditState } from '../../../../src/nesting/edit/types'
import { deepFreeze, editFixture, withoutLayout } from './fixtures'

const initial = async (): Promise<EditState> => {
  const state = createEditState((await editFixture()).input).state
  if (!state) throw new Error('state expected')
  return state
}

describe('edit/editedCutLayout', () => {
  it('returns null when the input had no cut layout', async () => {
    const state = createEditState(withoutLayout(await editFixture())).state as EditState

    expect(editedCutLayout(state)).toBeNull()
  })

  it('equals the input layout for an empty log', async () => {
    const fixture = await editFixture()

    expect(editedCutLayout(await initial())).toEqual(fixture.layout)
  })

  it('moves every contour of an edited part, outer and inner, and leaves the others and the sheets alone', async () => {
    const fixture = await editFixture()
    const state = commitEdit(await initial(), { partKey: 'part-D#0', kind: 'move', delta: { dx: -5, dy: 15 } }).state

    const layout = editedCutLayout(state)
    const byId = (id: string) => layout?.contours.find((c) => c.id === id)

    expect(byId('part-D-outer')?.placement.x).toBe(35)
    expect(byId('part-D-hole')?.placement.x).toBe(43)
    expect(byId('part-D-hole')?.placement.y).toBe(63)
    expect(byId('part-E-outer')?.placement.x).toBe(46)
    expect(byId('part-A-outer')).toEqual(fixture.layout.contours.find((c) => c.id === 'part-A-outer'))
    expect(layout?.sheets).toEqual(fixture.layout.sheets)
    expect(layout?.startPoint).toEqual(fixture.layout.startPoint)
  })

  it('is accepted by validateCutLayout and never mutates the input layout', async () => {
    const fixture = await editFixture()
    deepFreeze(fixture.layout)
    const state = createEditState({ ...fixture.input, layout: fixture.layout }).state as EditState
    const edited = commitEdit(state, { partKey: 'part-B#0', kind: 'mirror' }).state

    const layout = editedCutLayout(edited)

    expect(layout).not.toBeNull()
    expect(() => validateCutLayout(layout as NonNullable<typeof layout>)).not.toThrow()
  })
})
