import { strict as assert } from 'node:assert'
import '../../../../../src/nesting/post'
import { getMachineConfiguration } from '../../../../../src/nesting/post/machine/getMachineConfiguration'
import { listMachineConfigurations } from '../../../../../src/nesting/post/machine/listMachineConfigurations'
import { validateMachineConfiguration } from '../../../../../src/nesting/post/machine/validateMachineConfiguration'
import { criticalPaths } from '../../../../../src/nesting/post/machine/criticalPaths'

describe('machine configuration catalog', () => {
  it('lists summaries sorted by identifier', () => {
    const list = listMachineConfigurations()
    assert.deepEqual(list.map((s) => s.configurationId), [...list.map((s) => s.configurationId)].sort())
    const talvi = list.find((s) => s.configurationId === 'talvi-6000w')
    assert.deepEqual(talvi, {
      configurationId: 'talvi-6000w', name: 'Talvi 6000 W', machineKind: 'laser',
      processorId: 'talvi-6000w', processorRevision: 'laserahead-1', revision: 'talvi-6000w-1',
    })
  })

  it('returns a deep copy that cannot change the built-in data', () => {
    const copy = getMachineConfiguration('talvi-6000w')
    assert.ok(copy)
    ;(copy as unknown as { units: { value: string } }).units.value = 'inch'
    assert.equal(getMachineConfiguration('talvi-6000w')?.units.value, 'mm')
  })

  it('returns undefined for an unknown identifier and never falls back', () => {
    assert.equal(getMachineConfiguration('nope'), undefined)
  })

  it('has valid built-ins with a source and a classification on every critical value', () => {
    for (const summary of listMachineConfigurations()) {
      const config = getMachineConfiguration(summary.configurationId)!
      assert.deepEqual(validateMachineConfiguration(config), [], summary.configurationId)
      for (const path of criticalPaths(config.processorId)) {
        if (path === 'processMapping') continue
        let node: unknown = config
        for (const part of path.split('.')) node = (node as Record<string, unknown>)[part]
        const source = (node as { source?: { classification?: string; reference?: string } }).source
        assert.ok(source?.classification && source.reference, `${summary.configurationId} ${path}`)
      }
    }
  })
})
