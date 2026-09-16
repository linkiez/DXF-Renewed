import { strict as assert } from 'node:assert'
import { listPostProcessors, resolvePostProcessor, registerPostProcessor } from '../../../../src/nesting/post'

describe('post-processor registry', () => {
  it('resolves exact built-in revisions', () => {
    assert.equal(resolvePostProcessor('edge-connect', '809550-rev6')?.name, 'Hypertherm EDGE Connect')
    assert.equal(resolvePostProcessor('edge-connect', 'other'), undefined)
    assert.ok(listPostProcessors().length >= 3)
  })
  it('rejects duplicate identities', () => {
    assert.throws(() => registerPostProcessor({
      id: 'generic-laser', name: 'Duplicate', revision: '1', machineKind: 'laser',
      validate: () => [], emit: () => '',
    }))
  })
})
