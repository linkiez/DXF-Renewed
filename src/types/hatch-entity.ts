// HATCH entity type

import type { BaseEntity } from './base-entity'
import type { RGB } from './common'

export interface HatchEntity extends BaseEntity {
  type: 'HATCH'
  paths: any[]
  fillColor?: RGB
  pattern?: string
}
