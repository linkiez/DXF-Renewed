import { strict as assert } from 'node:assert'
import { criticalPaths } from '../../../../../src/nesting/post/machine/criticalPaths'
import { releaseIssues } from '../../../../../src/nesting/post/machine/releaseIssues'
import { baseConfiguration, withClassification } from './fixtures'

const COMMON = ['units', 'envelope', 'frame', 'rapidFeed', 'arcCenter', 'decimals', 'output.extension', 'operations']

describe('criticalPaths', () => {
  it('lists the common critical values for the three processors', () => {
    for (const id of ['talvi-6000w', 'glorystar-gs3015', 'hypertherm-edge-pro-hpr400xda']) {
      const list = criticalPaths(id)
      for (const path of COMMON) assert.ok(list.includes(path), `${id} ${path}`)
    }
    assert.ok(criticalPaths('talvi-6000w').includes('processMapping'))
    assert.ok(criticalPaths('talvi-6000w').includes('dialect.lastDistance'))
    assert.ok(criticalPaths('glorystar-gs3015').includes('dialect.headDownMaxDistance'))
    assert.ok(criticalPaths('hypertherm-edge-pro-hpr400xda').includes('dialect.chartOrder'))
  })

  it('returns no path for an unknown processor', () => {
    assert.deepEqual(criticalPaths('nope'), [])
  })
})

describe('releaseIssues', () => {
  const config = baseConfiguration({ processorId: 'talvi-6000w' })
  const talvi = { ...config, processMapping: { value: { key: 'quality', entries: [], omitQ: 'never' as const }, source: config.rapidFeed.source },
    dialect: Object.fromEntries(criticalPaths('talvi-6000w').filter((p) => p.startsWith('dialect.')).map((p) => [p.slice(8), { value: 1, source: config.rapidFeed.source }])) }

  it('is empty when every critical value is approved', () => {
    assert.deepEqual(releaseIssues('talvi-6000w', talvi), [])
  })

  it('reports one UNAPPROVED_VALUE per non-approved critical value, naming its path', () => {
    const changed = withClassification(withClassification(talvi, 'frame', 'inferred'), 'dialect.lastDistance', 'observed')
    const issues = releaseIssues('talvi-6000w', changed)
    assert.deepEqual(issues.map((i) => i.code), ['UNAPPROVED_VALUE', 'UNAPPROVED_VALUE'])
    assert.deepEqual(issues.map((i) => i.path).sort(), ['dialect.lastDistance', 'frame'])
  })

  it('reports an absent critical value and ignores non-critical ones', () => {
    const { processMapping: _omit, ...without } = talvi
    assert.equal(releaseIssues('talvi-6000w', without as typeof talvi).find((i) => i.path === 'processMapping')?.code, 'CONFIG_FIELD_MISSING')
    assert.deepEqual(releaseIssues('talvi-6000w', withClassification(talvi, 'table', 'inferred')), [])
  })

  it('has nothing to check for an unknown processor', () => {
    assert.deepEqual(releaseIssues('nope', config), [])
  })
})
