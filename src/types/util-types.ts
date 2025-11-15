// Utility-specific types

import type { Box2 } from 'vecks'
import type { Point2D } from './common'

/** Point for utility functions - extends Point2D with optional z */
export interface UtilPoint extends Point2D {
  z?: number
}

/** Result of knot insertion operation */
export interface InsertKnotResult {
  knots: number[]
  controlPoints: UtilPoint[]
}

/** Result of bezier conversion */
export interface BezierResult {
  controlPoints: UtilPoint[]
  knots: number[]
}

/** Transform result with bounding box */
export interface TransformResult {
  element: string
  bbox: Box2
}
