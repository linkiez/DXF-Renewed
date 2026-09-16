import { strict as assert } from 'node:assert'
import { generateMachineProgram } from '../../../../src/nesting/post'
import { plan, profile } from './fixtures'

describe('generic laser processor', () => {
  it('emits rapid, pierce, feed, and end actions', () => {
    const output = generateMachineProgram(plan, profile()).gcode
    assert.match(output, /G00/)
    assert.match(output, /M03/)
    assert.match(output, /G01/)
    assert.match(output, /M30/)
  })
  it('reports missing calibration instead of applying defaults', () => {
    const result = generateMachineProgram(plan, profile({
      feed: undefined,
      power: undefined,
      pierceDwellMs: undefined,
    }))
    assert.equal(result.releasable, false)
    assert.equal(result.validationIssues.filter((issue) => issue.code === 'PROCESS_SETTING_REQUIRED').length, 3)
  })
})
