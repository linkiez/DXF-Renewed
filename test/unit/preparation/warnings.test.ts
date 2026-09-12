import assert from 'node:assert'
import { prepareParts } from '../../../src/nesting/pro/partPrep/index'

function square(x: number, y: number, size: number, handle: string) {
  return {
    type: 'LWPOLYLINE',
    handle,
    layer: '0',
    closed: true,
    vertices: [
      { x, y },
      { x: x + size, y },
      { x: x + size, y: y + size },
      { x, y: y + size },
    ],
  }
}

function open(handle: string, last: { x: number; y: number }) {
  return {
    type: 'LWPOLYLINE',
    handle,
    layer: '0',
    closed: false,
    vertices: [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      last,
    ],
  }
}

describe('warnings and rejections', () => {
  it('emits MIN_AREA when a part is smaller than minArea', () => {
    const dxf = { entities: [square(0, 0, 2, 'A1')] }
    const result = prepareParts(dxf, { tolerance: 0.01, cutWidthAllowance: 0, minArea: 100 })
    assert.equal(result.parts.length, 1)
    assert.ok(result.parts[0].warnings.some((w) => w.code === 'MIN_AREA'))
  })

  it('emits MIN_FEATURE when a part is thinner than minFeatureSize', () => {
    const dxf = { entities: [square(0, 0, 3, 'A2')] }
    const result = prepareParts(dxf, {
      tolerance: 0.01,
      cutWidthAllowance: 0,
      minFeatureSize: 10,
    })
    assert.ok(result.parts[0].warnings.some((w) => w.code === 'MIN_FEATURE'))
  })

  it('emits GAP_CLOSED for a repairable gap', () => {
    const dxf = { entities: [open('A3', { x: 0.05, y: 0.05 })] }
    const result = prepareParts(dxf, { tolerance: 0.1, cutWidthAllowance: 0 })
    assert.equal(result.parts.length, 1)
    assert.ok(result.parts[0].warnings.some((w) => w.code === 'GAP_CLOSED'))
  })

  it('rejects an unrepairable open boundary', () => {
    const dxf = { entities: [open('A4', { x: 0, y: 5 })] }
    const result = prepareParts(dxf, { tolerance: 0.1, cutWidthAllowance: 0 })
    assert.equal(result.parts.length, 0)
    assert.ok(result.issues.some((i) => i.code === 'GAP_TOO_LARGE' || i.code === 'OPEN_BOUNDARY'))
  })
})
