/**
 * T028 — FR-001/FR-002: a hole contour is a hard boundary (edgeClearance applies to it), but it
 * may still host a compatible smaller part when both clearances hold.
 */
import { firstValueFrom } from 'rxjs'
import { expect } from 'expect'
import { nestTrueShape } from '../../../src/nesting'
import type { PartRequest, StockItem } from '../../../src/nesting'
import { shapeFrom } from '../../resources/nest-fixtures/trueShapeBenchmark'

const closed = (pts: Array<[number, number]>) => pts.map(([x, y]) => ({ x, y }))

describe('trueShape/holes', () => {
  const hole = shapeFrom('h1', closed([[20, 20], [80, 20], [80, 80], [20, 80], [20, 20]]))
  const sheet: StockItem = { id: 's1', kind: 'sheet', width: 100, height: 100, holes: [hole] }

  it('hosts a part inside the hole when it cannot fit outside (FR-001/FR-002)', async () => {
    const part = shapeFrom('p1', closed([[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]]))
    const parts: PartRequest[] = [{ shape: part, quantity: 1 }]
    const r = await firstValueFrom(nestTrueShape({ stock: [sheet], parts, edgeClearance: 2, partToPartClearance: 2, seed: 1 }))
    expect(r.unplaced).toHaveLength(0)
    expect(r.placements).toHaveLength(1)
    const p = r.placements[0]
    expect(p.x).toBeGreaterThanOrEqual(22)
    expect(p.x).toBeLessThanOrEqual(62)
    expect(p.y).toBeGreaterThanOrEqual(22)
    expect(p.y).toBeLessThanOrEqual(62)
  })

  it('reports a part larger than the hole and the frame as unplaced', async () => {
    const big = shapeFrom('p2', closed([[0, 0], [70, 0], [70, 70], [0, 70], [0, 0]]))
    const parts: PartRequest[] = [{ shape: big, quantity: 1 }]
    const r = await firstValueFrom(nestTrueShape({ stock: [sheet], parts, edgeClearance: 2, partToPartClearance: 2, seed: 1 }))
    expect(r.placements).toHaveLength(0)
    expect(r.unplaced).toHaveLength(1)
  })
})
