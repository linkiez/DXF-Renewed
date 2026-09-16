import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import { nestTrueShape } from '../../../../src/nesting/trueShape'

describe('nesting Observable input immutability', () => {
  it('does not mutate frozen true-shape requests', async () => {
    const request = Object.freeze({
      stock: Object.freeze([
        Object.freeze({ id: 'sheet', kind: 'sheet' as const, width: 100, height: 100 }),
      ]),
      parts: Object.freeze([]),
      edgeClearance: 1,
      partToPartClearance: 1,
      seed: 42,
    })

    const before = JSON.stringify(request)
    await firstValueFrom(nestTrueShape(request))

    assert.equal(JSON.stringify(request), before)
  })
})
