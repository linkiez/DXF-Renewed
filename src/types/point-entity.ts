// POINT entity type

import type { PositionalEntity } from './base-entity'

export interface PointEntity extends PositionalEntity {
  type: 'POINT'
}
