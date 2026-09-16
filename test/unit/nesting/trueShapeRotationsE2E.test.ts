/**
 * T027 — FR-004: rotation only, never scale. A grain-locked part may only use orientations
 * aligned with the declared grain; without a grainAngle it is reported unplaced rather than
 * taking an arbitrary orientation.
 */
import { firstValueFrom } from 'rxjs'
import { expect } from 'expect'
import { nestTrueShape } from '../../../src/nesting'
import type { PartRequest, StockItem } from '../../../src/nesting'
import { shapeFrom } from '../../resources/nest-fixtures/trueShapeBenchmark'

describe('trueShape/rotações + grão (FR-004)', () => {
  const stock: StockItem[] = [{ id: 's1', kind: 'sheet', width: 200, height: 200 }]
  const shape = shapeFrom('g1', [
    { x: 0, y: 0 },
    { x: 40, y: 0 },
    { x: 40, y: 25 },
    { x: 0, y: 25 },
    { x: 0, y: 0 },
  ])

  it('grainLocked + grainAngle 0 only uses orientations aligned with the grain', async () => {
    const parts: PartRequest[] = [{ shape, quantity: 2, grainLocked: true, grainAngle: 0 }]
    const r = await firstValueFrom(nestTrueShape({ stock, parts, edgeClearance: 2, partToPartClearance: 2, seed: 7 }))
    expect(r.unplaced).toHaveLength(0)
    expect(r.placements).toHaveLength(2)
    for (const p of r.placements) expect([0, 180]).toContain(p.rotation)
  })

  it('grainLocked without grainAngle is reported unplaced, never an arbitrary orientation', async () => {
    const parts: PartRequest[] = [{ shape, quantity: 1, grainLocked: true }]
    const r = await firstValueFrom(nestTrueShape({ stock, parts, edgeClearance: 2, partToPartClearance: 2, seed: 7 }))
    expect(r.placements).toHaveLength(0)
    expect(r.unplaced).toHaveLength(1)
  })

  it('never scales: the placed bounding box matches a pure rotation of the source shape', async () => {
    const parts: PartRequest[] = [{ shape, quantity: 1 }]
    const r = await firstValueFrom(nestTrueShape({ stock, parts, edgeClearance: 2, partToPartClearance: 2, seed: 7 }))
    const p = r.placements[0]
    const area = Math.abs(
      (p.bbox.width * p.bbox.height) - (shape.bbox.width * shape.bbox.height),
    )
    expect(p.bbox.width * p.bbox.height).toBeCloseTo(shape.bbox.width * shape.bbox.height, 6)
    expect(area).toBeLessThan(1e-6)
  })
})
