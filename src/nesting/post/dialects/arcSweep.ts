import { EPSILON } from '../../config'
import type { Point2D } from '../../types'

const FULL_CIRCLE_DEGREES = 360

/**
 * Sweep of an arc in degrees, in (0, 360].
 *
 * Equal start and end points (within `EPSILON`) are a full circle.
 *
 * @param start - Arc start.
 * @param end - Arc end.
 * @param center - Arc center.
 * @param clockwise - Direction of the arc.
 * @returns Sweep in degrees.
 */
export function arcSweep(start: Point2D, end: Point2D, center: Point2D, clockwise: boolean): number {
  if (Math.hypot(end.x - start.x, end.y - start.y) <= EPSILON) return FULL_CIRCLE_DEGREES
  const from = Math.atan2(start.y - center.y, start.x - center.x)
  const to = Math.atan2(end.y - center.y, end.x - center.x)
  const raw = clockwise ? from - to : to - from
  const turn = 2 * Math.PI
  return (((raw % turn) + turn) % turn) * (180 / Math.PI)
}
