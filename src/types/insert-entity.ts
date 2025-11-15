// INSERT entity type (block references)

import type { PositionalEntity } from './base-entity'

export interface InsertEntity extends PositionalEntity {
  type: 'INSERT'
  block: string
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
