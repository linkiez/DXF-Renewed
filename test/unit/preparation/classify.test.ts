import assert from 'node:assert'
import {
  classify,
  classificationFor,
  pointInRing,
  samplePoint,
} from '../../../src/nesting/pro/partPrep/classify'
import { rect, ring } from './helpers'

describe('containment classification', () => {
  it('maps depth 0/1/2/3 to outer/hole/island/hole', () => {
    const depths = classify([ring(0, 0, 40), ring(0, 0, 30), ring(0, 0, 20), ring(0, 0, 10)])
    assert.deepStrictEqual(depths, [0, 1, 2, 3])
    assert.deepStrictEqual(depths.map(classificationFor), ['outer', 'hole', 'island', 'hole'])
  })

  it('detects points inside and outside a ring', () => {
    assert.equal(pointInRing([5, 5], rect(0, 0, 10, 10)), true)
    assert.equal(pointInRing([50, 50], rect(0, 0, 10, 10)), false)
  })

  it('returns an interior sample point, not the raw centroid', () => {
    assert.equal(pointInRing(samplePoint(rect(0, 0, 10, 10)), rect(0, 0, 10, 10)), true)
  })
})
