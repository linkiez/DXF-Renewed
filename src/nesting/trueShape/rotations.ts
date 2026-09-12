/**
 * True-Shape Nesting — Rotations
 *
 * FR-004: orientations come from the caller's permitted list (default
 * `DEFAULT_ALLOWED_ROTATIONS`). A grain-locked part is restricted to the subset aligned with its
 * declared `grainAngle` modulo 180°. Nothing here ever scales.
 */

import type { PartRequest } from '../types'
import { DEFAULT_ALLOWED_ROTATIONS, EPSILON } from '../config'

/** Smallest absolute difference between two angles, modulo 180°. */
function angleDistanceMod180(a: number, b: number): number {
  const diff = (((a - b) % 180) + 180) % 180
  return Math.min(diff, 180 - diff)
}

/**
 * Effective rotation list for a part.
 *
 * Returns `null` when the part is grain-locked without a declared `grainAngle`: that part must
 * be reported as unplaced rather than placed at an arbitrary orientation (FR-004).
 */
export function effectiveRotations(
  part: PartRequest,
  allowed: readonly number[] = DEFAULT_ALLOWED_ROTATIONS,
): number[] | null {
  if (!part.grainLocked) return [...allowed]
  if (part.grainAngle === undefined) return null

  const grain = part.grainAngle
  return allowed.filter((angle) => angleDistanceMod180(angle, grain) < EPSILON)
}

/** Canonical permitted list: caller value when supplied, otherwise the documented default. */
export function resolveAllowedRotations(
  allowed: number[] | undefined,
): number[] {
  return allowed && allowed.length > 0
    ? [...allowed]
    : [...DEFAULT_ALLOWED_ROTATIONS]
}
