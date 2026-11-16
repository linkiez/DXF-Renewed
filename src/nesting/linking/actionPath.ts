import type { CutCurve } from '../cutPath/types'
import { EPSILON } from '../config'
import { distance } from '../polygonUtils'
import type { Point2D } from '../types'

const BEZIER_SAMPLES = 32
const ARC_SEGMENTS_PER_TURN = 360
const TAU = Math.PI * 2

const bezierPoint = (control: readonly Point2D[], t: number): Point2D => {
  let level = control.map((point) => ({ ...point }))
  while (level.length > 1) {
    const current = level
    level = current.slice(1).map((point, index) => ({
      x: current[index].x + (point.x - current[index].x) * t,
      y: current[index].y + (point.y - current[index].y) * t,
    }))
  }
  return level[0]
}

const sampleArc = (
  points: readonly Point2D[],
  curve: Extract<CutCurve, { type: 'arc' }>,
): Point2D[] => {
  const start = points[0]
  const end = points[points.length - 1]
  const radius = distance(curve.center, start)
  const from = Math.atan2(start.y - curve.center.y, start.x - curve.center.x)
  const to = Math.atan2(end.y - curve.center.y, end.x - curve.center.x)
  const raw = curve.clockwise ? from - to : to - from
  const wrapped = ((raw % TAU) + TAU) % TAU
  const sweep = wrapped <= EPSILON && distance(start, end) <= EPSILON ? TAU : wrapped
  const segments = Math.max(4, Math.ceil((sweep / TAU) * ARC_SEGMENTS_PER_TURN))
  const direction = curve.clockwise ? -1 : 1
  const sampled: Point2D[] = [{ ...start }]
  for (let step = 1; step < segments; step += 1) {
    const angle = from + direction * sweep * (step / segments)
    sampled.push({ x: curve.center.x + radius * Math.cos(angle), y: curve.center.y + radius * Math.sin(angle) })
  }
  sampled.push({ ...end })
  return sampled
}

/**
 * Samples the geometry of one action into a polyline (arcs and beziers are discretized).
 *
 * @param points - Ordered action points.
 * @param curve - Optional arc or bezier attached to the action.
 * @returns Polyline that follows the action; the input points when it has no curve.
 */
export function sampleActionPath(points: readonly Point2D[], curve: CutCurve | undefined): Point2D[] {
  if (points.length < 2 || !curve) return points.map((point) => ({ ...point }))
  if (curve.type === 'arc') return sampleArc(points, curve)
  const control = [points[0], ...curve.controlPoints, points[points.length - 1]]
  const sampled: Point2D[] = []
  for (let step = 0; step <= BEZIER_SAMPLES; step += 1) sampled.push(bezierPoint(control, step / BEZIER_SAMPLES))
  return sampled
}
