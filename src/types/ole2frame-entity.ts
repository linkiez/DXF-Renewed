// OLE2Frame entity type

import type { BaseEntity } from './base-entity'

/**
 * OLE2Frame entity
 * Represents an embedded OLE2 object frame
 */
export interface Ole2FrameEntity extends BaseEntity {
  type: 'OLE2FRAME'
  /** OLE version number */
  version?: string | number
  /** End of object name/description */
  name?: string | number
  /** Upper-left corner X coordinate (WCS) */
  upperLeftX?: string | number
  /** Upper-left corner Y coordinate (WCS) */
  upperLeftY?: string | number
  /** Upper-left corner Z coordinate (WCS) */
  upperLeftZ?: string | number
  /** Lower-right corner X coordinate (WCS) */
  lowerRightX?: string | number
  /** Lower-right corner Y coordinate (WCS) */
  lowerRightY?: string | number
  /** Lower-right corner Z coordinate (WCS) */
  lowerRightZ?: string | number
  /** Object type (1=Link, 2=Embedded, 3=Static) */
  objectType?: string | number
  /** Tile mode descriptor (0=Model space, 1=Paper space) */
  tile?: string | number
  /** Length of binary data */
  length?: string | number
  /** Binary data (concatenated from multiple 310 codes) */
  data: string
}
