// SOLID and 3DFACE entity types

import type { BaseEntity } from './base-entity'
import type { Point3D } from './common'

export interface SolidEntity extends BaseEntity {
  type: 'SOLID' | '3DFACE'
  points: Point3D[]
}
