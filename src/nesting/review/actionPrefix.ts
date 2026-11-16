import { EPSILON } from '../config'
import { distance } from '../polygonUtils'
import type { Point2D } from '../types'
import { sampleActionPath } from '../linking/actionPath'
import type { ReviewAction } from './types'

/**
 * Returns the polyline of an action from its start up to a fraction of its length.
 *
 * @param action - Action of a timeline.
 * @param fraction - Progress in `[0, 1]`; values outside are clamped.
 * @returns Points from the start to the point reached; one point for actions without length.
 */
export function actionPrefix(action: ReviewAction, fraction: number): Point2D[] {
  const path = sampleActionPath(action.points, action.curve)
  if (path.length < 2) return path
  const clamped = Math.min(1, Math.max(0, fraction))
  if (clamped >= 1) return path
  if (clamped <= 0) return [path[0]]
  let total = 0
  for (let index = 1; index < path.length; index += 1) total += distance(path[index - 1], path[index])
  if (total <= EPSILON) return [path[0]]
  const target = total * clamped
  const prefix: Point2D[] = [path[0]]
  let walked = 0
  for (let index = 1; index < path.length; index += 1) {
    const segment = distance(path[index - 1], path[index])
    if (walked + segment >= target) {
      const ratio = segment <= EPSILON ? 0 : (target - walked) / segment
      prefix.push({
        x: path[index - 1].x + (path[index].x - path[index - 1].x) * ratio,
        y: path[index - 1].y + (path[index].y - path[index - 1].y) * ratio,
      })
      return prefix
    }
    prefix.push(path[index])
    walked += segment
  }
  return prefix
}
