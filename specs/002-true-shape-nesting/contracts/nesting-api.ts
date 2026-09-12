/**
 * Public contract for true-shape nesting (spec 002).
 *
 * Reuses the existing geometry types from src/nesting. The repository entry point
 * (src/index.ts) already re-exports './nesting/index', so consumers import from the
 * package root; this file pins the shape of the request and result.
 */
import type {
  NestableShape,
  NestingOptions,
  NestingResult,
  Point2D,
  StockSheet,
} from '../../../src/nesting'

/** A stock item the caller makes available for this job. */
export interface StockItem extends StockSheet {
  /** Stable identity used in results and tie-breaking. */
  id: string
  /** Full sheet or offcut. */
  kind: 'sheet' | 'remnant'
  /** Inner contours. Edge clearance applies to these. */
  holes?: NestableShape[]
}

/** One requested part, possibly in multiple copies. */
export interface PartRequest {
  shape: NestableShape
  /** Copies requested. */
  quantity: number
  /** Restrict rotation to the grain-aligned subset of allowedRotations. */
  grainLocked?: boolean
}

export interface NestRequest {
  /** Placements are confined to these items; ordering is the caller's preference, not a priority. */
  stock: StockItem[]
  parts: PartRequest[]
  /** Instance-to-boundary distance: outer sheet edge and every hole contour. */
  edgeClearance: number
  /** Instance-to-instance boundary distance. */
  partToPartClearance: number
  /** Seed for the deterministic tie-break. */
  seed: number
  /**
   * Optional overrides. `allowedRotations` defaults to DEFAULT_ALLOWED_ROTATIONS
   * ([0, 90, 180, 270]); `algorithm`/`sortBy` select the candidate generators.
   */
  options?: Pick<NestingOptions, 'allowedRotations' | 'algorithm' | 'sortBy' | 'maxSheets'>
}

/** A part that could not be placed, with the reason surfaced to the caller. */
export interface UnplacedPart {
  shapeId: string
  /** Requested copies that were not placed. */
  quantity: number
  /** Explicit non-placement reason (never a bare omission). */
  reason: string
}

export interface NestResponse extends Pick<
  NestingResult,
  'placements' | 'compoundPlacements' | 'sheets' | 'utilization' | 'wasteArea' | 'totalArea'
> {
  /** Every unplaced request, with quantity and reason. */
  unplaced: UnplacedPart[]
  /** Deterministic budget actually consumed. */
  budget: { iterations: number }
  /** Seed echoed back for reproducibility. */
  seed: number
  /** Clearances echoed back so the result is self-describing. */
  edgeClearance: number
  partToPartClearance: number
}

/**
 * Placement coordinates are in stock-item space, in the same unit as the input geometry.
 * Rotation is degrees, always a member of the effective allowed rotation list.
 * No scaling transform is ever applied.
 */
export type PlacementCoordinate = Point2D

/**
 * Runs true-shape nesting. Pure and synchronous: no I/O, no wall-clock dependence.
 * Returns a partial result rather than throwing when parts cannot be placed.
 */
export declare function nestTrueShape(request: NestRequest): NestResponse
