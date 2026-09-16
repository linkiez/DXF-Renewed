import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import { nestTrueShape } from '../../../../src/nesting/trueShape'
import { shapeFrom } from '../../../resources/nest-fixtures/trueShapeBenchmark'

describe('true-shape Observable surface', () => {
  it('emits an explicit result for a valid request', async () => {
    const shape = shapeFrom('square', [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 },
    ])

    const result = await firstValueFrom(
      nestTrueShape({
        stock: [{ id: 'sheet', kind: 'sheet', width: 100, height: 100 }],
        parts: [{ shape, quantity: 1 }],
        edgeClearance: 1,
        partToPartClearance: 1,
        seed: 1,
      }),
    )

    assert.equal(result.unplaced.length, 0)
    assert.equal(result.placements.length, 1)
  })
})
