/** Canonical length unit. Output is always millimetres (FR-009). */
export type Unit = 'mm'

/** Containment classification derived from even-odd depth (FR-001). */
export type Classification = 'outer' | 'hole' | 'island'

export interface BBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** Traceability back to the drawing (FR-002). */
export interface SourceRef {
  handle: string
  layer: string
  entityType: string
}

export interface Boundary {
  classification: Classification
  depth: number
  source: SourceRef
  vertices: [number, number][]
  area: number
  perimeter: number
  bbox: BBox
}

export interface Repair {
  kind: 'gap-close' | 'orientation'
  source: SourceRef
  detail: string
}

export interface Warning {
  code: 'MIN_FEATURE' | 'MIN_AREA' | 'ORIENTATION_REPAIRED' | 'GAP_CLOSED'
  source: SourceRef
  detail: string
}

export interface PreparedPart {
  id: string
  outer: Boundary
  holes: Boundary[]
  islands: Boundary[]
  bbox: BBox
  area: number
  repairs: Repair[]
  warnings: Warning[]
}

export type IssueCode =
  | 'OPEN_BOUNDARY'
  | 'SELF_INTERSECTION'
  | 'ZERO_AREA'
  | 'GAP_TOO_LARGE'
  | 'UNSUPPORTED_UNIT'
  | 'UNSUPPORTED_ENTITY'

export interface PreparationIssue {
  code: IssueCode
  severity: 'rejection' | 'warning'
  source: SourceRef
  depth?: number
  detail: string
}

export interface PrepareOptions {
  unit?: string
  tolerance: number
  cutWidthAllowance: number
  minArea?: number
  minFeatureSize?: number
}

export interface PrepareResult {
  parts: PreparedPart[]
  issues: PreparationIssue[]
  unit: Unit
}
