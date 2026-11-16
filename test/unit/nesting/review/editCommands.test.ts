import { expect } from 'expect'
import { createEditHandle } from '../../../../src/nesting/review/editCommands'
import type { EditPanelState, ReviewInput, ReviewOverlay } from '../../../../src/nesting/review/types'
import { profile } from '../cutPath/fixtures'
import { completeModel } from '../cost/fixtures'
import { deepFreeze, editFixture, invalidArtifactInput } from '../edit/fixtures'

const waitFor = async (condition: () => boolean): Promise<void> => {
  for (let tries = 0; tries < 400 && !condition(); tries += 1) await new Promise((resolve) => setTimeout(resolve, 5))
  if (!condition()) throw new Error('timed out')
}

const recomputeConfig = { processProfile: profile({ sequence: { strategy: 'input' } }), costModel: completeModel() }

const setup = async (input?: Parameters<typeof createEditHandle>[0]['input'], recompute?: Parameters<typeof createEditHandle>[0]['recompute']) => {
  const fixture = await editFixture()
  const scenes: ReviewInput[] = []
  const overlays: (ReviewOverlay | null)[] = []
  const announcements: string[] = []
  const handle = createEditHandle({
    input: input ?? fixture.input,
    recompute,
    onScene: (scene) => scenes.push(scene),
    onOverlay: (overlay) => overlays.push(overlay),
    onAnnounce: (text) => announcements.push(text),
  })
  let state: EditPanelState | undefined
  handle.edit$.subscribe((next) => { state = next })
  return { fixture, handle, scenes, overlays, announcements, state: () => state as EditPanelState }
}

const moveA = (dx: number, dy: number) => ({ partKey: 'part-A#0', kind: 'move' as const, delta: { dx, dy } })

