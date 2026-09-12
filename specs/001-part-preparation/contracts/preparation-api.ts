/**
 * Public contract: Part Preparation (feature 001-part-preparation).
 *
 * This file is the interface contract for the implementation phase; it is not
 * compiled into the package (declaration-only). Paths at implementation time:
 *   src/nesting/pro/types.ts
 *   src/nesting/pro/partPrep/index.ts  ->  exported as `prepareParts`
 *   src/nesting/index.ts               ->  re-exports (additive, no API break)
 */

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
  /** 0 = outer, odd = hole, even >= 2 = island. Unlimited nesting (FR-011). */
  depth: number
  source: SourceRef
  /** Closed ring, first point repeated at the end. Canonical mm. */
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
  /** Stable: derived from `outer.source.handle`. */
  id: string
  outer: Boundary
  holes: Boundary[]
  /** Even depth >= 2; each retains its `depth` (never flattened — SC-006). */
  islands: Boundary[]
  bbox: BBox
  /** Net area = outer - holes + islands. */
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
  /** Supported set is `{ 'mm' }`. Absent => 'mm'. Other declared unit => rejected (FR-008). */
  unit?: string
  /** Gap-close and simplification tolerance, in the request unit. */
  tolerance: number
  /** Total kerf, in the request unit; applied as +/- allowance/2 away from material (FR-005). */
  cutWidthAllowance: number
  minArea?: number
  minFeatureSize?: number
}

export interface PrepareResult {
  parts: PreparedPart[]
  issues: PreparationIssue[]
  unit: Unit
}

/**
 * Prepare parsed DXF geometry into classified, cuttable parts.
 *
 * Guarantees:
 * - unit absent => 'mm'; declared unsupported unit => `UNSUPPORTED_UNIT`, no parts (FR-008/SC-004).
 * - output normalized to mm (FR-009).
 * - automatic repair limited to gap-close (<= tolerance) and winding normalization (FR-004).
 * - real self-intersection remaining after repair => `SELF_INTERSECTION`, never repaired (FR-010/SC-005).
 * - every closed contour classified by containment depth, unlimited nesting (FR-001/SC-006).
 * - every returned or rejected boundary carries `source` (FR-002).
 * - identical (dxf, options) => deep-equal result (FR-007/SC-003).
 */
export declare function prepareParts(
  dxf: string | { entities: unknown[] },
  options: PrepareOptions,
): PrepareResult
