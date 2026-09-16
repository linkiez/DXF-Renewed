import assert from 'node:assert'
import { classify, classificationFor } from '../../../src/nesting/pro/partPrep/classify'
import { ring } from './helpers'

describe('deep nesting', () => {
  it('classifies 4 levels as outer/hole/island/hole', async () => {
    const depths = classify([ring(0, 0, 40), ring(0, 0, 30), ring(0, 0, 20), ring(0, 0, 10)])
    assert.deepStrictEqual(depths, [0, 1, 2, 3])
    assert.deepStrictEqual(depths.map(classificationFor), ['outer', 'hole', 'island', 'hole'])
  })

  it('never flattens arbitrary depth', async () => {
    const depths = classify([
      ring(0, 0, 50),
      ring(0, 0, 40),
      ring(0, 0, 30),
      ring(0, 0, 20),
      ring(0, 0, 10),
    ])
    assert.deepStrictEqual(depths, [0, 1, 2, 3, 4])
    assert.deepStrictEqual(depths.map(classificationFor), [
      'outer',
      'hole',
      'island',
      'hole',
      'island',
    ])
  })
})
