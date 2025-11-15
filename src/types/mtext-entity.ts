// MTEXT entity type

import type { BaseEntity } from './base-entity'

export interface MTextEntity extends BaseEntity {
  type: 'MTEXT'
  string: string
  x?: number
  y?: number
  z?: number
  nominalTextHeight?: number
  textHeight?: number
  refRectangleWidth?: number
  attachmentPoint?: number
  drawingDirection?: number
  styleName?: string
  xAxisX?: number
  xAxisY?: number
  xAxisZ?: number
  horizontalWidth?: number
  verticalHeight?: number
  lineSpacingStyle?: number
  lineSpacingFactor?: number
  backgroundFill?: number
  fillBoxStyle?: number
  bgFillColor?: number
  bgFillTransparency?: number
  columnType?: number
  columnCount?: number
  columnFlowReversed?: boolean
  columnAutoheight?: boolean
  columnWidth?: number
  columnGutter?: number
  columnHeights?: number
}
