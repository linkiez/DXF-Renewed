import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import { nestTrueShape } from '../../../../src/nesting/trueShape'
import { shapeFrom } from '../../../resources/nest-fixtures/trueShapeBenchmark'

describe('nesting Observable explicit outcomes', () => {
  it('reports invalid input as an emitted response rather than a silent drop', async () => {
    const response = await firstValueFrom(
      nestTrueShape({
        stock: [],
        parts: [
          {
            shape: shapeFrom('part', [
              { x: 0, y: 0 },
              { x: 10, y: 0 },
              { x: 10, y: 10 },
              { x: 0, y: 10 },
              { x: 0, y: 0 },
            ]),
            quantity: 1,
          },
        ],
        edgeClearance: -1,
        partToPartClearance: 1,
        seed: 42,
      }),
    )

    assert.equal(response.placements.length, 0)
    assert.match(response.unplaced[0]?.reason ?? '', /stock/)
  })
})
