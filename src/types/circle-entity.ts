// CIRCLE entity type

import type { BaseEntity } from './base-entity'

export interface CircleEntity extends BaseEntity {
  type: 'CIRCLE'
  x: number
  y: number
  z?: number
  r: number
}
