// Polyline conversion types

import type { Box2 } from 'vecks'
import type { ColorRGB, PointTuple } from './common'

/** Polyline with color information */
export interface Polyline {
  vertices: PointTuple[]
  rgb?: ColorRGB
  color?: number
}

/** Result of toPolylines conversion */
export interface PolylineResult {
  bbox: Box2
  polylines: Polyline[]
}

/** Options for entityToPolyline conversion */
export interface EntityToPolylineOptions {
  interpolationsPerSplineSegment?: number
}
