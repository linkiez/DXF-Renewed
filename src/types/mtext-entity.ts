// MTEXT entity type

import type { TextContentEntity } from './text-content-entity'

export interface MTextEntity extends TextContentEntity {
  type: 'MTEXT'
  nominalTextHeight?: number
  refRectangleWidth?: number
  attachmentPoint?: number
  drawingDirection?: number
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
