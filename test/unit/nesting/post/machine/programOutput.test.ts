import { strict as assert } from 'node:assert'
import { generateMachineProgram, listPostProcessors } from '../../../../../src/nesting/post'
import { toMachineProfile } from '../../../../../src/nesting/post/machine/toMachineProfile'
import { plan, profile } from '../fixtures'
import { approvedTalvi, baseConfiguration } from './fixtures'
import { referencePlan } from '../reference-plan'

describe('program output metadata', () => {
  it('reports the extension and line ending of the configuration', () => {
    const configuration = approvedTalvi()
    const program = generateMachineProgram(referencePlan(), toMachineProfile(configuration, { sheet: { width: 1500, height: 3000, margin: 0 } }))
    assert.deepEqual(program.output, { extension: '.nc', lineEnding: 'lf' })
    assert.ok(!program.gcode.includes('\r'))
    const crlf = { ...configuration, output: { ...configuration.output, lineEnding: { ...configuration.output.lineEnding, value: 'crlf' as const } } }
    const converted = generateMachineProgram(referencePlan(), toMachineProfile(crlf, { sheet: { width: 1500, height: 3000, margin: 0 } }))
    assert.deepEqual(converted.output, { extension: '.nc', lineEnding: 'crlf' })
    assert.ok(!converted.gcode.includes('\r'))
  })

  it('leaves the output of the existing processors unchanged', () => {
    const program = generateMachineProgram(plan, profile())
    assert.equal('output' in program, false)
    void baseConfiguration
  })

  it('lists the dialect processors with their machine kind and exact revision', () => {
    const talvi = listPostProcessors().find((p) => p.id === 'talvi-6000w')
    assert.deepEqual(talvi, { id: 'talvi-6000w', name: 'Talvi 6000 W (LaserAhead)', revision: 'laserahead-1', machineKind: 'laser' })
    assert.equal(listPostProcessors().find((p) => p.id === 'talvi-6000w' && p.revision === 'other'), undefined)
  })
})
