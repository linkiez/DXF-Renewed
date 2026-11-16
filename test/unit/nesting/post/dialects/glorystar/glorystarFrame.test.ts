import { strict as assert } from 'node:assert'
import { glorystarEnding } from '../../../../../../src/nesting/post/dialects/glorystar/glorystarEnding'
import { glorystarHeader } from '../../../../../../src/nesting/post/dialects/glorystar/glorystarHeader'

describe('GloryStar header and ending', () => {
  it('writes the loader block with the sheet and the thickness in micrometres', () => {
    const lines = glorystarHeader({ length: 3000, width: 1500 }, 6)
    assert.deepEqual(lines.slice(0, 7), [
      '%', ';Laser machine G834 (Run-time working table selection) test program', 'G2292,S1,X0,Y0,Z0,U3000,V1500,W1',
      'SHP(0,0,0,3000,1500,6)', 'G64', 'G90', 'G168',
    ])
    assert.ok(lines.includes('%Sheet_Load_Inp.I_Spessore  = 6000 ; Material thickness [um]'))
    assert.ok(lines.includes('%Sheet_Load_Inp.I_Lunghezza = 3000    ; Sheet length'))
    assert.ok(lines.includes('%Sheet_Load_Inp.I_Larghezza = 1500    ; Sheet width'))
    assert.deepEqual(lines.slice(-4), ['JMPF (start_track)', 'N0', 'JSR "inizio.cfs"', 'JSR "Apa.cfs"'])
  })

  it('writes the head-up retraction and the ending', () => {
    assert.deepEqual(glorystarEnding(), ['G840 L0', 'G153,G0,Z(trav_safe_z)', 'G169', 'M498', 'JSR "fine.cfs"', 'M30'])
  })

  it('has no trailing spaces', () => {
    for (const line of [...glorystarHeader({ length: 3000, width: 1500 }, 6), ...glorystarEnding()]) assert.equal(line, line.trimEnd())
  })
})
