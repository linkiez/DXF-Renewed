/**
 * Nesting — True-Shape Rotation and Grain Tests (T009, T010, FR-004)
 */

import { expect } from 'expect'
import {
  effectiveRotations,
  resolveAllowedRotations,
} from '../../../src/nesting/trueShape/rotations'
import { DEFAULT_ALLOWED_ROTATIONS } from '../../../src/nesting/config'
import type { NestableShape, PartRequest } from '../../../src/nesting/types'

function part(overrides: Partial<PartRequest> = {}): PartRequest {
  const shape = { id: 'p1', area: 10 } as NestableShape
  return { shape, quantity: 1, ...overrides }
}

describe('trueShape/rotations', () => {
  it('returns the caller list unchanged for a free part', async () => {
    expect(effectiveRotations(part(), [0, 45])).toEqual([0, 45])
  })

  it('defaults to the documented rotation list', async () => {
    expect(resolveAllowedRotations(undefined)).toEqual([
      ...DEFAULT_ALLOWED_ROTATIONS,
    ])
  })

  it('restricts a grain-locked part to grain-aligned angles modulo 180', async () => {
    expect(effectiveRotations(part({ grainLocked: true, grainAngle: 0 }))).toEqual([
      0, 180,
    ])
    expect(effectiveRotations(part({ grainLocked: true, grainAngle: 90 }))).toEqual([
      90, 270,
    ])
  })

  it('returns null for a grain-locked part with no declared grain angle', async () => {
    expect(effectiveRotations(part({ grainLocked: true }))).toBeNull()
  })
})
