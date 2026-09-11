import type { BaseEntity } from './base-entity'
import type { Point3D } from './common'

export interface MLeaderEntity extends BaseEntity {
  type: 'MLEADER'

  styleName?: string
  text?: string
  insertionPoint?: Point3D
  textHeight?: number
}
