// SPLINE entity type

import type { BaseEntity } from './base-entity'
import type { Point3D } from './common'

export interface SplineEntity extends BaseEntity {
  type: 'SPLINE'
  controlPoints: Point3D[]
  knots: number[]
  degree: number
  weights?: number[]
}
