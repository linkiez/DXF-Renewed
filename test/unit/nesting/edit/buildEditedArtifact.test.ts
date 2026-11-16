import { expect } from 'expect'
import { firstValueFrom } from 'rxjs'
import { buildEditedArtifact } from '../../../../src/nesting/edit/buildEditedArtifact'
import { commitEdit } from '../../../../src/nesting/edit/commitEdit'
import { createEditState } from '../../../../src/nesting/edit/createEditState'
import { undoEdit } from '../../../../src/nesting/edit/undoEdit'
import type { EditState } from '../../../../src/nesting/edit/types'
import { digestCanonical } from '../../../../src/nesting/erp/digest'
import { erpNestingArtifactSchema } from '../../../../src/nesting/erp/schemas'
import { outputProjection } from '../../../../src/nesting/erp/outputProjection'
import type { NestResponse } from '../../../../src/nesting'
import { deepFreeze, editFixture } from './fixtures'

const initial = async (): Promise<EditState> => {
  const state = createEditState((await editFixture()).input).state
  if (!state) throw new Error('state expected')
  return state
}
const moveA = { partKey: 'part-A#0', kind: 'move' as const, delta: { dx: 3, dy: 3 } }

describe('edit/buildEditedArtifact', () => {
  it('keeps the original output digest when the log is empty (SC-004)', async () => {
    const state = await initial()

    const result = await firstValueFrom(buildEditedArtifact(state))

    expect(result.artifact.outputDigest).toEqual(state.input.artifact.outputDigest)
    expect(result.edit.originalOutputDigest).toEqual(state.input.artifact.outputDigest)
    expect(result.edit.log).toEqual([])
  })

  it('keeps correlation, snapshots and input digest and gets a new output digest from the same projection', async () => {
    const state = commitEdit(await initial(), moveA).state

    const { artifact, edit } = await firstValueFrom(buildEditedArtifact(state))

    const original = state.input.artifact
    expect(artifact.correlation).toEqual(original.correlation)
    expect(artifact.snapshots).toEqual(original.snapshots)
    expect(artifact.inputDigest).toEqual(original.inputDigest)
    expect(artifact.outputDigest).not.toEqual(original.outputDigest)
    expect(artifact.outputDigest).toEqual(await digestCanonical(outputProjection(1, artifact.layout as NestResponse, artifact.unplaced)))
    expect(edit.originalInputDigest).toEqual(original.inputDigest)
  })

  it('holds only the applied edits in order and a digest of the whole result without that field', async () => {
    let state = commitEdit(await initial(), moveA).state
    state = commitEdit(state, { ...moveA, partKey: 'part-B#0' }).state
    state = undoEdit(state)

    const { artifact, edit } = await firstValueFrom(buildEditedArtifact(state))

    expect(edit.log.map((entry) => entry.partKey)).toEqual(['part-A#0'])
    const { digest, ...rest } = edit
    expect(digest).toEqual(await digestCanonical(JSON.parse(JSON.stringify({ artifact, edit: rest }))))
  })

  it('is accepted by the ERP artifact schema and leaves the original untouched', async () => {
    const fixture = await editFixture()
    deepFreeze(fixture.artifact)
    const state = commitEdit(createEditState({ ...fixture.input, artifact: fixture.artifact }).state as EditState, moveA).state

    const { artifact } = await firstValueFrom(buildEditedArtifact(state))

    expect(erpNestingArtifactSchema.safeParse(artifact).success).toBe(true)
    expect(fixture.artifact.layout?.placements[0].x).toBe(10)
  })

  it('is identical in five consecutive builds', async () => {
    const state = commitEdit(await initial(), moveA).state
    const builds: string[] = []
    for (let run = 0; run < 5; run += 1) builds.push(JSON.stringify(await firstValueFrom(buildEditedArtifact(state))))

    expect(new Set(builds).size).toBe(1)
  })
})
