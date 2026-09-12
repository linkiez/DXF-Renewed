import { simplifyPolygon } from '../../../nest/geometry'

/** Remove duplicate/coincident points and re-close the ring (FR-003). */
export function simplify(
  vertices: [number, number][],
  tolerance: number,
): [number, number][] {
  return simplifyPolygon(vertices, tolerance)
}
