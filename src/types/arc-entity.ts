// ARC entity type

import type { PositionalEntity } from './base-entity'

export interface ArcEntity extends PositionalEntity {
  type: 'ARC'
  r: number
  startAngle: number
  endAngle: number
}
