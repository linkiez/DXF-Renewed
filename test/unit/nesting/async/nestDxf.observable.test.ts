import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import { nestDXF, nestWithPreset, quickNest } from '../../../../src/nest'

describe('DXF nesting Observable surface', () => {
  it('defers the empty-DXF result until subscription', async () => {
    const flow = nestDXF('', { binSize: { width: 100, height: 100 } })
    assert.equal(typeof flow.subscribe, 'function')

    const result = await firstValueFrom(flow)
    assert.deepEqual(result.placements, [])
  })

  it('keeps preset and quick entry points Observable-based', async () => {
    const preset = await firstValueFrom(
      nestWithPreset('', 'laser', { width: 100, height: 100 }),
    )
    const quick = await firstValueFrom(quickNest(''))

    assert.deepEqual(preset.placements, [])
    assert.deepEqual(quick.placements, [])
  })
})
