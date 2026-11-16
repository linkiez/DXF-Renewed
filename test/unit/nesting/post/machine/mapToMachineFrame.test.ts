import { strict as assert } from 'node:assert'
import { mapToMachineFrame } from '../../../../../src/nesting/post/machine/mapToMachineFrame'
import type { MachineFrame } from '../../../../../src/nesting/post/machine/types'

const sheet = { width: 3000, height: 1500 }
const frame = (rotationDegrees: MachineFrame['rotationDegrees'], origin: MachineFrame['origin']): MachineFrame => ({ rotationDegrees, origin })
const map = (x: number, y: number, f: MachineFrame) => mapToMachineFrame({ x, y }, sheet, f)

describe('mapToMachineFrame', () => {
  it('rotates about the bottom-left and keeps the result in the first quadrant', () => {
    assert.deepEqual(map(100, 40, frame(0, 'bottom-left')), { x: 100, y: 40 })
    assert.deepEqual(map(100, 40, frame(90, 'bottom-left')), { x: 1460, y: 100 })
    assert.deepEqual(map(100, 40, frame(180, 'bottom-left')), { x: 2900, y: 1460 })
    assert.deepEqual(map(100, 40, frame(270, 'bottom-left')), { x: 40, y: 2900 })
  })

  it('translates the zero to each table corner', () => {
    assert.deepEqual(map(100, 40, frame(0, 'bottom-right')), { x: -2900, y: 40 })
    assert.deepEqual(map(100, 40, frame(0, 'top-left')), { x: 100, y: -1460 })
    assert.deepEqual(map(100, 40, frame(0, 'top-right')), { x: -2900, y: -1460 })
    assert.deepEqual(map(100, 40, frame(90, 'bottom-right')), { x: 1460 - 1500, y: 100 })
    assert.deepEqual(map(100, 40, frame(90, 'top-left')), { x: 1460, y: 100 - 3000 })
  })

  it('reproduces the Talvi frame (sheet 1500 x 3000, rotation 0, bottom-right)', () => {
    const talvi = frame(0, 'bottom-right')
    const s = { width: 1500, height: 3000 }
    assert.deepEqual(mapToMachineFrame({ x: 0, y: 0 }, s, talvi), { x: -1500, y: 0 })
    assert.deepEqual(mapToMachineFrame({ x: 1500, y: 3000 }, s, talvi), { x: 0, y: 3000 })
    assert.deepEqual(mapToMachineFrame({ x: 100, y: 100 }, s, talvi), { x: -1400, y: 100 })
  })

  it('does not mutate the input and rejects non-finite input', () => {
    const point = Object.freeze({ x: 1, y: 2 })
    mapToMachineFrame(point, sheet, frame(90, 'top-right'))
    assert.deepEqual(point, { x: 1, y: 2 })
    assert.throws(() => mapToMachineFrame({ x: Number.NaN, y: 0 }, sheet, frame(0, 'bottom-left')), RangeError)
  })
})
