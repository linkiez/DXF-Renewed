import type { BBox, Classification } from '../types'
import { signedArea } from './repair'

export function bboxOf(vertices: [number, number][]): BBox {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [x, y] of vertices) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  if (minX === Infinity) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  return { minX, minY, maxX, maxY }
}

/** Ray casting; points on the boundary are considered inside. */
export function pointInRing(point: [number, number], vertices: [number, number][]): boolean {
  let inside = false
  const n = vertices.length
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const vi = vertices[i]
    const vj = vertices[j]
    const intersects =
      vi[1] > point[1] !== vj[1] > point[1] &&
      point[0] < ((vj[0] - vi[0]) * (point[1] - vi[1])) / (vj[1] - vi[1]) + vi[0]
    if (intersects) inside = !inside
  }
  return inside
}

/**
 * Interior sample point near the ring boundary (not the raw centroid, which falls inside
 * nested children and would inflate the depth). Works for CCW and CW winding (FR-002).
 */
export function samplePoint(vertices: [number, number][]): [number, number] {
  const ccw = signedArea(vertices) > 0
  for (let i = 0; i < vertices.length - 1; i++) {
    const a = vertices[i]
    const b = vertices[i + 1]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy)
    if (len < 1e-9) continue
    const nudge = Math.min(len, 1) * 1e-3
    const nx = ((ccw ? -dy : dy) / len) * nudge
    const ny = ((ccw ? dx : -dx) / len) * nudge
    return [(a[0] + b[0]) / 2 + nx, (a[1] + b[1]) / 2 + ny]
  }
  let cx = 0
  let cy = 0
  for (const [x, y] of vertices) {
    cx += x
    cy += y
  }
  return [cx / vertices.length, cy / vertices.length]
}

export function classificationFor(depth: number): Classification {
  if (depth === 0) return 'outer'
  return depth % 2 === 1 ? 'hole' : 'island'
}

/**
 * Even-odd containment depth (FR-001, FR-011): number of other rings containing this ring.
 * Depth 0 => outer, odd => hole, even >= 2 => island; unlimited depth, never flattened.
 */
export function classify(rings: [number, number][][]): number[] {
  const boxes = rings.map(bboxOf)
  const samples = rings.map(samplePoint)
  return rings.map((_, i) => {
    const sample = samples[i]
    let depth = 0
    for (let j = 0; j < rings.length; j++) {
      if (i === j) continue
      const box = boxes[j]
      if (
        sample[0] < box.minX ||
        sample[0] > box.maxX ||
        sample[1] < box.minY ||
        sample[1] > box.maxY
      ) {
        continue
      }
      if (pointInRing(sample, rings[j])) depth++
    }
    return depth
  })
}
