import { strict as assert } from 'node:assert'
import { canonicalizeGcode, generateMachineProgram } from '../../../../src/nesting/post'
import { plan, profile } from './fixtures'

const LASER_OUTPUT = `(GENERIC LASER)
G21
G90
G00 X20 Y20
M03 S100
G04 P0
G01 X30 Y30 F1000
M05
M30
`
const PLASMA_OUTPUT = `(GENERIC PLASMA)
G21
G90
G00 X20 Y20
M03 S45
G04 P0.25
G01 X30 Y30 F500
M05
M30
`
const EDGE_OUTPUT = `N10 (EDGE Connect 809550 REV 6)
N20 G21
N30 G00 X20 Y20
N40 M15
N50 G01 X30 Y30
N60 M16
`

describe('modular post-processing quickstart', () => {
  it('processes laser, plasma, and EDGE Connect with exact canonical output', () => {
    const laser = generateMachineProgram(plan, profile({ expectedOutput: LASER_OUTPUT }))
    const plasma = generateMachineProgram(plan, profile({
      machineKind: 'plasma',
      processorId: 'generic-plasma',
      feed: 500,
      pierceDwellMs: 250,
      expectedOutput: PLASMA_OUTPUT,
    }))
    const edge = generateMachineProgram(plan, profile({
      machineKind: 'plasma',
      processorId: 'edge-connect',
      processorRevision: '809550-rev6',
      expectedOutput: EDGE_OUTPUT,
    }))
    assert.equal(laser.releasable, true)
    assert.equal(plasma.releasable, true)
    assert.equal(edge.releasable, true)
    assert.equal(canonicalizeGcode(laser.gcode), laser.gcode)
  })
})
