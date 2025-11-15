// Handler-internal types (não exportados na API pública)

import type { Point2D } from './common'

/** Common properties extracted from DXF tuples */
export interface CommonEntityProperties {
  handle?: string
  lineTypeName?: string
  layer?: string
  lineTypeScale?: number
  visible?: boolean
  colorNumber?: number
  paperSpace?: number
  viewportOn?: number
  viewport?: number
  extrusionX?: number
  extrusionY?: number
  extrusionZ?: number
  layout?: string
}

/** Simple codes extraction result */
export interface SimpleCodes {
  [code: number]: string | number
}

/** Bit combinations result for dimensions */
export interface BitCombinationsResult {
  attachmentPoint?: number
  [key: string]: number | undefined
}

/** Polyline vertex with bulge - extends Point2D */
export interface PolylineVertex extends Point2D {
  z?: number
  bulge?: number
}

/** Control point for splines - extends Point2D */
export interface ControlPoint extends Point2D {
  z?: number
  weight?: number
}

/** Vertex for polylines - internal handler use */
export interface HandlerVertex extends Point2D {
  z?: number
  bulge?: number
  startWidth?: number
  endWidth?: number
}
