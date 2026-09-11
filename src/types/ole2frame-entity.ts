// OLE2Frame entity type

import type { BaseEntity } from './base-entity'
import type { OleFrameData } from './oleframe-entity'

/**
 * OLE2Frame entity
 * Represents an embedded OLE2 object frame
 */
export interface Ole2FrameEntity extends BaseEntity, OleFrameData {
  type: 'OLE2FRAME'
}
