import { Point2D } from '../types'

/**
 * Rotate a point by the given angle.
 *
 * @param p the point
 * @param angle the rotation angle in radians
 */
export default (p: Point2D, angle: number): Point2D => {
  return {
    x: p.x * Math.cos(angle) - p.y * Math.sin(angle),
    y: p.y * Math.cos(angle) + p.x * Math.sin(angle),
  }
}
