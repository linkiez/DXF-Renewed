import { EPSILON } from '../config'
import { pointInPolygon } from '../polygonUtils'
import type { Point2D } from '../types'

const pointToSegment = (p: Point2D, a: Point2D, b: Point2D): number => {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lengthSquared = dx * dx + dy * dy
  if (lengthSquared < EPSILON) return Math.hypot(p.x - a.x, p.y - a.y)
  const t = Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

const cross = (o: Point2D, p: Point2D, q: Point2D): number => (p.x - o.x) * (q.y - o.y) - (p.y - o.y) * (q.x - o.x)

const crosses = (a: Point2D, b: Point2D, c: Point2D, d: Point2D): boolean =>
  cross(c, d, a) * cross(c, d, b) < 0 && cross(a, b, c) * cross(a, b, d) < 0

const segmentToSegment = (a: Point2D, b: Point2D, c: Point2D, d: Point2D): number =>
  crosses(a, b, c, d)
    ? 0
    : Math.min(pointToSegment(a, c, d), pointToSegment(b, c, d), pointToSegment(c, a, b), pointToSegment(d, a, b))

/**
 * Shortest distance between a path (an open polyline) and the boundary of a polygon; zero when the
 * path crosses the boundary or lies inside the polygon.
 *
 * @param path - Ordered path points.
 * @param ring - Polygon vertices.
 * @returns Distance in the units of the points.
 */
export function pathDistance(path: readonly Point2D[], ring: readonly Point2D[]): number {
  if (path.some((point) => pointInPolygon(point, [...ring]))) return 0
  let best = Number.POSITIVE_INFINITY
  for (let index = 1; index < Math.max(path.length, 2); index += 1) {
    const from = path[index - 1] ?? path[0]
    const to = path[index] ?? path[0]
    for (let edge = 1; edge < ring.length; edge += 1) {
      best = Math.min(best, segmentToSegment(from, to, ring[edge - 1], ring[edge]))
    }
  }
  return best
}
