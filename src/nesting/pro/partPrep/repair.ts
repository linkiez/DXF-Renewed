import type { Repair, SourceRef } from '../types'

const EPS = 1e-9

export function openRing(vertices: [number, number][]): [number, number][] {
  const ring = vertices.slice()
  if (ring.length > 1) {
    const first = ring[0]
    const last = ring[ring.length - 1]
    if (Math.abs(first[0] - last[0]) <= EPS && Math.abs(first[1] - last[1]) <= EPS) {
      ring.pop()
    }
  }
  return ring
}

export function signedArea(vertices: [number, number][]): number {
  const ring = openRing(vertices)
  let sum = 0
  for (let i = 0; i < ring.length; i++) {
    const j = (i + 1) % ring.length
    sum += ring[i][0] * ring[j][1] - ring[j][0] * ring[i][1]
  }
  return sum / 2
}

export function gapDistance(vertices: [number, number][]): number {
  if (vertices.length < 2) return 0
  const first = vertices[0]
  const last = vertices[vertices.length - 1]
  return Math.hypot(first[0] - last[0], first[1] - last[1])
}

/** Close a gap <= tolerance by snapping the last vertex onto the first (FR-004). */
export function closeGap(
  vertices: [number, number][],
  tolerance: number,
  source: SourceRef,
): { vertices: [number, number][]; repairs: Repair[]; gap: number } {
  const ring = vertices.slice()
  const gap = gapDistance(ring)
  const repairs: Repair[] = []
  if (gap > EPS && gap <= tolerance) {
    ring[ring.length - 1] = [ring[0][0], ring[0][1]]
    repairs.push({ kind: 'gap-close', source, detail: `closed gap of ${gap}` })
  }
  return { vertices: ring, repairs, gap }
}

/** Normalize winding to CCW without moving vertices (FR-004). */
export function normalizeOrientation(
  vertices: [number, number][],
  source: SourceRef,
): { vertices: [number, number][]; repairs: Repair[] } {
  if (signedArea(vertices) < 0) {
    return {
      vertices: vertices.slice().reverse(),
      repairs: [{ kind: 'orientation', source, detail: 'normalized winding to CCW' }],
    }
  }
  return { vertices: vertices.slice(), repairs: [] }
}

function cross(a: [number, number], b: [number, number], c: [number, number]): number {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
}

function segmentsCross(
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  p4: [number, number],
): boolean {
  const d1 = cross(p3, p4, p1)
  const d2 = cross(p3, p4, p2)
  const d3 = cross(p1, p2, p3)
  const d4 = cross(p1, p2, p4)
  return (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  )
}

/**
 * Detect real self-intersections; adjacent segments sharing an endpoint are excluded (FR-010).
 * ponytail: O(n^2) over vertices. Fine for the current few-hundred-point rings; replace with a
 * sweep-line / uniform-grid broad phase if contours grow into the thousands of vertices.
 */
export function hasSelfIntersection(vertices: [number, number][]): boolean {
  const ring = openRing(vertices)
  const n = ring.length
  if (n < 4) return false
  for (let i = 0; i < n; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % n]
    for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue
      const c = ring[j]
      const d = ring[(j + 1) % n]
      if (segmentsCross(a, b, c, d)) return true
    }
  }
  return false
}
