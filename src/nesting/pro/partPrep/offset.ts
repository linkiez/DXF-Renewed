import { offsetPolygon, polygonArea } from '../../../nest/geometry'
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
 * [VERIFY] `offsetPolygon` normals depend on winding; the candidate that moves the
 * boundary in the intended direction (outer grows, hole/island shrinks) wins.
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
  const plusArea = polygonArea(plus)
  const minusArea = polygonArea(minus)

  const fits = (area: number): boolean =>
    outward ? area >= before - EPS : area <= before + EPS
  if (fits(plusArea)) return plus
  if (fits(minusArea)) return minus
  if (outward) return plusArea >= minusArea ? plus : minus
  return plusArea <= minusArea ? plus : minus
}
