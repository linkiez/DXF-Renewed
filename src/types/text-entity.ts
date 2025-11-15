// TEXT entity type

import type { BaseEntity } from './base-entity'

export interface TextEntity extends BaseEntity {
  type: 'TEXT'
  string: string
  x?: number
  y?: number
  z?: number
  x2?: number
  y2?: number
  z2?: number
  thickness?: number
  textHeight?: number
  relScaleX?: number
  rotation?: number
  obliqueAngle?: number
  styleName?: string
  mirror?: number
  hAlign?: number
  vAlign?: number
}
