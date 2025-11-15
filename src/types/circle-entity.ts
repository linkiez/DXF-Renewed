// CIRCLE entity type

import type { PositionalEntity } from './base-entity'

export interface CircleEntity extends PositionalEntity {
  type: 'CIRCLE'
  r: number
}
