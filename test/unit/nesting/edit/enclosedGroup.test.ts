import { expect } from 'expect'
import { createEditState } from '../../../../src/nesting/edit/createEditState'
import { enclosedGroup } from '../../../../src/nesting/edit/enclosedGroup'
import type { EditState } from '../../../../src/nesting/edit/types'
import { editFixture, withoutLayout } from './fixtures'

const stateOf = async (input?: Parameters<typeof createEditState>[0]): Promise<EditState> => {
  const state = createEditState(input ?? (await editFixture()).input).state
  if (!state) throw new Error('state expected')
  return state
}

describe('edit/enclosedGroup', () => {
  it('returns the parts lying inside a hole of the part, with the holes taken from the cut layout', async () => {
    const state = await stateOf()
    const host = state.working.parts.get('part-D#0')
    if (!host) throw new Error('host expected')

    expect(enclosedGroup(host, state.working)).toEqual({ keys: ['part-E#0'], known: true })
  })

  it('is empty for a part with no holes and for a part that lies in a hole of another part', async () => {
    const state = await stateOf()
    const plain = state.working.parts.get('part-A#0')
    const inner = state.working.parts.get('part-E#0')
    if (!plain || !inner) throw new Error('parts expected')

    expect(enclosedGroup(plain, state.working)).toEqual({ keys: [], known: true })
    expect(enclosedGroup(inner, state.working)).toEqual({ keys: [], known: true })
  })

  it('says the group is unknown when the holes of the part cannot be determined', async () => {
    const state = await stateOf(withoutLayout(await editFixture()))
    const host = state.working.parts.get('part-D#0')
    if (!host) throw new Error('host expected')

    expect(enclosedGroup(host, state.working)).toEqual({ keys: [], known: false })
  })
})
