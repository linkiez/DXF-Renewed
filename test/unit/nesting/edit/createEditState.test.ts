import { expect } from 'expect'
import { createEditState } from '../../../../src/nesting/edit/createEditState'
import {
  deepFreeze, editFixture, invalidArtifactInput, unsupportedVersionInput, withApproximateOutlines, withoutLayout,
} from './fixtures'

describe('edit/createEditState', () => {
  it('starts with an empty log, cursor 0, revision 0 and every derived result current', async () => {
    const { state, notices } = createEditState((await editFixture()).input)

    expect(notices).toEqual([])
    expect(state?.edits).toEqual([])
    expect(state?.cursor).toBe(0)
    expect(state?.revision).toBe(0)
    expect(state?.freshness).toEqual({ plan: 'current', cost: 'current', validation: 'current', risk: 'current' })
    expect(state?.maxLogLength).toBe(100)
    expect([...(state?.working.parts.keys() ?? [])]).toEqual([
      'part-A#0', 'part-B#0', 'part-C#0', 'part-D#0', 'part-E#0', 'part-F#0',
    ])
  })

  it('takes the hole outlines of a part from the inner contours of the cut layout', async () => {
    const { state } = createEditState((await editFixture()).input)

    expect(state?.working.parts.get('part-D#0')?.outlines).toHaveLength(2)
    expect(state?.working.parts.get('part-D#0')?.contourIds).toEqual(['part-D-outer', 'part-D-hole'])
    expect(state?.working.parts.get('part-A#0')?.holesKnown).toBe(true)
  })

  it('rejects an artifact the ERP schema refuses with INVALID_ARTIFACT', async () => {
    const result = createEditState(invalidArtifactInput(await editFixture()))

    expect(result.state).toBeNull()
    expect(result.notices.map((n) => [n.severity, n.code])).toEqual([['error', 'INVALID_ARTIFACT']])
  })

  it('rejects an unsupported contract version with UNSUPPORTED_CONTRACT_VERSION', async () => {
    const result = createEditState(unsupportedVersionInput(await editFixture()))

    expect(result.state).toBeNull()
    expect(result.notices.map((n) => n.code)).toEqual(['UNSUPPORTED_CONTRACT_VERSION'])
  })

  it('rejects an artifact without placements with NO_LAYOUT', async () => {
    const fixture = await editFixture()
    const empty = { ...fixture.input, artifact: { ...fixture.artifact, layout: null } }

    const result = createEditState(empty)

    expect(result.state).toBeNull()
    expect(result.notices.map((n) => n.code)).toEqual(['NO_LAYOUT'])
  })

  it('raises APPROXIMATE_OUTLINE only for placements that are just a bounding box', async () => {
    const fixture = await editFixture()

    expect(createEditState(withoutLayout(fixture)).notices).toEqual([])
    const approximate = createEditState(await withApproximateOutlines(fixture))

    expect(approximate.notices.map((n) => n.code)).toEqual(Array(6).fill('APPROXIMATE_OUTLINE'))
    expect(approximate.state?.working.parts.get('part-A#0')?.approximate).toBe(true)
  })

  it('rejects a log limit below 100 or not an integer and a grain lock without an angle', async () => {
    const fixture = await editFixture()

    expect(createEditState({ ...fixture.input, limits: { maxLogLength: 99 } }).state).toBeNull()
    expect(createEditState({ ...fixture.input, limits: { maxLogLength: 150.5 } }).state).toBeNull()
    const noAngle = { ...fixture.input, constraints: { parts: { 'part-C': { grainLocked: true } } } }
    expect(createEditState(noAngle).state).toBeNull()
    expect(createEditState({ ...fixture.input, limits: { maxLogLength: 200 } }).state?.maxLogLength).toBe(200)
  })

  it('never mutates its input', async () => {
    const fixture = await editFixture()
    const input = deepFreeze(JSON.parse(JSON.stringify({ ...fixture.input, cutPlan: undefined })))

    expect(() => createEditState(input)).not.toThrow()
  })
})
