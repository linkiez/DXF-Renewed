import { strict as assert } from 'node:assert'
import '../../../../../src/nesting/post'
import { validateMachineConfiguration } from '../../../../../src/nesting/post/machine/validateMachineConfiguration'
import type { MachineConfiguration } from '../../../../../src/nesting/post/machine/types'
import { baseConfiguration, paths } from './fixtures'

const codeAt = (configuration: unknown, path: string): string | undefined =>
  validateMachineConfiguration(configuration as MachineConfiguration).find((issue) => issue.path === path)?.code

describe('validateMachineConfiguration', () => {
  it('accepts a valid configuration', () => {
    assert.deepEqual(validateMachineConfiguration(baseConfiguration()), [])
  })

  it('reports empty identity fields', () => {
    for (const field of ['configurationId', 'revision', 'processorId', 'processorRevision']) {
      assert.equal(codeAt({ ...baseConfiguration(), [field]: '' }, field), 'CONFIG_FIELD_MISSING', field)
    }
  })

  it('reports a missing value and a value without a source', () => {
    const { rapidFeed: _omit, ...withoutFeed } = baseConfiguration()
    assert.equal(codeAt(withoutFeed, 'rapidFeed'), 'CONFIG_FIELD_MISSING')
    const noRef = { ...baseConfiguration(), rapidFeed: { value: 100, source: { classification: 'approved', reference: '' } } }
    assert.equal(codeAt(noRef, 'rapidFeed.source.reference'), 'CONFIG_SOURCE_MISSING')
    const noSource = { ...baseConfiguration(), decimals: { value: 4 } }
    assert.equal(codeAt(noSource, 'decimals.source'), 'CONFIG_SOURCE_MISSING')
  })

  it('reports invalid values with their path', () => {
    const base = baseConfiguration()
    const approved = base.rapidFeed.source
    const cases: Array<[string, unknown]> = [
      ['units.value', { ...base, units: { value: 'cm', source: approved } }],
      ['rapidFeed.value', { ...base, rapidFeed: { value: 0, source: approved } }],
      ['decimals.value', { ...base, decimals: { value: 7, source: approved } }],
      ['decimals.value', { ...base, decimals: { value: 1.5, source: approved } }],
      ['output.extension.value', { ...base, output: { ...base.output, extension: { value: 'nc', source: approved } } }],
      ['arcCenter.value', { ...base, arcCenter: { value: 'relative', source: approved } }],
    ]
    for (const [path, configuration] of cases) assert.equal(codeAt(configuration, path), 'CONFIG_FIELD_INVALID', path)
  })

  it('reports an envelope whose min is not below max', () => {
    const base = baseConfiguration()
    const bad = { ...base, envelope: { value: { minX: 0, maxX: 0, minY: 0, maxY: 10 }, source: base.envelope.source } }
    assert.equal(codeAt(bad, 'envelope.value'), 'CONFIG_ENVELOPE_INVALID')
  })

  it('reports invalid process mappings', () => {
    const base = baseConfiguration()
    const mapping = (value: unknown) => ({ ...base, processMapping: { value, source: base.rapidFeed.source } })
    const entry = { value: 'a', p: 1, q: 1 }
    assert.equal(codeAt(mapping({ key: 'quality', entries: [entry, entry], omitQ: 'never' }), 'processMapping.value.entries'), 'CONFIG_MAPPING_INVALID')
    assert.equal(codeAt(mapping({ key: 'quality', entries: [{ value: 'a', p: -1 }], omitQ: 'never' }), 'processMapping.value.entries'), 'CONFIG_MAPPING_INVALID')
    assert.equal(codeAt(mapping({ key: 'quality', entries: [{ value: 'a', p: 1, q: -2 }], omitQ: 'never' }), 'processMapping.value.entries'), 'CONFIG_MAPPING_INVALID')
    assert.equal(codeAt(mapping({ key: 'quality', entries: [entry], omitQ: 'sometimes' }), 'processMapping.value.omitQ'), 'CONFIG_MAPPING_INVALID')
  })

  it('reports an unregistered processor and never throws on invalid data', () => {
    assert.equal(codeAt({ ...baseConfiguration(), processorId: 'nope' }, 'processorId'), 'CONFIG_UNKNOWN_PROCESSOR')
    const issues = validateMachineConfiguration(null as unknown as MachineConfiguration)
    assert.ok(issues.length > 0)
    assert.deepEqual(paths(validateMachineConfiguration({} as MachineConfiguration)).includes('units'), true)
  })
})
