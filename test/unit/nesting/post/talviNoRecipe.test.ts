import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { generateMachineProgram } from '../../../../src/nesting/post'
import { toMachineProfile } from '../../../../src/nesting/post/machine/toMachineProfile'
import { talvi6000wConfiguration } from '../../../../src/nesting/post/machine/talvi6000w'
import { approvedTalvi } from './machine/fixtures'
import { generatedPlan, referencePlan } from './reference-plan'

const sheet = { width: 1500, height: 3000, margin: 0 }
const reference = readFileSync(join(__dirname, '../../../resources/post-references/talvi-6000w.nc'), 'utf8')
const programs = [
  reference,
  generateMachineProgram(generatedPlan(100), toMachineProfile(approvedTalvi(), { sheet })).gcode,
]

describe('Talvi programs carry no recipe values', () => {
  it('has no speed, power, frequency, gas, pressure or focus word', () => {
    for (const text of programs) {
      for (const line of text.split('\n')) {
        assert.ok(!/(^|\s)[FSEPQ]-?\d/.test(line.replace(/^M101 P\d+( Q\d+)?$/, '').replace('G64 P0.03 Q0.001', '').replace('M64 P3', '').replace('M65 P3', '')), line)
        assert.ok(!/^M0?[35]\b/.test(line), line)
        assert.ok(!/(power|speed|gas|focus|pressure)/i.test(line), line)
      }
    }
  })

  it('names the controller macros it calls', () => {
    const names = talvi6000wConfiguration.externalDependencies.map((d) => d.name)
    for (const name of names) assert.ok(reference.includes(`<${name}>`), name)
  })
})
