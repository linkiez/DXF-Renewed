/**
 * T007 — FR-001: caller-weighted objective.
 *
 * Invalid weights (negative, NaN, non-finite, all zero) are rejected with an explicit reason;
 * valid weights normalize to 1 within EPSILON; an omitted objective preserves feature-002 behavior.
 */

import { firstValueFrom } from 'rxjs'
import { expect } from 'expect'
import { nestTrueShape, normalizeObjective } from '../../../../src/nesting'
import type { OptimizationObjective, Point2D } from '../../../../src/nesting'
import { DEFAULT_OBJECTIVE_WEIGHTS, EPSILON } from '../../../../src/nesting/config'
import { shapeFrom } from '../../../resources/nest-fixtures/trueShapeBenchmark'

function square(id: string, size: number) {
  return shapeFrom(id, [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size },
    { x: 0, y: size },
    { x: 0, y: 0 },
  ] as Point2D[])
}

const stock = [{ id: 's1', kind: 'sheet' as const, width: 100, height: 100 }]
const parts = [{ shape: square('a', 20), quantity: 3 }]
const invalid: OptimizationObjective[] = [
  { materialUse: -1, travel: 0, sheetCount: 0, remnant: 0 },
  { materialUse: Number.NaN, travel: 0, sheetCount: 0, remnant: 0 },
  { materialUse: 1, travel: Number.POSITIVE_INFINITY, sheetCount: 0, remnant: 0 },
  { materialUse: 0, travel: 0, sheetCount: 0, remnant: 0 },
]

describe('optimization/objective — weights', () => {
  it('rejects every invalid objective with a non-empty reason', async () => {
    for (const weights of invalid) {
      const result = normalizeObjective(weights)
      expect(result.ok).toBe(false)
      if (result.ok) continue
      expect(typeof result.reason).toBe('string')
      expect(result.reason.length).toBeGreaterThan(0)
    }
  })

  it('normalizes valid weights to sum 1 within EPSILON', async () => {
    const result = normalizeObjective({
      materialUse: 2,
      travel: 1,
      sheetCount: 1,
      remnant: 0,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const { normalized } = result
    const sum =
      normalized.materialUse +
      normalized.travel +
      normalized.sheetCount +
      normalized.remnant
    expect(Math.abs(sum - 1)).toBeLessThanOrEqual(EPSILON)
    expect(normalized.materialUse).toBeCloseTo(0.5, 10)
    expect(normalized.travel).toBeCloseTo(0.25, 10)
    expect(normalized.sheetCount).toBeCloseTo(0.25, 10)
    expect(normalized.remnant).toBe(0)
  })

  it('omitted objective resolves to the material-use default (feature-002 behavior)', async () => {
    const result = normalizeObjective(undefined)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.normalized).toEqual(DEFAULT_OBJECTIVE_WEIGHTS)

    const omitted = await firstValueFrom(nestTrueShape({
      stock,
      parts,
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 5,
    }))
    const explicit = await firstValueFrom(nestTrueShape({
      stock,
      parts,
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 5,
      objective: DEFAULT_OBJECTIVE_WEIGHTS,
    }))
    expect(JSON.stringify(omitted.placements)).toBe(
      JSON.stringify(explicit.placements),
    )
    expect(omitted.objective).toBeUndefined()
    expect(explicit.objective).toEqual(DEFAULT_OBJECTIVE_WEIGHTS)
  })

  it('rejects an invalid objective through nestTrueShape without throwing', async () => {
    const response = await firstValueFrom(nestTrueShape({
      stock,
      parts,
      edgeClearance: 2,
      partToPartClearance: 2,
      seed: 5,
      objective: invalid[0],
    }))
    expect(response.placements).toHaveLength(0)
    expect(response.unplaced).toHaveLength(1)
    expect(response.unplaced[0].reason).toContain('invalid objective')
  })
})
