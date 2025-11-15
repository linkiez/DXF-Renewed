// DIMENSION entity type

import type { BaseEntity } from './base-entity'
import type { Point3D } from './common'

export interface DimensionEntity extends BaseEntity {
  type: 'DIMENSION'
  block?: string
  start: Point3D
  measureStart: Point3D
  measureEnd: Point3D
  textMidpoint: Point3D
  rotation?: number
  horizonRotation?: number
  extensionRotation?: number
  textRotation?: number
  attachementPoint: number
  dimensionType: number
  extrudeDirection?: Point3D
  text?: string
  styleName?: string
  [key: string]: unknown
}
