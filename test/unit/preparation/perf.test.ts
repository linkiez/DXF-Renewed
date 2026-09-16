import assert from 'node:assert'
import { prepareParts } from '../../../src/nesting/pro/partPrep/index'
import { fixture } from './helpers'

describe('performance smoke', function () {
  this.timeout(60000)

  it('prepares ~500 parts in under 30 s on a single core', async () => {
    const dxf = fixture('arrayed-holes.dxf')
    const options = { tolerance: 0.01, cutWidthAllowance: 0 }
    const partsPerRun = Math.max(1, (await prepareParts(dxf, options)).parts.length)
    const runs = Math.ceil(500 / partsPerRun)
    const start = Date.now()
    for (let i = 0; i < runs; i++) {
      await prepareParts(dxf, options)
    }
    const elapsed = Date.now() - start
    assert.ok(elapsed < 30000, `~500 parts took ${elapsed}ms`)
  })
})
