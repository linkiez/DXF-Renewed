import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { canonicalizeGcode, generateMachineProgram } from '../../../../src/nesting/post'
import { toMachineProfile } from '../../../../src/nesting/post/machine/toMachineProfile'
import { checkTalviStructure } from './dialects/talviStructure'
import { approvedTalvi } from './machine/fixtures'
import { generatedPlan, referencePlan } from './reference-plan'

const reference = readFileSync(join(__dirname, '../../../resources/post-references/talvi-6000w.nc'), 'utf8')
const sheet = { width: 1500, height: 3000, margin: 0 }
const generate = (plan = referencePlan(), expectedOutput: string | undefined = reference) =>
  generateMachineProgram(plan, toMachineProfile(approvedTalvi(), { sheet, ...(expectedOutput !== undefined ? { expectedOutput } : {}) }))

describe('Talvi 6000 W reference program', () => {
  it('matches the reviewed program exactly and is releasable', () => {
    const program = generate()
    assert.deepEqual(program.validationIssues, [])
    assert.equal(program.expectedOutputMatched, true)
    assert.equal(program.releasable, true)
    assert.equal(program.gcode, canonicalizeGcode(reference))
    assert.deepEqual(program.output, { extension: '.nc', lineEnding: 'lf' })
  })

  it('is identical over five runs', () => {
    const first = generate().gcode
    for (let run = 0; run < 4; run++) assert.equal(generate().gcode, first)
  })

  it('passes the structure checker, also for 100 contours', () => {
    assert.deepEqual(checkTalviStructure(generate().gcode), [])
    const big = generate(generatedPlan(100), undefined)
    assert.equal(big.gcode.split('\n').filter((l) => /^N\d{4}$/.test(l)).length, 100)
    assert.deepEqual(checkTalviStructure(big.gcode), [])
  })
})
