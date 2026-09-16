/**
 * T020/T021 — SC-004 benchmark on the reference job (100 parts / 5 sheets).
 *
 * The CPU baseline must stay under 2 s. When no adapter is present the accelerated path falls back
 * to the CPU, so the 2× gate is recorded as not applicable rather than failed (never skipped
 * silently — the fallback reason is asserted).
 */

import { firstValueFrom } from 'rxjs'
import { expect } from 'expect'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { nestTrueShape, meetsAccelerationGate } from '../../../../src/nesting'
import type { Point2D, StockItem } from '../../../../src/nesting'
import { shapeFrom } from '../../../resources/nest-fixtures/trueShapeBenchmark'

interface FixturePart {
  id: string
  vertices: Point2D[]
  quantity: number
}

interface Fixture {
  seed: number
  edgeClearance: number
  partToPartClearance: number
  stock: StockItem[]
  parts: FixturePart[]
}

const fixture = JSON.parse(
  readFileSync(
    resolve('test/resources/nest-fixtures/reference-job-100x5.json'),
    'utf8',
  ),
) as Fixture

describe('optimization/sc004 — reference job (100 parts / 5 sheets)', () => {
  it('baseline stays under 2 s and places every part', async () => {
    const started = Date.now()
    const response = await firstValueFrom(nestTrueShape({
      stock: fixture.stock,
      parts: fixture.parts.map((p) => ({ shape: shapeFrom(p.id, p.vertices), quantity: p.quantity })),
      edgeClearance: fixture.edgeClearance,
      partToPartClearance: fixture.partToPartClearance,
      seed: fixture.seed,
      acceleration: false,
    }))
    const baselineMs = Date.now() - started

    expect(baselineMs).toBeLessThan(2000)
    expect(response.placements).toHaveLength(100)
    expect(response.unplaced).toHaveLength(0)
  })

  it('reaches the 2× gate when accelerated, otherwise records the fallback', async () => {
    const baselineStarted = Date.now()
    await firstValueFrom(nestTrueShape({
      stock: fixture.stock,
      parts: fixture.parts.map((p) => ({ shape: shapeFrom(p.id, p.vertices), quantity: p.quantity })),
      edgeClearance: fixture.edgeClearance,
      partToPartClearance: fixture.partToPartClearance,
      seed: fixture.seed,
      acceleration: false,
    }))
    const baselineMs = Date.now() - baselineStarted

    const acceleratedStarted = Date.now()
    const accelerated = await firstValueFrom(nestTrueShape({
      stock: fixture.stock,
      parts: fixture.parts.map((p) => ({ shape: shapeFrom(p.id, p.vertices), quantity: p.quantity })),
      edgeClearance: fixture.edgeClearance,
      partToPartClearance: fixture.partToPartClearance,
      seed: fixture.seed,
      acceleration: true,
    }))
    const acceleratedMs = Date.now() - acceleratedStarted

    if (accelerated.backend?.accelerated) {
      expect(meetsAccelerationGate(baselineMs, acceleratedMs)).toBe(true)
    } else {
      expect(typeof accelerated.backend?.fallbackReason).toBe('string')
      expect(accelerated.backend?.accelerated).toBe(false)
    }
    expect(accelerated.placements).toHaveLength(100)
  })
})
