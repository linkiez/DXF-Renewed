// Base entity interface that all DXF entities extend from

import type { Point3D, Transform } from './common'

export interface BaseEntity {
  type: string
  handle?: string
  layer?: string
  lineTypeName?: string
  lineTypeScale?: number
  visible?: boolean
  colorNumber?: number
  paperSpace?: number
  viewportOn?: number
  extrusionDirection?: Point3D
  extrusionZ?: number
  transforms?: Transform[]
}

/** Base for entities with positional coordinates (x, y, z) */
export interface PositionalEntity extends BaseEntity {
  x: number
  y: number
  z?: number
}
