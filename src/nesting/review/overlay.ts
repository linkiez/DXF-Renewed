import { computeBoundingBox } from '../polygonUtils'
import type { PlacementVerdict } from '../edit/types'
import type { Point2D } from '../types'
import type { ReviewOverlay } from './types'

/**
 * Builds the overlay of a candidate position: its outline, whether it is valid and one text mark
 * per violation, so the refusal is readable without colour.
 *
 * @param outline - Outline of the candidate part after the proposed edit.
 * @param verdict - Verdict of the candidate position.
 * @returns An overlay with the ghost.
 * @example
 * ```typescript
 * renderer.overlay?.(ghostOverlay(outline, verdict))
 * ```
 */
export function ghostOverlay(outline: readonly Point2D[], verdict: PlacementVerdict): ReviewOverlay {
  const box = computeBoundingBox([...outline])
  return {
    ghost: {
      outline,
      valid: verdict.valid,
      anchor: { x: (box.minX + box.maxX) / 2, y: (box.minY + box.maxY) / 2 },
      marks: verdict.violations.map((violation) => ({ code: violation.code, label: violation.message })),
    },
  }
}
