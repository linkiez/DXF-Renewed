import { strict as assert } from 'node:assert'
import { generateMachineProgram } from '../../../../src/nesting/post'
import { plan, profile } from './fixtures'

describe('generic plasma processor', () => {
  it('emits plasma dwell and torch commands', () => {
    const output = generateMachineProgram(plan, profile({ machineKind: 'plasma', processorId: 'generic-plasma' })).gcode
    assert.match(output, /G04/)
    assert.match(output, /M03 S45/)
  })
  it('rejects THC when the profile does not approve it', () => {
    const result = generateMachineProgram({
      ...plan,
      actions: plan.actions.map((action) =>
        action.kind === 'cut' ? { ...action, metadata: { thc: true } } : action,
      ),
    }, profile({
      machineKind: 'plasma',
      processorId: 'generic-plasma',
      capabilities: { thc: false },
    }))
    assert.equal(result.releasable, false)
    assert.ok(result.validationIssues.some((issue) => issue.code === 'CAPABILITY_UNSUPPORTED'))
  })
  it('reports missing amperage calibration instead of applying a default', () => {
    const result = generateMachineProgram(plan, profile({
      machineKind: 'plasma',
      processorId: 'generic-plasma',
      amperage: undefined,
    }))
    assert.equal(result.releasable, false)
    assert.ok(result.validationIssues.some((issue) => issue.code === 'PROCESS_SETTING_REQUIRED' && issue.message.includes('amperage')))
  })
})
