// Viewport entity type

import type { BaseEntity } from './base-entity'
import type { ViewportPoint2D, ViewportPoint3D } from './viewport-fields'

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
  center?: ViewportPoint3D
  /** Center point in DCS */
  centerDCS?: ViewportPoint2D
  /** Snap base point */
  snap?: ViewportPoint2D
  /** Snap spacing */
  snapSpacing?: ViewportPoint2D
  /** Grid spacing */
  gridSpacing?: ViewportPoint2D
  /** View direction from target */
  direction?: ViewportPoint3D
  /** View target point */
  target?: ViewportPoint3D
}