describe('review/editCommands', () => {
  it('starts off, with every derived result current and the plan visible', async () => {
    const { state } = await setup()

    expect(state()).toMatchObject({ mode: 'off', activePart: null, candidate: null, verdict: null, planVisible: true, canUndo: false, canRedo: false })
    expect(state().freshness).toEqual({ plan: 'current', cost: 'current', validation: 'current', risk: 'current' })
  })

  it('ignores commands outside the edit mode', async () => {
    const { handle, overlays, state } = await setup()

    handle.propose(moveA(3, 3))

    expect(state().verdict).toBeNull()
    expect(overlays).toEqual([])
  })

  it('judges a proposal, shows the ghost and announces the verdict', async () => {
    const { handle, overlays, announcements, state } = await setup()
    handle.enter()
    handle.selectPart('part-A#0')

    handle.propose(moveA(3, 3))

    expect(state()).toMatchObject({ mode: 'edit', activePart: 'part-A#0', candidate: moveA(3, 3) })
    expect(state().verdict?.valid).toBe(true)
    expect(overlays[overlays.length - 1]?.ghost?.valid).toBe(true)
    expect(announcements[announcements.length - 1]).toContain('válida')
  })

  it('refuses to confirm an invalid candidate and keeps the reasons and the scene', async () => {
    const { handle, scenes, announcements, state } = await setup()
    handle.enter()
    handle.selectPart('part-A#0')
    handle.propose(moveA(15, 0))

    handle.confirm()

    expect(state().verdict?.valid).toBe(false)
    expect(state().verdict?.violations[0].code).toBe('OVERLAP')
    expect(scenes).toEqual([])
    expect(state().canUndo).toBe(false)
    expect(announcements[announcements.length - 1]).toContain('recusada')
  })

  it('confirms a valid candidate: rebuilds the scene from the edited layout without the old cut plan', async () => {
    const { fixture, handle, scenes, state } = await setup()
    handle.enter()
    handle.selectPart('part-A#0')
    handle.propose(moveA(3, 3))

    handle.confirm()

    expect(scenes).toHaveLength(1)
    const scene = scenes[0]
    expect(scene.cutPlan).toBeUndefined()
    expect((scene.artifact.layout?.placements ?? []).find((p) => p.shapeId === 'part-A')?.x).toBe(13)
    expect(scene.layout?.contours.find((c) => c.id === 'part-A-outer')?.placement.x).toBe(13)
    expect(state()).toMatchObject({ candidate: null, verdict: null, planVisible: false, canUndo: true, canRedo: false })
    expect(state().freshness.plan).toBe('outdated')
    expect(fixture.artifact.layout?.placements[0].x).toBe(10)
  })

  it('undoes and redoes, restoring the original plan only when it is current again', async () => {
    const { fixture, handle, scenes, state } = await setup()
    handle.enter()
    handle.propose(moveA(3, 3))
    handle.selectPart('part-A#0')
    handle.propose(moveA(3, 3))
    handle.confirm()

    handle.undo()
    expect(scenes).toHaveLength(2)
    expect(scenes[1].cutPlan).toBe(fixture.cutPlan)
    expect(state()).toMatchObject({ planVisible: true, canUndo: false, canRedo: true })

    handle.redo()
    expect(scenes).toHaveLength(3)
    expect(scenes[2].cutPlan).toBeUndefined()
    expect(state()).toMatchObject({ planVisible: false, canUndo: true, canRedo: false })
  })

  it('cancels the candidate and clears the ghost; leaving clears it too', async () => {
    const { handle, overlays, state } = await setup()
    handle.enter()
    handle.selectPart('part-A#0')
    handle.propose(moveA(3, 3))

    handle.cancel()
    expect(state().candidate).toBeNull()
    expect(overlays[overlays.length - 1]).toBeNull()

    handle.propose(moveA(3, 3))
    handle.leave()
    expect(state().mode).toBe('off')
    expect(overlays[overlays.length - 1]).toBeNull()
  })

  it('never mutates the input and reports an invalid artifact instead of starting', async () => {
    const fixture = await editFixture()
    const frozen = deepFreeze(JSON.parse(JSON.stringify({ ...fixture.input, cutPlan: undefined })))
    const { handle, state } = await setup(frozen)
    handle.enter()
    handle.selectPart('part-A#0')
    handle.propose(moveA(3, 3))
    expect(() => handle.confirm()).not.toThrow()

    const broken = await setup(invalidArtifactInput(fixture))
    broken.handle.enter()
    expect(broken.state().mode).toBe('off')
    expect(broken.state().notices.map((n) => n.code)).toEqual(['INVALID_ARTIFACT'])
    expect(state().canUndo).toBe(true)
  })

  it('recomputes the plan and the cost of the edited layout, shows the new plan and compares with the original', async () => {
    const { fixture, handle, scenes, state } = await setup(undefined, recomputeConfig)
    handle.enter()
    handle.selectPart('part-A#0')
    handle.propose(moveA(3, 3))
    handle.confirm()
    expect(scenes[0].cutPlan).toBeUndefined()

    handle.recompute()
    await waitFor(() => !state().recomputing && state().comparison !== null)

    expect(scenes).toHaveLength(2)
    expect(scenes[1].cutPlan).toBeDefined()
    expect(scenes[1].cutPlan).not.toBe(fixture.cutPlan)
    expect(state()).toMatchObject({ planVisible: true })
    expect(state().freshness).toEqual({ plan: 'current', cost: 'current', validation: 'current', risk: 'outdated' })
    expect(state().comparison?.invalidParts).toEqual({ before: 0, after: 0, delta: 0 })
  })

  it('says the recomputation is unavailable when no process profile was supplied', async () => {
    const { handle, announcements, scenes } = await setup()
    handle.enter()

    handle.recompute()

    expect(announcements[announcements.length - 1]).toContain('indisponível')
    expect(scenes).toEqual([])
  })

  it('discards a step that finishes after another edit and tells the user', async () => {
    const { handle, announcements, state } = await setup(undefined, recomputeConfig)
    handle.enter()
    handle.selectPart('part-A#0')
    handle.propose(moveA(3, 3))
    handle.confirm()

    handle.recompute()
    handle.propose({ partKey: 'part-B#0', kind: 'move', delta: { dx: 0, dy: 3 } })
    handle.confirm()
    await waitFor(() => !state().recomputing)

    expect(state().notices.map((n) => n.code)).toContain('RECOMPUTE_DISCARDED')
    expect(state().freshness.plan).toBe('outdated')
    expect(announcements.some((text) => text.includes('descartado'))).toBe(true)
  })
})
