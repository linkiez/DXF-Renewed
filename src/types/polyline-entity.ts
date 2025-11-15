// POLYLINE and LWPOLYLINE entity types

import type { BaseEntity } from './base-entity'
import type { Point2D } from './common'

/** Vertex extends Point2D with optional z and additional properties */
export interface Vertex extends Partial<Point2D> {
  z?: number
  bulge?: number
  faces?: number[]
}

export interface PolylineEntity extends BaseEntity {
  type: 'POLYLINE' | 'LWPOLYLINE'
  vertices: Vertex[]
  closed?: boolean
  polygonMesh?: boolean
  polyfaceMesh?: boolean
  thickness?: number
}
