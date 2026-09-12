/**
 * True-Shape Nesting — Candidate Placement Generation
 *
 * Deterministic bottom-left-fill anchors. Anchors are the bbox-min coordinates an instance can
 * take: the stock clearance line, plus the far edge of every already-placed instance pushed out
 * by the part-to-part clearance. Stable ordering keeps FR-007 reproducible.
 *
 * Constitution II (Reuse Before Rewrite): the rectangle packers in `../binPacking` pack axis-aligned
 * rectangles, they do not compute true-shape anchor positions; no existing code computes this
 * required property, so this additive anchor generator is the recorded rationale for the new
 * algorithm, and it reuses `computeBoundingBox` and the shared `EPSILON`.
 */

import type { NestableShape, Point2D } from '../types'
import { computeBoundingBox } from '../polygonUtils'
import { EPSILON } from '../config'

/** Sorted, de-duplicated ascending anchor list. */
function uniqueSorted(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b)
  const out: number[] = []
  for (const v of sorted) {
    if (out.length === 0 || Math.abs(v - out[out.length - 1]) > EPSILON) out.push(v)
  }
  return out
}

/**
 * Bottom-left-fill anchor coordinates for the given placed instances, plus the clearance-inset
 * corner of every stock hole. The hole anchor lets a small part be hosted inside a hole as long
 * as it still keeps `edgeClearance` from the hole contour (FR-001/FR-002 edge case).
 */
export function candidateAnchors(
  placed: Point2D[][],
  edgeClearance: number,
  partToPartClearance: number,
  holes: NestableShape[] = [],
): { xs: number[]; ys: number[] } {
  const xs = [edgeClearance]
  const ys = [edgeClearance]

  for (const hole of holes) {
    xs.push(hole.bbox.minX + edgeClearance)
    ys.push(hole.bbox.minY + edgeClearance)
  }

  for (const vertices of placed) {
    const bbox = computeBoundingBox(vertices)
    xs.push(bbox.maxX + partToPartClearance)
    ys.push(bbox.maxY + partToPartClearance)
  }

  return { xs: uniqueSorted(xs), ys: uniqueSorted(ys) }
}

/**
 * Candidate anchor pairs in the deterministic visit order: lowest y first, then lowest x.
 */
export function candidatePositions(
  placed: Point2D[][],
  edgeClearance: number,
  partToPartClearance: number,
  holes: NestableShape[] = [],
): Point2D[] {
  const { xs, ys } = candidateAnchors(
    placed,
    edgeClearance,
    partToPartClearance,
    holes,
  )
  const positions: Point2D[] = []
  for (const y of ys) {
    for (const x of xs) positions.push({ x, y })
  }
  return positions
}
