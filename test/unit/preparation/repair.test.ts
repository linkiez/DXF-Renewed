import assert from 'node:assert'
import {
  closeGap,
  gapDistance,
  hasSelfIntersection,
  normalizeOrientation,
  signedArea,
} from '../../../src/nesting/pro/partPrep/repair'
import type { SourceRef } from '../../../src/nesting/pro/types'

const source: SourceRef = { handle: 'H1', layer: '0', entityType: 'LWPOLYLINE' }

describe('repair', () => {
  it('closes a gap within tolerance', () => {
    const open: [number, number][] = [[0, 0], [10, 0], [10, 10], [0, 10], [0.05, 0.05]]
    const result = closeGap(open, 0.1, source)
    assert.equal(result.repairs.length, 1)
    assert.equal(result.repairs[0].kind, 'gap-close')
    assert.equal(gapDistance(result.vertices), 0)
  })

  it('leaves a gap larger than tolerance untouched', () => {
    const open: [number, number][] = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 5]]
    const result = closeGap(open, 0.1, source)
    assert.equal(result.repairs.length, 0)
    assert.ok(result.gap > 0.1)
  })

  it('normalizes winding without moving vertices', () => {
    const cw: [number, number][] = [[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]
    assert.ok(signedArea(cw) < 0)
    const result = normalizeOrientation(cw, source)
    assert.equal(result.repairs.length, 1)
    assert.ok(signedArea(result.vertices) > 0)
    assert.equal(result.vertices.length, cw.length)
  })

  it('detects real self-intersections only', () => {
    const bowtie: [number, number][] = [[0, 0], [10, 10], [10, 0], [0, 10], [0, 0]]
    assert.equal(hasSelfIntersection(bowtie), true)
    assert.equal(hasSelfIntersection([[0, 0], [10, 0], [10, 5], [0, 0]]), false)
  })
})
