import type { Point2D } from '../../../types'
import type { Contour } from '../contourBlocks'
import { splitArcAtQuadrants } from '../splitArcAtQuadrants'

/**
 * Width and height of the bounding box of the mapped cut points of the contours.
 *
 * Arc quadrant points are included so that a circle is measured by its extent and not only by its end points.
 *
 * @param contours - Contours of the program.
 * @param mapPoint - Nesting-to-machine point mapping.
 * @returns The extents; zero for no contour.
 */
export function talviExtents(contours: readonly Contour[], mapPoint: (point: Point2D) => Point2D): { width: number; height: number } {
  const xs: number[] = []
  const ys: number[] = []
  const add = (point: Point2D): void => {
    const mapped = mapPoint(point)
    xs.push(mapped.x)
    ys.push(mapped.y)
  }
  for (const contour of contours) {
    for (const { action } of contour.motions) {
      action.points.forEach(add)
      if (action.curve?.type === 'arc') {
        const start = action.points[0]
        const end = action.points[action.points.length - 1]
        for (const piece of splitArcAtQuadrants(start, end, action.curve.center, action.curve.clockwise)) add(piece.end)
      }
    }
  }
  if (xs.length === 0) return { width: 0, height: 0 }
  return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }
}
