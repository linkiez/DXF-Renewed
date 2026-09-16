import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { nestTrueShape } from '../../../src/nesting/trueShape'
import { shapeFrom } from '../../resources/nest-fixtures/trueShapeBenchmark'

describe('Observable nesting composition', () => {
  it('passes the first stage result into a second RxJS stage', async () => {
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
      }).pipe(
        map((response) => response.placements.length),
        switchMap((placementCount) =>
          nestTrueShape({
            stock: [{ id: 'sheet', kind: 'sheet', width: 100, height: 100 }],
            parts: [{ shape, quantity: placementCount }],
            edgeClearance: 1,
            partToPartClearance: 1,
            seed: 1,
          }),
        ),
      ),
    )

    assert.equal(result.placements.length, 1)
  })
})
