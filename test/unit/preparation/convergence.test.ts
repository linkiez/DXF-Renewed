import assert from 'node:assert'
import { prepareParts } from '../../../src/nesting/pro/partPrep/index'
import { applyCutWidth } from '../../../src/nesting/pro/partPrep/offset'
import { hasSelfIntersection } from '../../../src/nesting/pro/partPrep/repair'
import { pointInRing, samplePoint } from '../../../src/nesting/pro/partPrep/classify'
import { fixture, rect, ring } from './helpers'

function area(vertices: [number, number][]): number {
  let sum = 0
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length
    sum += vertices[i][0] * vertices[j][1] - vertices[j][0] * vertices[i][1]
  }
  return Math.abs(sum) / 2
}

describe('convergence fixes', () => {
  it('does not invert a hole when the allowance exceeds its radius (T027)', async () => {
    const base = ring(0, 0, 1, 180)
    const result = applyCutWidth(base, 10, 'hole')
    assert.equal(hasSelfIntersection(result), false)
    assert.ok(area(result) > 0)
    assert.ok(area(result) <= area(base) * 1.001, `area ${area(result)} vs ${area(base)}`)
  })

  it('keeps the sample point inside CW rings (T030)', async () => {
    const cw = rect(0, 0, 10, 10).slice().reverse() as [number, number][]
    assert.equal(pointInRing(samplePoint(cw), cw), true)
  })

  it('gives every part a unique id even for repeated block references (T028)', async () => {
    const result = await prepareParts(fixture('arrayed-holes.dxf'), {
      tolerance: 0.01,
      cutWidthAllowance: 0,
    })
    const ids = result.parts.map((part) => part.id)
    assert.equal(new Set(ids).size, ids.length)
  })

  it('rejects an inherently open primitive as OPEN_BOUNDARY (T029)', async () => {
    const dxf = {
      entities: [
        { type: 'ARC', handle: 'A9', layer: '0', x: 0, y: 0, r: 10, startAngle: 0, endAngle: 1 },
      ],
    }
    const result = await prepareParts(dxf, { tolerance: 0.1, cutWidthAllowance: 0 })
    assert.equal(result.parts.length, 0)
    assert.ok(result.issues.some((issue) => issue.code === 'OPEN_BOUNDARY'))
  })
})
