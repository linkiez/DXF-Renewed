// ELLIPSE entity type

import type { BaseEntity } from './base-entity'

export interface EllipseEntity extends BaseEntity {
  type: 'ELLIPSE'
  x: number
  y: number
  z?: number
  majorX: number
  majorY: number
  majorZ?: number
  axisRatio: number
  startAngle: number
  endAngle: number
}
