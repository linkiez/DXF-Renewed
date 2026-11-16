import { strict as assert } from 'node:assert'
import { arcSweep } from '../../../../../src/nesting/post/dialects/arcSweep'
import { splitArcAtQuadrants } from '../../../../../src/nesting/post/dialects/splitArcAtQuadrants'

const c = { x: 0, y: 0 }
const near = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps

describe('arcSweep', () => {
  it('measures the sweep in degrees', () => {
    assert.ok(near(arcSweep({ x: 10, y: 0 }, { x: 0, y: 10 }, c, false), 90))
    assert.ok(near(arcSweep({ x: 10, y: 0 }, { x: 0, y: 10 }, c, true), 270))
    assert.ok(near(arcSweep({ x: 10, y: 0 }, { x: -10, y: 0 }, c, false), 180))
  })

  it('treats equal start and end as a full circle', () => {
    assert.equal(arcSweep({ x: 10, y: 0 }, { x: 10, y: 0 }, c, false), 360)
    assert.equal(arcSweep({ x: 10, y: 0 }, { x: 10, y: 0 }, c, true), 360)
  })
})

describe('splitArcAtQuadrants', () => {
  it('breaks a full circle into four chained pieces on the circle', () => {
    const pieces = splitArcAtQuadrants({ x: 10, y: 0 }, { x: 10, y: 0 }, c, false)
    assert.equal(pieces.length, 4)
    for (let i = 0; i < pieces.length; i++) {
      assert.ok(near(Math.hypot(pieces[i].end.x, pieces[i].end.y), 10, 0.01))
      if (i > 0) assert.deepEqual(pieces[i].start, pieces[i - 1].end)
    }
    assert.deepEqual(pieces[3].end, { x: 10, y: 0 })
  })

  it('returns an arc inside one quadrant as it is', () => {
    const start = { x: 10, y: 0 }
    const end = { x: 7, y: 7.14142842854285 }
    const pieces = splitArcAtQuadrants(start, end, c, false)
    assert.deepEqual(pieces, [{ start, end }])
  })

  it('breaks at each crossed quadrant point in the sweep direction', () => {
    const pieces = splitArcAtQuadrants({ x: 7, y: 7 }, { x: -7, y: 7 }, c, false)
    assert.equal(pieces.length, 2)
    assert.ok(near(pieces[0].end.x, 0, 1e-9) || near(Math.abs(pieces[0].end.y), Math.hypot(7, 7), 1e-6))
    const clockwise = splitArcAtQuadrants({ x: 7, y: 7 }, { x: -7, y: 7 }, c, true)
    assert.equal(clockwise.length, 4)
  })
})
