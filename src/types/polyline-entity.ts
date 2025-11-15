// POLYLINE and LWPOLYLINE entity types

import type { BaseEntity } from './base-entity'

export interface Vertex {
  x?: number
  y?: number
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
