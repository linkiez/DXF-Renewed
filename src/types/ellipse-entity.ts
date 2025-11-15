// ELLIPSE entity type

import type { PositionalEntity } from './base-entity'

export interface EllipseEntity extends PositionalEntity {
  type: 'ELLIPSE'
  majorX: number
  majorY: number
  majorZ?: number
  axisRatio: number
  startAngle: number
  endAngle: number
}
