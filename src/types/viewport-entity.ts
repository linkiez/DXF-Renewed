// Viewport entity type

import type { BaseEntity } from './base-entity'

/**
 * Viewport entity
 * Represents a viewport in model space or paper space
 */
export interface ViewportEntity extends BaseEntity {
  type: 'VIEWPORT'
  /** Layout reference */
  layout?: number
  /** Viewport width */
  width?: number
  /** Viewport height */
  height?: number
  /** Snap rotation angle */
  snapAngle?: number
  /** View twist angle */
  angle?: number
  /** Viewport status field */
  status?: string | number
  /** Viewport ID */
  id?: string | number
  /** Viewport flags */
  flags?: string | number
  /** UCS origin X coordinate */
  x?: number
  /** UCS origin Y coordinate */
  y?: number
  /** UCS origin Z coordinate */
  z?: number
  /** UCS X-axis X component */
  xAxisX?: number
  /** UCS X-axis Y component */
  xAxisY?: number
  /** UCS X-axis Z component */
  xAxisZ?: number
  /** View elevation */
  elevation?: number
  /** Render mode */
  render?: string | number
  /** Center point in WCS */
  center?: {
    x?: number
    y?: number
    z?: number
  }
  /** Center point in DCS */
  centerDCS?: {
    x?: number
    y?: number
  }
  /** Snap base point */
  snap?: {
    x?: number
    y?: number
  }
  /** Snap spacing */
  snapSpacing?: {
    x?: number
    y?: number
  }
  /** Grid spacing */
  gridSpacing?: {
    x?: number
    y?: number
  }
  /** View direction from target */
  direction?: {
    x?: number
    y?: number
    z?: number
  }
  /** View target point */
  target?: {
    x?: number
    y?: number
    z?: number
  }
}
