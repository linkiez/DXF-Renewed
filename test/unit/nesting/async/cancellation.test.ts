import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { nestTrueShape } from '../../../../src/nesting/trueShape'

describe('nesting Observable cancellation', () => {
  it('tears down silently when the external signal is already aborted', () => {
    const controller = new AbortController()
    controller.abort()
    const events: string[] = []

    nestTrueShape({
      stock: [{ id: 'sheet', kind: 'sheet', width: 100, height: 100 }],
      parts: [],
      edgeClearance: 1,
      partToPartClearance: 1,
      seed: 42,
      signal: controller.signal,
    }).subscribe({
      next: () => events.push('next'),
      complete: () => events.push('complete'),
      error: () => events.push('error'),
    })

    assert.deepEqual(events, [])
  })
})
