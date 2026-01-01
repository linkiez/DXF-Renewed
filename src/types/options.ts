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

export interface ToSVGOptions {
  width?: number
  height?: number
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
}

export interface Config {
  verbose?: boolean
  interpolationsPerSplineSegment: number
  layers: string[]
}

