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
})
