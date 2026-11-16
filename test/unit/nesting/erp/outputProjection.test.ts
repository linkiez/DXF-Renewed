import { expect } from 'expect'
import { digestCanonical } from '../../../../src/nesting/erp/digest'
import { outputProjection } from '../../../../src/nesting/erp/outputProjection'
import type { NestResponse } from '../../../../src/nesting'
import { deepFreeze, partialFixture, smallFixture } from '../review/fixtures'

describe('erp/outputProjection', () => {
  it('reproduces the output digest of an artifact built by createNestingArtifact', async () => {
    const { artifact } = await smallFixture()

    const projection = outputProjection(artifact.contractVersion, artifact.layout as NestResponse, artifact.unplaced)

    expect(await digestCanonical(projection)).toEqual(artifact.outputDigest)
  })

  it('reproduces the digest when the artifact reports unplaced items', async () => {
    const { artifact } = await partialFixture()
    const layout = artifact.layout as NestResponse

    const projection = outputProjection(artifact.contractVersion, layout, artifact.unplaced)

    expect(projection).toMatchObject({ plan: { unplaced: artifact.unplaced } })
  })

  it('is identical for identical input and never mutates the plan or the unplaced list', async () => {
    const { artifact } = await smallFixture()
    const layout = deepFreeze(JSON.parse(JSON.stringify(artifact.layout)) as NestResponse)
    const unplaced = deepFreeze(JSON.parse(JSON.stringify(artifact.unplaced)) as typeof artifact.unplaced)

    const first = outputProjection(1, layout, unplaced)
    const second = outputProjection(1, layout, unplaced)

    expect(second).toEqual(first)
  })
})
