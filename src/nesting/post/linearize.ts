import { EPSILON } from '../config'
import type { CutAction, CutPlan } from '../cutPath'
import type { Point2D } from '../types'
import type { MachineProfile } from './types'

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

function isFinitePoint(point: { x: number; y: number }): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y)
}

function pointLineDistance(
  point: Point2D,
  start: Point2D,
  end: Point2D,
): number {
  const length = distance(start, end)
  if (length <= EPSILON) return distance(point, start)
  return Math.abs(
    (end.x - start.x) * (start.y - point.y) -
      (start.x - point.x) * (end.y - start.y),
  ) / length
}

function splitBezier(points: readonly Point2D[]): [Point2D[], Point2D[]] {
  const levels: Point2D[][] = [points.map((point) => ({ ...point }))]
  while (levels[levels.length - 1].length > 1) {
    const previous = levels[levels.length - 1]
    levels.push(previous.slice(0, -1).map((point, index) => ({
      x: (point.x + previous[index + 1].x) / 2,
      y: (point.y + previous[index + 1].y) / 2,
    })))
  }
  const left = levels.map((level) => level[0])
  const right = levels.map((level) => level[level.length - 1]).reverse()
  return [left, right]
}

function flattenBezier(
  points: readonly Point2D[],
  tolerance: number,
): readonly Point2D[] {
  const output: Point2D[] = []
  const visit = (curve: readonly Point2D[], depth: number): void => {
    const start = curve[0]
    const end = curve[curve.length - 1]
    const flat = curve.slice(1, -1).every((point) =>
      pointLineDistance(point, start, end) <= tolerance)
    if (flat || depth >= 20) {
      if (output.length === 0) output.push({ ...start })
      output.push({ ...end })
      return
    }
    const [left, right] = splitBezier(curve)
    visit(left, depth + 1)
    visit(right, depth + 1)
  }
  visit(points, 0)
  return output
}

function isValidArc(
  points: readonly Point2D[],
  center: Point2D,
): boolean {
  return points.length >= 2 &&
    isFinitePoint(center) &&
    points.every(isFinitePoint)
}

function isValidBezier(
  points: readonly Point2D[],
  controlPoints: readonly Point2D[],
): boolean {
  return points.length >= 2 &&
    controlPoints.length > 0 &&
    points.every(isFinitePoint) &&
    controlPoints.every(isFinitePoint)
}

function linearizeArc(
  points: readonly Point2D[],
  center: Point2D,
  clockwise: boolean,
  tolerance: number,
): readonly Point2D[] {
  if (points.length < 2) return points.map((point) => ({ ...point }))
  const start = points[0]
  const end = points[points.length - 1]
  const radius = distance(start, center)
  if (!(radius > EPSILON) || Math.abs(radius - distance(end, center)) > tolerance) {
    return points.map((point) => ({ ...point }))
  }

  const startAngle = Math.atan2(start.y - center.y, start.x - center.x)
  const endAngle = Math.atan2(end.y - center.y, end.x - center.x)
  let sweep = endAngle - startAngle
  if (clockwise && sweep > 0) sweep -= Math.PI * 2
  if (!clockwise && sweep < 0) sweep += Math.PI * 2
  const segments = Math.max(1, Math.ceil(Math.abs(sweep * radius) / Math.max(tolerance, EPSILON)))
  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = startAngle + (sweep * index) / segments
    return { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius }
  })
}

/**
 * Normalize explicit arc actions into deterministic line segments when arcs are unavailable.
 *
 * @param plan - Immutable machine-independent cut plan.
 * @param profile - Machine profile containing the approved tolerance.
 * @returns A plan with cloned points and linearized arc actions.
 */
export function linearizeCutPlan(plan: CutPlan, profile: MachineProfile): CutPlan {
  if (profile.arcSupport) return plan
  const tolerance = profile.curveLinearizationTolerance
  if (!(typeof tolerance === 'number' && Number.isFinite(tolerance) && tolerance > EPSILON)) {
    return {
      ...plan,
      actions: plan.actions.map((action) => ({
        ...action,
        points: action.points.map((point) => ({ ...point })),
      })),
    }
  }
  const actions: CutAction[] = plan.actions.map((action) => ({
    ...action,
    points: action.curve?.type === 'arc' && isValidArc(action.points, action.curve.center)
      ? linearizeArc(action.points, action.curve.center, action.curve.clockwise, tolerance)
      : action.curve?.type === 'bezier' && isValidBezier(action.points, action.curve.controlPoints)
        ? flattenBezier([
            action.points[0],
            ...action.curve.controlPoints,
            action.points[action.points.length - 1],
          ], tolerance)
        : action.points.map((point) => ({ ...point })),
    curve: (action.curve?.type === 'arc' && isValidArc(action.points, action.curve.center)) ||
      (action.curve?.type === 'bezier' && isValidBezier(action.points, action.curve.controlPoints))
      ? undefined
      : action.curve,
  }))
  return { ...plan, actions }
}
