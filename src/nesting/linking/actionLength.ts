import type { CutCurve } from '../cutPath/types'
import { distance } from '../polygonUtils'
import type { Point2D } from '../types'
import { sampleActionPath } from './actionPath'

/**
 * Measures the geometric length of one action along its points, arc or bezier.
 *
 * @param points - Ordered action points.
 * @param curve - Optional arc or bezier attached to the action.
 * @returns Length in geometry units; zero for fewer than two points.
 */
export function actionLength(points: readonly Point2D[], curve: CutCurve | undefined): number {
  const path = sampleActionPath(points, curve)
  let total = 0
  for (let index = 1; index < path.length; index += 1) total += distance(path[index - 1], path[index])
  return total
}
