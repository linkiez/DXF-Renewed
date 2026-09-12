/**
 * True-Shape Nesting — Separation
 *
 * Pairwise separation predicate (FR-002): no two placed instances may overlap, and their
 * boundaries must stay at least `partToPartClearance` apart. Bounding boxes are the broad
 * phase; SAT plus contour distance are the precise test.
 */

import type { Point2D } from '../types'
import { EPSILON } from '../config'
import { satCollision, bboxesOverlapWithMargin } from '../collision'
import { computeBoundingBox } from '../polygonUtils'
import { polygonDistance } from './bounds'

/** True when two instances respect `clearance` — no overlap and no closer than the clearance. */
export function isSeparated(
  a: Point2D[],
  b: Point2D[],
  clearance: number,
): boolean {
  const bboxA = computeBoundingBox(a)
  const bboxB = computeBoundingBox(b)

  if (!bboxesOverlapWithMargin(bboxA, bboxB, clearance)) return true
  if (satCollision(a, b, 0)) return false

  return polygonDistance(a, b) >= clearance - EPSILON
}

/** True when `candidate` respects `clearance` against every already-placed instance. */
export function isSeparatedFromAll(
  candidate: Point2D[],
  placed: Point2D[][],
  clearance: number,
): boolean {
  for (const other of placed) {
    if (!isSeparated(candidate, other, clearance)) return false
  }
  return true
}
