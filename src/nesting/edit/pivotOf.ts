import { computeBoundingBox } from '../polygonUtils'
import type { Point2D } from '../types'
import type { WorkingPart } from './types'

/**
 * Center of the bounding box of the outer outline of a part: the pivot of rotations and mirrors.
 *
 * @param part - Working part.
 * @returns The center point.
 */
export function pivotOf(part: WorkingPart): Point2D {
  const box = computeBoundingBox(part.outlines[0])
  return { x: (box.minX + box.maxX) / 2, y: (box.minY + box.maxY) / 2 }
}
