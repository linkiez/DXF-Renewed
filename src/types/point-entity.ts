// POINT entity type

import type { BaseEntity } from './base-entity'

export interface PointEntity extends BaseEntity {
  type: 'POINT'
  x: number
  y: number
  z?: number
}
