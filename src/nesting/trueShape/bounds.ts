/**
 * True-Shape Nesting — Bounds
 *
 * Containment predicate (FR-001): an instance must sit entirely inside the stock item and keep
 * at least `edgeClearance` from every stock boundary — the outer sheet edge and each hole
 * contour. Shared geometry helper `polygonDistance` lives here.
 */

import type { Point2D, StockSheet } from '../types'
import { EPSILON } from '../config'

/** Distance from a point to the segment ab. */
function pointSegmentDistance(p: Point2D, a: Point2D, b: Point2D): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq < EPSILON) return Math.hypot(p.x - a.x, p.y - a.y)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq
  t = t < 0 ? 0 : t > 1 ? 1 : t
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

function segmentsIntersect(a: Point2D, b: Point2D, c: Point2D, d: Point2D): boolean {
  const cross = (o: Point2D, p: Point2D, q: Point2D) =>
    (p.x - o.x) * (q.y - o.y) - (p.y - o.y) * (q.x - o.x)
  const d1 = cross(c, d, a)
  const d2 = cross(c, d, b)
  const d3 = cross(a, b, c)
  const d4 = cross(a, b, d)
  return (
    ((d1 > EPSILON && d2 < -EPSILON) || (d1 < -EPSILON && d2 > EPSILON)) &&
    ((d3 > EPSILON && d4 < -EPSILON) || (d3 < -EPSILON && d4 > EPSILON))
  )
}

/**
 * Minimum distance between the boundaries of two polygons; 0 when the boundaries touch or cross.
 * Containment is not a boundary crossing: a part nested strictly inside a hole keeps a positive
 * boundary distance, which is what lets a hole host a compatible smaller part (FR-002).
 */
export function polygonDistance(a: Point2D[], b: Point2D[]): number {
  for (let i = 0; i < a.length; i++) {
    const a1 = a[i]
    const a2 = a[(i + 1) % a.length]
    for (let j = 0; j < b.length; j++) {
      if (segmentsIntersect(a1, a2, b[j], b[(j + 1) % b.length])) return 0
    }
  }

  let min = Infinity
  for (let i = 0; i < b.length; i++) {
    const s = b[i]
    const e = b[(i + 1) % b.length]
    for (const p of a) {
      const d = pointSegmentDistance(p, s, e)
      if (d < min) min = d
    }
  }
  for (let i = 0; i < a.length; i++) {
    const s = a[i]
    const e = a[(i + 1) % a.length]
    for (const p of b) {
      const d = pointSegmentDistance(p, s, e)
      if (d < min) min = d
    }
  }
  return min
}

/** True when every vertex keeps `edgeClearance` from the outer sheet rectangle. */
export function isInsideOuterBoundary(
  vertices: Point2D[],
  width: number,
  height: number,
  edgeClearance: number,
): boolean {
  for (const v of vertices) {
    if (v.x < edgeClearance - EPSILON) return false
    if (v.y < edgeClearance - EPSILON) return false
    if (v.x > width - edgeClearance + EPSILON) return false
    if (v.y > height - edgeClearance + EPSILON) return false
  }
  return true
}

/**
 * FR-001 containment: inside the outer boundary and clear of every hole contour by at least
 * `edgeClearance`. A part may sit inside a hole as long as both hold.
 */
export function isWithinBounds(
  vertices: Point2D[],
  stock: StockSheet,
  edgeClearance: number,
): boolean {
  if (!isInsideOuterBoundary(vertices, stock.width, stock.height, edgeClearance)) {
    return false
  }

  for (const hole of stock.holes ?? []) {
    if (polygonDistance(vertices, hole.vertices) < edgeClearance - EPSILON) {
      return false
    }
  }

  return true
}
