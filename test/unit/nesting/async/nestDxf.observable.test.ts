import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import { nestDXF, nestWithPreset, quickNest } from '../../../../src/nest'
import fs from 'node:fs'
import path from 'node:path'

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

  it('repeats seeded part-based nesting deterministically', async () => {
    const dxf = fs.readFileSync(
      path.join(process.cwd(), 'test/resources/nest-fixtures/simple-parts.dxf'),
      'utf8',
    )
    const flow = nestDXF(dxf, {
      binSize: { width: 100, height: 100 },
      gaPopulation: 4,
      maxIterations: 3,
      seed: 123,
    })

    const first = await firstValueFrom(flow)
    const second = await firstValueFrom(flow)

    assert.deepEqual(first.placements, second.placements)
    assert.deepEqual(
      { ...first.metrics, processingTimeMs: 0 },
      { ...second.metrics, processingTimeMs: 0 },
    )
  })

  it('isolates random state between concurrent seeded runs', async () => {
    const dxf = fs.readFileSync(
      path.join(process.cwd(), 'test/resources/nest-fixtures/simple-parts.dxf'),
      'utf8',
    )
    const options = {
      binSize: { width: 100, height: 100 },
      gaPopulation: 4,
      maxIterations: 3,
    }

    const [first, second, different] = await Promise.all([
      firstValueFrom(nestDXF(dxf, { ...options, seed: 11 })),
      firstValueFrom(nestDXF(dxf, { ...options, seed: 11 })),
      firstValueFrom(nestDXF(dxf, { ...options, seed: 12 })),
    ])

    assert.deepEqual(first.placements, second.placements)
    assert.notDeepEqual(first.placements, different.placements)
  })
})
