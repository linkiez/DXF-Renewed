import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import { nestTrueShape } from '../../../../src/nesting/trueShape'

describe('nesting Observable coldness', () => {
  it('recomputes on each subscription without sharing state', async () => {
    const flow = nestTrueShape({
      stock: [{ id: 'sheet', kind: 'sheet', width: 100, height: 100 }],
      parts: [],
      edgeClearance: 1,
      partToPartClearance: 1,
      seed: 42,
    })

    const first = await firstValueFrom(flow)
    const second = await firstValueFrom(flow)

    assert.deepEqual(first.placements, second.placements)
    assert.deepEqual(first.unplaced, second.unplaced)
    assert.equal(first.budget.iterations, second.budget.iterations)
  })
})
