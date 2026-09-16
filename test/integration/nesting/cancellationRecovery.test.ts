import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import { nestTrueShape } from '../../../src/nesting/trueShape'

describe('Observable cancellation recovery', () => {
  it('does not affect a later subscription', async () => {
    const controller = new AbortController()
    controller.abort()

    const cancelledEvents: string[] = []
    nestTrueShape({
      stock: [{ id: 'sheet', kind: 'sheet', width: 100, height: 100 }],
      parts: [],
      edgeClearance: 1,
      partToPartClearance: 1,
      seed: 1,
      signal: controller.signal,
    }).subscribe({
      next: () => cancelledEvents.push('next'),
      complete: () => cancelledEvents.push('complete'),
      error: () => cancelledEvents.push('error'),
    })

    const result = await firstValueFrom(
      nestTrueShape({
        stock: [{ id: 'sheet', kind: 'sheet', width: 100, height: 100 }],
        parts: [],
        edgeClearance: 1,
        partToPartClearance: 1,
        seed: 1,
      }),
    )

    assert.deepEqual(cancelledEvents, [])
    assert.deepEqual(result.placements, [])
  })
})
