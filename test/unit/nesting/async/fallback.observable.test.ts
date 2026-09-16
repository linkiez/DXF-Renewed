import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import { nestTrueShape } from '../../../../src/nesting/trueShape'

describe('nesting Observable backend fallback', () => {
  it('completes with a backend report when acceleration is unavailable', async () => {
    const response = await firstValueFrom(
      nestTrueShape({
        stock: [{ id: 'sheet', kind: 'sheet', width: 100, height: 100 }],
        parts: [],
        edgeClearance: 1,
        partToPartClearance: 1,
        seed: 42,
        acceleration: true,
      }),
    )

    assert.ok(response.backend)
    assert.equal(response.backend?.requested, true)
  })
})
