// INSERT entity type (block references)

import type { BaseEntity } from './base-entity'

export interface InsertEntity extends BaseEntity {
  type: 'INSERT'
  block: string
  x: number
  y: number
  z?: number
  scaleX?: number
  scaleY?: number
  scaleZ?: number
  rotation?: number
  columnCount?: number
  rowCount?: number
  columnSpacing?: number
  rowSpacing?: number
  extrusionX?: number
  extrusionY?: number
  extrusionZ?: number
}
