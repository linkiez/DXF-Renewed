// LINE entity type

import type { BaseEntity } from './base-entity'
import type { Point3D } from './common'

export interface LineEntity extends BaseEntity {
  type: 'LINE'
  start: Point3D
  end: Point3D
}
