import { strict as assert } from 'node:assert'
import '../../../../../src/nesting/post'
import { gloryStarGs3015Configuration as config } from '../../../../../src/nesting/post/machine/gloryStarGs3015'
import { validateMachineConfiguration } from '../../../../../src/nesting/post/machine/validateMachineConfiguration'

describe('built-in GloryStar GS3015 configuration', () => {
  it('is valid', () => {
    assert.deepEqual(validateMachineConfiguration(config), [])
  })

  it('has the identity of the machine', () => {
    assert.equal(config.configurationId, 'glorystar-gs3015')
    assert.equal(config.processorId, 'glorystar-gs3015')
    assert.equal(config.processorRevision, 'sigmanest-23.2-1')
    assert.equal(config.machineKind, 'laser')
    assert.equal(config.units.value, 'mm')
  })

  it('infers the frame and the envelope and records the table conflict', () => {
    assert.deepEqual(config.frame.value, { rotationDegrees: 90, origin: 'bottom-left' })
    assert.equal(config.frame.source.classification, 'inferred')
    assert.equal(config.envelope.source.classification, 'inferred')
    assert.match(config.table.source.note ?? '', /18000/)
    assert.match(config.table.source.note ?? '', /1500/)
  })

  it('records the program format as observed', () => {
    assert.equal(config.arcCenter.value, 'absolute')
    assert.equal(config.decimals.value, 3)
    assert.equal(config.trailingZeros.value, false)
    assert.equal(config.output.extension.value, '.PGM')
    assert.equal(config.rapidFeed.value, 26000)
    for (const sourced of [config.arcCenter, config.decimals, config.trailingZeros, config.output.extension]) {
      assert.equal(sourced.source.classification, 'observed')
    }
  })

  it('records the dialect parameters as observed', () => {
    const expected: Record<string, unknown> = {
      headDownMaxDistance: 100, jumpMaxDistance: 1000, heightOffCode: 'M82', heightOnCode: 'M83', smallContourClass: 'small',
      regulatorOffQuality: 3, arcMinimumSweep: 2, thickMaterialGroups: ['GRPALMG', 'GRPINOX'], thickMinThickness: 6,
    }
    for (const [key, value] of Object.entries(expected)) {
      assert.deepEqual(config.dialect[key].value, value, key)
      assert.equal(config.dialect[key].source.classification, 'observed', key)
      assert.match(config.dialect[key].source.reference, /GloryStar_GS3015\.pas/)
    }
  })

  it('lists the controller subprograms and the missing helper script, and approves nothing', () => {
    assert.deepEqual(config.externalDependencies.map((d) => d.name).sort(), ['Apa.cfs', 'Soitaab_Oxy_ECS_mm.pas', 'fine.cfs', 'inizio.cfs'])
    assert.match(config.externalDependencies.find((d) => d.name === 'Soitaab_Oxy_ECS_mm.pas')?.source.note ?? '', /missing/)
    assert.equal(JSON.stringify(config).includes('"approved"'), false)
  })
})
