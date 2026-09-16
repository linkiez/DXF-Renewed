import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import parseString from '../../../../src/parseString'
import { nest, nestFromDxf } from '../../../../src/nesting/applyNesting'

describe('apply nesting Observable surface', () => {
  it('does not execute before subscription and emits one result', async () => {
    const flow = nest(parseString(''))
    assert.equal(typeof flow.subscribe, 'function')

    const result = await firstValueFrom(flow)
    assert.deepEqual(result.placements, [])
  })

  it('supports raw DXF input through the same cold surface', async () => {
    const result = await firstValueFrom(nestFromDxf(''))
    assert.deepEqual(result.placements, [])
  })
})
