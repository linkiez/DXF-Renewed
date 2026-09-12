import { offsetPolygon, polygonArea } from '../../../nest/geometry'
import { hasSelfIntersection } from './repair'
import type { Classification } from '../types'

const EPS = 1e-9

function close(vertices: [number, number][]): [number, number][] {
  const ring = vertices.slice()
  if (ring.length > 0) {
    const first = ring[0]
    const last = ring[ring.length - 1]
    if (first[0] !== last[0] || first[1] !== last[1]) ring.push([first[0], first[1]])
  }
  return ring
}

/**
 * Apply the total-kerf allowance as +/- allowance/2 away from the material (FR-005).
 */
export function applyCutWidth(
  vertices: [number, number][],
  cutWidthAllowance: number,
  classification: Classification,
): [number, number][] {
  const half = cutWidthAllowance / 2
  if (!half) return vertices

  const before = polygonArea(vertices)
  const outward = classification === 'outer'
  const plus = close(offsetPolygon(vertices, half))
  const minus = close(offsetPolygon(vertices, -half))

  // Naive offsets self-intersect on concave rings: prefer a clean candidate (FR-005).
  const candidates = [
    { ring: plus, area: polygonArea(plus), clean: !hasSelfIntersection(plus) },
    { ring: minus, area: polygonArea(minus), clean: !hasSelfIntersection(minus) },
  ]
  const preferClean = (pool: typeof candidates): typeof candidates => {
    const clean = pool.filter((candidate) => candidate.clean)
    return clean.length > 0 ? clean : pool
  }

  // `offsetPolygon` normals follow winding: pick by intended direction of area change.
  if (outward) {
    return preferClean(candidates).reduce((best, candidate) =>
      candidate.area > best.area ? candidate : best,
    ).ring
  }

  // Inward offset must shrink the ring, stay positive and never grow past the original;
  // otherwise the naive offset flipped it inside-out and the uncut boundary is kept.
  const inward = candidates.filter((candidate) => candidate.area > EPS && candidate.area <= before + EPS)
  if (inward.length === 0) return vertices
  return preferClean(inward).reduce((best, candidate) =>
    candidate.area < best.area ? candidate : best,
  ).ring
}
