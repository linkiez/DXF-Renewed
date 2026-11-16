import type { Point2D } from '../../types'
import { arcSweep } from './arcSweep'

/** One piece of an arc split at the quadrants. */
export interface ArcPiece {
  readonly start: Point2D
  readonly end: Point2D
}

const QUARTER = Math.PI / 2
const TOLERANCE = 1e-9
const COS = [1, 0, -1, 0] as const
const SIN = [0, 1, 0, -1] as const

function quadrantPoint(center: Point2D, radius: number, multiple: number): Point2D {
  const index = ((multiple % 4) + 4) % 4
  return { x: center.x + radius * COS[index], y: center.y + radius * SIN[index] }
}

/**
 * Break an arc at the 0, 90, 180 and 270 degree points of its circle.
 *
 * Pieces chain end to start; the last piece ends exactly at `end`. An arc inside one quadrant is returned as is.
 *
 * @param start - Arc start.
 * @param end - Arc end (equal to the start for a full circle).
 * @param center - Arc center.
 * @param clockwise - Direction of the arc.
 * @returns The pieces, in order.
 */
export function splitArcAtQuadrants(start: Point2D, end: Point2D, center: Point2D, clockwise: boolean): readonly ArcPiece[] {
  const radius = Math.hypot(start.x - center.x, start.y - center.y)
  const direction = clockwise ? -1 : 1
  let remaining = (arcSweep(start, end, center, clockwise) * Math.PI) / 180
  let angle = Math.atan2(start.y - center.y, start.x - center.x)
  let from = start
  const pieces: ArcPiece[] = []
  for (;;) {
    const unit = angle / QUARTER
    const next = direction > 0 ? Math.floor(unit + TOLERANCE) + 1 : Math.ceil(unit - TOLERANCE) - 1
    const step = Math.abs(next * QUARTER - angle)
    if (step >= remaining - TOLERANCE) break
    const point = quadrantPoint(center, radius, next)
    pieces.push({ start: from, end: point })
    from = point
    angle = next * QUARTER
    remaining -= step
  }
  pieces.push({ start: from, end })
  return pieces
}
