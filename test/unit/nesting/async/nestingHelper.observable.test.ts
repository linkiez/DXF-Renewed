import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import { NestingHelper } from '../../../../src/nesting/NestingHelper'

describe('NestingHelper Observable surface', () => {
  it('populates synchronous accessors after the Observable emits', async () => {
    const helper = new NestingHelper('')
    const result = await firstValueFrom(helper.nest())

    assert.deepEqual(result.placements, [])
    assert.deepEqual(helper.shapes, [])
    assert.equal(typeof helper.toNestedSvg(), 'string')
    assert.equal(typeof helper.toNestedDxf(), 'string')
  })

  it('clears accessors when a later subscription is cancelled', async () => {
    const helper = new NestingHelper('')
    await firstValueFrom(helper.nest())

    const controller = new AbortController()
    controller.abort()
    helper.nest({ signal: controller.signal }).subscribe()

    assert.throws(() => helper.nestingResult, /No nesting result available/)
    assert.throws(() => helper.toNestedSvg(), /No nesting result available/)
    assert.throws(() => helper.toNestedDxf(), /No nesting result available/)
  })
})
