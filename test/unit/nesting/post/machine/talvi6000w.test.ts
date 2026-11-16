import { strict as assert } from 'node:assert'
import '../../../../../src/nesting/post'
import { talvi6000wConfiguration as config } from '../../../../../src/nesting/post/machine/talvi6000w'
import { validateMachineConfiguration } from '../../../../../src/nesting/post/machine/validateMachineConfiguration'

describe('built-in Talvi 6000 W configuration', () => {
  it('is valid once the Talvi processor is registered', () => {
    assert.deepEqual(validateMachineConfiguration(config), [])
  })

  it('has the identity of the machine', () => {
    assert.equal(config.configurationId, 'talvi-6000w')
    assert.equal(config.processorId, 'talvi-6000w')
    assert.equal(config.processorRevision, 'laserahead-1')
    assert.equal(config.machineKind, 'laser')
    assert.equal(config.units.value, 'mm')
  })

  it('records the confirmed envelope and keeps the soft limits out of it', () => {
    assert.deepEqual(config.envelope.value, { minX: -1500, maxX: 0, minY: 0, maxY: 3000 })
    assert.equal(config.envelope.source.classification, 'user-confirmed')
    assert.match(config.envelope.source.note ?? '', /-1525/)
    assert.match(config.envelope.source.note ?? '', /3070/)
  })

  it('declares the frame as inferred because the rotation and the shift are inferred', () => {
    assert.deepEqual(config.frame.value, { rotationDegrees: 0, origin: 'bottom-right' })
    assert.equal(config.frame.source.classification, 'inferred')
  })

  it('records the observed program format', () => {
    assert.equal(config.rapidFeed.value, 26000)
    assert.equal(config.rapidFeed.source.classification, 'observed')
    assert.equal(config.arcCenter.value, 'incremental')
    assert.equal(config.decimals.value, 4)
    assert.equal(config.trailingZeros.value, true)
    assert.equal(config.output.extension.value, '.nc')
    assert.equal(config.output.lineEnding.value, 'lf')
    for (const sourced of [config.arcCenter, config.decimals, config.trailingZeros, config.output.extension, config.output.lineEnding]) {
      assert.equal(sourced.source.classification, 'observed')
    }
    assert.deepEqual(config.operations.value, ['rapid', 'pierce', 'lead-in', 'cut', 'lead-out', 'overcut', 'end'])
  })

  it('records the dialect parameters with their classification', () => {
    assert.equal(config.dialect.lastDistance.value, -999)
    assert.equal(config.dialect.lastDistance.source.classification, 'inferred')
    assert.equal(config.dialect.distanceDecimals.value, 3)
    assert.equal(config.dialect.sizeDecimals.value, 3)
    assert.equal(config.dialect.arcMinimumSweep.value, 2)
    for (const key of ['distanceDecimals', 'sizeDecimals', 'arcMinimumSweep']) {
      assert.equal(config.dialect[key].source.classification, 'observed', key)
    }
  })

  it('lists the controller macros it calls and ships no process mapping', () => {
    assert.deepEqual(
      config.externalDependencies.map((d) => d.name).sort(),
      ['endpos', 'layer_end', 'layer_start', 'process_end', 'process_start', 'runframework'],
    )
    assert.equal(config.processMapping, undefined)
  })
})
