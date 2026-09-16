import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import { nestTrueShape } from '../../../../src/nesting/trueShape'

describe('nesting Observable determinism', () => {
  it('keeps placements stable for the same input and seed', async () => {
    const request = {
      stock: [{ id: 'sheet', kind: 'sheet' as const, width: 100, height: 100 }],
      parts: [],
      edgeClearance: 1,
      partToPartClearance: 1,
      seed: 42,
    }

    const first = await firstValueFrom(nestTrueShape(request))
    const second = await firstValueFrom(nestTrueShape(request))

    assert.deepEqual(first.placements, second.placements)
    assert.equal(first.budget.iterations, second.budget.iterations)
  })
})
