import { strict as assert } from 'node:assert'
import { glorystarFlameOff } from '../../../../../../src/nesting/post/dialects/glorystar/glorystarFlameOff'

const dialect = { headDownMaxDistance: 100, jumpMaxDistance: 1000 }

describe('glorystarFlameOff', () => {
  it('keeps the head down for a short travel', () => {
    assert.deepEqual(glorystarFlameOff(50, dialect), { lines: ['G840 L10'], headUp: false })
  })

  it('jumps for a medium travel', () => {
    assert.deepEqual(glorystarFlameOff(170.88, dialect), { lines: ['G840 L5'], headUp: false })
  })

  it('raises the head for a long travel', () => {
    assert.deepEqual(glorystarFlameOff(1200, dialect), {
      lines: ['G840 L0', 'G180,X0,Y0,Z(0.0+workpiece_safe_dist)', 'G153,G0,Z(kine_z+head_safe_dist)'],
      headUp: true,
    })
  })

  it('uses the thresholds as exclusive upper bounds', () => {
    assert.equal(glorystarFlameOff(99.999, dialect).lines[0], 'G840 L10')
    assert.equal(glorystarFlameOff(100, dialect).lines[0], 'G840 L5')
    assert.equal(glorystarFlameOff(1000, dialect).lines[0], 'G840 L0')
  })

  it('writes nothing after the last contour; the ending retracts the head', () => {
    assert.deepEqual(glorystarFlameOff(undefined, dialect), { lines: [], headUp: true })
  })
})
