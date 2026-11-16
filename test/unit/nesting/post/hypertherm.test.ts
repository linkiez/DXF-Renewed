import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { canonicalizeGcode, generateMachineProgram } from '../../../../src/nesting/post'
import { toMachineProfile } from '../../../../src/nesting/post/machine/toMachineProfile'
import { approvedHypertherm, hyperthermSettings } from './machine/fixtures'
import { referencePlan } from './reference-plan'

const reference = readFileSync(join(__dirname, '../../../resources/post-references/hypertherm-edge-pro-hpr400xda.cnc'), 'utf8')
const sheet = { width: 1500, height: 3000, margin: 0 }
const plan = () => referencePlan({ metadata: { kerfSide: 'left' }, perContour: { 'c-hole': { kerfSide: 'right', highDefinition: true } } })
const generate = (settings: Record<string, boolean | number | string> = hyperthermSettings) =>
  generateMachineProgram(plan(), toMachineProfile(approvedHypertherm(), { sheet, processSettings: settings, expectedOutput: reference }))

describe('Hypertherm reference program', () => {
  it('matches the reviewed program exactly and is releasable', () => {
    const program = generate()
    assert.deepEqual(program.validationIssues, [])
    assert.equal(program.expectedOutputMatched, true)
    assert.equal(program.releasable, true)
    assert.equal(program.gcode, canonicalizeGcode(reference))
    assert.deepEqual(program.output, { extension: '.CNC', lineEnding: 'lf' })
  })

  it('is identical over five runs', () => {
    const first = generate().gcode
    for (let run = 0; run < 4; run++) assert.equal(generate().gcode, first)
  })

  it('follows the vendor part program format (SC-011)', () => {
    const lines = generate().gcode.trimEnd().split('\n')
    const order = lines.filter((l) => /^G59 V50[2-7]/.test(l)).map((l) => l.split(' ')[1])
    assert.deepEqual(order, ['V502', 'V503', 'V504', 'V505', 'V507'])
    lines.forEach((line, i) => {
      if (line.startsWith('M07')) assert.ok(/^G4[12]$/.test(lines[i - 1]), `kerf before ${line}`)
    })
    assert.equal(lines.filter((l) => l.startsWith('M07')).length, lines.filter((l) => l.startsWith('M08')).length)
    assert.ok(!lines.some((l) => /^M1[56]\b/.test(l)))
    assert.equal(lines.slice(-2).join(','), 'M19,M02')
    assert.ok(lines.filter((l) => l.startsWith('(PRECONDITION')).length === 5)
  })

  it('blocks the release when a required setting is missing and warns when the settings were typed by hand', () => {
    const { current: _omit, ...without } = hyperthermSettings as Record<string, boolean | number | string>
    assert.equal(generate(without).releasable, false)
    const { chartSource: _source, ...manual } = hyperthermSettings as Record<string, boolean | number | string>
    const program = generate(manual)
    assert.ok(program.validationIssues.some((i) => i.code === 'CUTCHART_UNVERIFIED'))
    assert.equal(program.releasable, true)
  })
})
