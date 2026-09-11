// TEXT entity type

import type { TextContentEntity } from './text-content-entity'

export interface TextEntity extends TextContentEntity {
  type: 'TEXT'
  x2?: number
  y2?: number
  z2?: number
  thickness?: number
  relScaleX?: number
  rotation?: number
  obliqueAngle?: number
  mirror?: number
  hAlign?: number
  vAlign?: number
}
