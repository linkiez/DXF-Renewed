// ARC entity type

import type { BaseEntity } from './base-entity'

export interface ArcEntity extends BaseEntity {
  type: 'ARC'
  x: number
  y: number
  z?: number
  r: number
  startAngle: number
  endAngle: number
}
