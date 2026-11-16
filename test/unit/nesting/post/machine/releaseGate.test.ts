import { strict as assert } from 'node:assert'
import { generateMachineProgram } from '../../../../../src/nesting/post'
import { getMachineConfiguration } from '../../../../../src/nesting/post/machine/getMachineConfiguration'
import { toMachineProfile } from '../../../../../src/nesting/post/machine/toMachineProfile'
import { validateMachineConfiguration } from '../../../../../src/nesting/post/machine/validateMachineConfiguration'
import type { MachineConfiguration } from '../../../../../src/nesting/post/machine/types'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { referencePlan } from '../reference-plan'
import { approvedTalvi, withClassification } from './fixtures'

const sheet = { width: 1500, height: 3000, margin: 0 }
const expectedOutput = readFileSync(join(__dirname, '../../../../resources/post-references/talvi-6000w.nc'), 'utf8')
const run = (configuration: MachineConfiguration) =>
  generateMachineProgram(referencePlan(), toMachineProfile(configuration, { sheet, expectedOutput }))

describe('release gate', () => {
  it('releases the approved copy', () => {
    assert.equal(run(approvedTalvi()).releasable, true)
  })

  it('keeps producing the program but blocks the release for each non-approved critical value', () => {
    let changed = approvedTalvi()
    for (const path of ['frame', 'dialect.lastDistance', 'processMapping']) changed = withClassification(changed, path, 'inferred')
    const program = run(changed)
    assert.ok(program.gcode.length > 0)
    assert.equal(program.releasable, false)
    const unapproved = program.validationIssues.filter((i) => i.code === 'UNAPPROVED_VALUE')
    assert.equal(unapproved.length, 3)
    for (const path of ['frame', 'dialect.lastDistance', 'processMapping']) {
      assert.ok(unapproved.some((i) => i.message.includes(`"${path}"`)), path)
    }
  })

  it('never releases a built-in configuration as shipped', () => {
    const shipped = getMachineConfiguration('talvi-6000w')!
    const program = run(shipped)
    assert.equal(program.releasable, false)
    assert.ok(program.validationIssues.some((i) => i.code === 'UNAPPROVED_VALUE'))
  })

  it('reports a broken field with its path and does not throw', () => {
    const broken = { ...approvedTalvi(), decimals: { ...approvedTalvi().decimals, value: -1 } }
    assert.equal(validateMachineConfiguration(broken)[0].code, 'CONFIG_FIELD_INVALID')
    assert.equal(validateMachineConfiguration(broken)[0].path, 'decimals.value')
    const program = run(broken)
    assert.equal(program.releasable, false)
    assert.equal(program.gcode, '')
    assert.ok(program.validationIssues.some((i) => i.code === 'CONFIG_FIELD_INVALID'))
  })

  it('uses a caller-supplied configuration and leaves the built-in data unchanged', () => {
    const copy = getMachineConfiguration('talvi-6000w')!
    const supplied = { ...copy, units: { ...copy.units, value: 'inch' as const } }
    assert.equal(toMachineProfile(supplied, { sheet }).units, 'inch')
    assert.equal(getMachineConfiguration('talvi-6000w')?.units.value, 'mm')
  })
})
