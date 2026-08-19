// Options types for various operations

export interface ToPolylinesOptions {
  interpolationsPerSplineSegment?: number
}

export interface ToJsonOptions {
  /** Pretty-print JSON output (defaults to false). */
  pretty?: boolean
  /** Indentation spaces when pretty-printing (defaults to 2). */
  space?: number
}

/**
 * Viewport percentage controls for DIMENSION autoScale.
 *
 * Each value is a percentage (0..100) of the viewport minimum dimension.
 */
export interface DimensionAutoScaleViewportPercentages {
  /** Arrowhead marker size (markerWidth/markerHeight) */
  arrowSize?: number
  /** Text height (`font-size`) */
  textHeight?: number
  /** Extension line offset from the measured points */
  extLineOffset?: number
  /** Extension line overshoot beyond the dimension line */
  extLineExtension?: number
}

export interface SVGStrokeWidthOptions {
  /**
   * `screen` keeps stroke-width as an SVG percentage.
   * `viewport` converts the percentage into drawing units using the smallest
   * viewBox dimension.
   */
  mode?: 'screen' | 'viewport'
  /**
   * Stroke-width percentage value used by the selected mode.
   * Default: 0.1
   */
  value?: number
}

export interface ToSVGOptions {
  width?: number
  height?: number
  /**
   * Global SVG stroke-width configuration.
   * Defaults to `{ mode: 'screen', value: 0.1 }` to preserve current output.
   */
  strokeWidth?: SVGStrokeWidthOptions
  /**
   * When true, closed POLYLINE/LWPOLYLINE entities are filled using their
   * resolved entity color, without requiring a dedicated HATCH entity.
   */
  fillClosedPolylines?: boolean
  /**
   * Fill color applied to closed POLYLINE/LWPOLYLINE entities in SVG output.
   * When omitted, closed polylines keep the historical stroke-only behavior.
   * When an array is provided, colors rotate across closed polygons in the
   * order they are drawn (index modulo array length).
   */
  closedPolylineFill?: string | string[]
  /**
   * Stroke color applied only to closed POLYLINE/LWPOLYLINE entities in SVG output.
   * Open entities keep using their resolved entity color for stroke.
   * When an array is provided, colors rotate across closed polygons in the
   * order they are drawn (index modulo array length).
   */
  closedPolylineStroke?: string | string[]
  dimension?: {
    /**
     * Automatically scale DIMENSION arrow size, extension endpoints, and
     * text height estimates based on the SVG viewport size.
     */
    autoScale?: boolean

    /**
     * Viewport reference size used by DIMENSION autoScale.
     * Scale factor is: min(viewBoxWidth, viewBoxHeight) / autoScaleViewportReference.
     * Default: 40.
     */
    autoScaleViewportReference?: number

    /**
     * Per-element viewport-percentage overrides for DIMENSION autoScale.
     *
     * When provided (and `autoScale` is enabled), these values set the final
     * sizes directly as a percentage of the viewport minimum dimension:
     * `size = min(viewBoxWidth, viewBoxHeight) * (percent / 100)`.
     *
     * Percent values are expected in the `0..100` range.
     */
    autoScaleViewportPercentages?: DimensionAutoScaleViewportPercentages
  }
  includeHandles?: boolean
}

export interface Config {
  verbose?: boolean
  interpolationsPerSplineSegment: number
  layers: string[]
}
