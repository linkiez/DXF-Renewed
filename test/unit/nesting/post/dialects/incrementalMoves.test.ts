import { strict as assert } from 'node:assert'
import type { CutAction } from '../../../../../src/nesting/cutPath'
import { emitIncrementalMoves } from '../../../../../src/nesting/post/dialects/incrementalMoves'
import { GcodeWriter } from '../../../../../src/nesting/post/gcode/writer'

const dialect = { arcMinimumSweep: 2 }
const identity = (p: { x: number; y: number }) => p
const run = (actions: CutAction[], map = identity): string[] => {
  const writer = new GcodeWriter({ precision: 4, trailingZeros: true })
  emitIncrementalMoves(actions, writer, map, dialect)
  return writer.toString().trimEnd().split('\n')
}
const line = (to: { x: number; y: number }, from = { x: 0, y: 0 }): CutAction => ({ kind: 'cut', points: [from, to] })
const arc = (from: { x: number; y: number }, to: { x: number; y: number }, center: { x: number; y: number }, clockwise: boolean): CutAction =>
  ({ kind: 'cut', points: [from, to], curve: { type: 'arc', center, clockwise } })

describe('emitIncrementalMoves', () => {
  it('writes lines with four decimals and trailing zeros', () => {
    assert.deepEqual(run([line({ x: -60.97914, y: 129.8088 })]), ['G01 X-60.9791 Y129.8088'])
  })

  it('writes arcs with the incremental center from the arc start', () => {
    const ccw = arc({ x: 10, y: 0 }, { x: 0, y: 10 }, { x: 0, y: 0 }, false)
    const cw = arc({ x: 10, y: 0 }, { x: 0, y: -10 }, { x: 0, y: 0 }, true)
    assert.deepEqual(run([ccw]), ['G03 X0.0000 Y10.0000 I-10.0000 J0.0000'])
    assert.deepEqual(run([cw]), ['G02 X0.0000 Y-10.0000 I-10.0000 J0.0000'])
  })

  it('writes a full circle as one arc whose end equals its start, in its own direction', () => {
    const start = { x: 5, y: 0 }
    assert.deepEqual(run([arc(start, start, { x: 0, y: 0 }, false)]), ['G03 X5.0000 Y0.0000 I-5.0000 J0.0000'])
    assert.deepEqual(run([arc(start, start, { x: 0, y: 0 }, true)]), ['G02 X5.0000 Y0.0000 I-5.0000 J0.0000'])
  })

  it('writes an arc of 2 degrees or less as a line', () => {
    const r = 100
    const rad = (1.5 * Math.PI) / 180
    const to = { x: r * Math.cos(rad), y: r * Math.sin(rad) }
    assert.deepEqual(run([arc({ x: r, y: 0 }, to, { x: 0, y: 0 }, false)]), [`G01 X${to.x.toFixed(4)} Y${to.y.toFixed(4)}`])
  })

  it('never writes a negative zero, a feed word or anything for a pierce', () => {
    const pierce: CutAction = { kind: 'pierce', points: [{ x: 0, y: 0 }] }
    const out = run([pierce, line({ x: -0.00001, y: 0 }, { x: 0, y: 0 })])
    assert.deepEqual(out, ['G01 X0.0000 Y0.0000'])
    assert.ok(!out.join(' ').includes('F'))
  })

  it('maps points and the arc center through the frame', () => {
    const shift = (p: { x: number; y: number }) => ({ x: p.x - 100, y: p.y })
    const out = run([arc({ x: 110, y: 0 }, { x: 100, y: 10 }, { x: 100, y: 0 }, false)], shift)
    assert.deepEqual(out, ['G03 X0.0000 Y10.0000 I-10.0000 J0.0000'])
  })

  it('writes every point of a polyline after its first', () => {
    const out = run([{ kind: 'cut', points: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }] }])
    assert.deepEqual(out, ['G01 X1.0000 Y0.0000', 'G01 X1.0000 Y1.0000'])
  })
})
