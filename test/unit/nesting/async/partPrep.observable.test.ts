import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import { prepareParts } from '../../../../src/nesting/pro/partPrep'

describe('part preparation Observable surface', () => {
  it('emits one result for an empty entity collection', async () => {
    const result = await firstValueFrom(
      prepareParts({ entities: [] }, { tolerance: 0.1, cutWidthAllowance: 0 }),
    )

    assert.deepEqual(result.parts, [])
    assert.deepEqual(result.issues, [])
  })
})
