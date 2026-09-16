import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import parseString from '../../../../src/parseString'
import { nest, resetNestingState } from '../../../../src/nesting/applyNesting'

describe('nesting Observable shared state', () => {
  it('resets generated shape state between runs', async () => {
    resetNestingState()
    const first = await firstValueFrom(nest(parseString('')))
    resetNestingState()
    const second = await firstValueFrom(nest(parseString('')))

    assert.deepEqual(
      { ...first, processingTimeMs: 0 },
      { ...second, processingTimeMs: 0 },
    )
  })
})
