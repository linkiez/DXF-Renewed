import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { canonicalizeGcode, generateMachineProgram } from '../../../../src/nesting/post'
import { toMachineProfile } from '../../../../src/nesting/post/machine/toMachineProfile'
import { approvedGloryStar, gloryStarSettings } from './machine/fixtures'
import { referencePlan } from './reference-plan'

const reference = readFileSync(join(__dirname, '../../../resources/post-references/glorystar-gs3015.pgm'), 'utf8')
const sheet = { width: 1500, height: 3000, margin: 0 }
const generate = () =>
  generateMachineProgram(
    referencePlan({ quality: '1' }),
    toMachineProfile(approvedGloryStar(), { sheet, processSettings: gloryStarSettings, expectedOutput: reference }),
  )

describe('GloryStar reference program', () => {
  it('matches the reviewed program exactly and is releasable', () => {
    const program = generate()
    assert.deepEqual(program.validationIssues, [])
    assert.equal(program.expectedOutputMatched, true)
    assert.equal(program.releasable, true)
    assert.equal(program.gcode, canonicalizeGcode(reference))
    assert.deepEqual(program.output, { extension: '.PGM', lineEnding: 'lf' })
  })

  it('is identical over five runs', () => {
    const first = generate().gcode
    for (let run = 0; run < 4; run++) assert.equal(generate().gcode, first)
  })

  it('exercises the head-down, jump and head-up travels', () => {
    const lines = generate().gcode.split('\n')
    for (const expected of ['G840 L10', 'G840 L5', 'G840 L0']) assert.ok(lines.includes(expected), expected)
    assert.equal(lines.filter((l) => l === 'G840 L0').length, 2)
  })
})
