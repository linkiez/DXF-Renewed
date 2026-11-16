import { pointToSegmentDistance } from '../cutPath/geometry'
import { pointInPolygon } from '../polygonUtils'
import type { Point2D } from '../types'
import { sampleActionPath } from '../linking/actionPath'
import type { ReviewAction, ReviewPart, ReviewScene, ReviewSelection } from './types'

const sameSelection = (a: ReviewSelection | null | undefined, b: ReviewSelection): boolean =>
  a !== null && a !== undefined && JSON.stringify(a) === JSON.stringify(b)

const nearAction = (action: ReviewAction, point: Point2D, tolerance: number): boolean => {
  const path = sampleActionPath(action.points, action.curve)
  if (path.length === 0) return false
  if (path.length === 1) return Math.hypot(point.x - path[0].x, point.y - path[0].y) <= tolerance
  for (let index = 1; index < path.length; index += 1) {
    if (pointToSegmentDistance(point, path[index - 1], path[index]) <= tolerance) return true
  }
  return false
}

const insidePart = (part: ReviewPart, point: Point2D): boolean => {
  const [outer, ...holes] = part.outlines
  return outer !== undefined &&
    pointInPolygon(point, [...outer]) &&
    !holes.some((hole) => pointInPolygon(point, [...hole]))
}

/**
 * Finds the part or action under a point of a sheet.
 *
 * Candidates are ordered deterministically: actions by timeline index, then parts in sheet order.
 * Passing the previous result as `after` returns the next candidate (wrapping around), so every
 * overlapping item can be reached.
 *
 * @param scene - Review scene.
 * @param sheetId - Sheet under the pointer.
 * @param point - Point in sheet coordinates.
 * @param tolerance - Hit distance for actions, in sheet units.
 * @param after - Previous selection; the result is the candidate that follows it.
 * @returns The selection, or `null` when nothing is under the point.
 */
export function pickAt(
  scene: ReviewScene,
  sheetId: string,
  point: Point2D,
  tolerance: number,
  after?: ReviewSelection | null,
): ReviewSelection | null {
  const sheet = scene.sheets.find((candidate) => candidate.id === sheetId)
  if (!sheet) return null
  const candidates: ReviewSelection[] = []
  for (const action of sheet.timeline?.actions ?? []) {
    if (nearAction(action, point, tolerance)) candidates.push({ kind: 'action', sheetId, actionIndex: action.index })
  }
  for (const part of sheet.parts) {
    if (insidePart(part, point)) candidates.push({ kind: 'part', sheetId, partKey: part.key })
  }
  if (candidates.length === 0) return null
  const previous = candidates.findIndex((candidate) => sameSelection(after, candidate))
  return candidates[(previous + 1) % candidates.length]
}
