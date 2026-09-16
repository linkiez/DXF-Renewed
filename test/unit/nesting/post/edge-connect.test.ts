import { strict as assert } from 'node:assert'
import { generateMachineProgram } from '../../../../src/nesting/post'
import { plan, profile } from './fixtures'

describe('EDGE Connect 809550 revision 6', () => {
  it('emits documented EIA rapid, linear, axis, and line-number words', () => {
    const result = generateMachineProgram(plan, profile({
      machineKind: 'plasma',
      processorId: 'edge-connect',
      processorRevision: '809550-rev6',
      expectedOutput: `N10 (EDGE Connect 809550 REV 6)
N20 G21
N30 G00 X20 Y20
N40 M15
N50 G01 X30 Y30
N60 M16
`,
    }))
    assert.equal(result.releasable, true)
    assert.match(result.gcode, /N10/)
    assert.match(result.gcode, /G00 X20 Y20/)
    assert.match(result.gcode, /G01 X30 Y30/)
  })
})
