import { strict as assert } from 'node:assert'
import '../../../../../src/nesting/post'
import { hyperthermHpr400xdaConfiguration as config } from '../../../../../src/nesting/post/machine/hyperthermHpr400xda'
import { validateMachineConfiguration } from '../../../../../src/nesting/post/machine/validateMachineConfiguration'

describe('built-in Hypertherm EDGE Pro HPR400XDa configuration', () => {
  it('is valid', () => {
    assert.deepEqual(validateMachineConfiguration(config), [])
  })

  it('has the identity of the machine', () => {
    assert.equal(config.configurationId, 'hypertherm-edge-pro-hpr400xda')
    assert.equal(config.processorId, 'hypertherm-edge-pro-hpr400xda')
    assert.equal(config.processorRevision, 'edge-connect-809550-6')
    assert.equal(config.machineKind, 'plasma')
    assert.equal(config.units.value, 'mm')
  })

  it('declares the frame and the envelope as inferred and records the table conflict', () => {
    assert.deepEqual(config.frame.value, { rotationDegrees: 0, origin: 'bottom-left' })
    assert.equal(config.frame.source.classification, 'inferred')
    assert.match(config.frame.source.note ?? '', /machine setups/)
    assert.equal(config.envelope.source.classification, 'inferred')
    assert.match(config.table.source.note ?? '', /12192/)
    assert.match(config.table.source.note ?? '', /6096/)
  })

  it('records the program format', () => {
    assert.equal(config.arcCenter.value, 'incremental')
    assert.equal(config.decimals.value, 3)
    assert.equal(config.trailingZeros.value, false)
    assert.equal(config.output.extension.value, '.CNC')
    assert.match(config.output.extension.source.reference, /\.pst/)
    assert.equal(config.output.lineEnding.value, 'lf')
    assert.match(config.rapidFeed.source.note ?? '', /1200/)
  })

  it('records the dialect parameters, the vendor ones as vendor-confirmed with the applicability note', () => {
    assert.equal(config.dialect.station.value, 1)
    assert.equal(config.dialect.plasmaProcess.value, 1)
    assert.equal(config.dialect.markingProcess.value, 3)
    assert.equal(config.dialect.axisPreset.value, 0)
    assert.equal(config.dialect.axisPreset.source.classification, 'inferred')
    assert.match(config.dialect.axisPreset.source.note ?? '', /G92/)
    assert.equal('kerfTableIndex' in config.dialect, false)
    assert.equal(config.dialect.highDefinitionKey.value, 'highDefinition')
    assert.deepEqual(config.dialect.chartOrder.value, ['type', 'material', 'current', 'gas', 'thickness'])
    assert.match(config.dialect.chartOrder.source.note ?? '', /no V506/)
    for (const key of ['station', 'plasmaProcess', 'markingProcess', 'chartOrder']) {
      assert.equal(config.dialect[key].source.classification, 'vendor-confirmed', key)
      assert.match(config.dialect[key].source.reference, /809550/)
      assert.match(config.dialect[key].source.note ?? '', /HyPath/)
    }
  })

  it('lists the controller preconditions with their source and approves nothing', () => {
    assert.deepEqual(
      config.controllerPreconditions.map((p) => p.id),
      ['eia-g59-override', 'process-select-override', 'station-select-override', 'kerf-override', 'parallel-kerf-disabled-true-hole'],
    )
    for (const p of config.controllerPreconditions) assert.ok(p.source.reference.length > 0)
    assert.equal(JSON.stringify(config).includes('"approved"'), false)
  })
})
