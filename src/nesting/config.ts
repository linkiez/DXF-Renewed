/**
 * Nesting Configuration Defaults
 *
 * Sensible defaults for nesting operations.
 */

import type {
  NestingOptions,
  NestingAlgorithm,
  OptimizationObjective,
  SortStrategy,
  StockSheet,
} from './types'

// ─────────────────────────────────────────────
// Default Values
// ─────────────────────────────────────────────

/** Default stock sheet size (mm) — common CNC plate */
export const DEFAULT_SHEET_WIDTH = 3000
export const DEFAULT_SHEET_HEIGHT = 2000

/** Default kerf (cut width) in mm */
export const DEFAULT_KERF = 2.0

/** Default margin from sheet edge in mm */
export const DEFAULT_MARGIN = 10.0

/** Default allowed rotation angles (degrees) */
export const DEFAULT_ALLOWED_ROTATIONS = [0, 90, 180, 270] as const

/** Default nesting algorithm */
export const DEFAULT_ALGORITHM: NestingAlgorithm = 'guillotine'

/** Default sort strategy */
export const DEFAULT_SORT_BY: SortStrategy = 'area-desc'

/** Maximum sheets by default (no limit = 0) */
export const DEFAULT_MAX_SHEETS = 0

/** Default curve approximation segments per 360° */
export const DEFAULT_CURVE_SEGMENTS = 36

/** Default clearance between a part instance and any stock boundary — the outer sheet edge
 * and every hole contour — in mm (FR-001) */
export const DEFAULT_EDGE_CLEARANCE = DEFAULT_MARGIN

/** Default clearance between the boundaries of two placed part instances, in mm (FR-002) */
export const DEFAULT_PART_TO_PART_CLEARANCE = DEFAULT_KERF

/** Multiplier over the input-derived search size giving the deterministic node/iteration
 * budget (FR-005, FR-007). Input-derived only — wall-clock time is never a term. */
export const DEFAULT_SEARCH_BUDGET_FACTOR = 1000

/** Tolerance for floating point comparisons */
export const EPSILON = 1e-6

// ─────────────────────────────────────────────
// Optimization & Acceleration (feature 003)
// ─────────────────────────────────────────────

/**
 * Default objective weights (FR-001). Material use carries the full weight, so an omitted
 * objective reproduces feature-002 behavior exactly; the other terms are opt-in trade-offs.
 */
export const DEFAULT_OBJECTIVE_WEIGHTS: OptimizationObjective = {
  materialUse: 1,
  travel: 0,
  sheetCount: 0,
  remnant: 0,
}

/**
 * Acceleration defaults on (FR-004): detection runs and WebGPU is preferred when available.
 * Callers opt out with `acceleration: false`.
 */
export const DEFAULT_ACCELERATION = true

// ─────────────────────────────────────────────
// Default Configuration
// ─────────────────────────────────────────────

/** Default stock sheet */
export const DEFAULT_STOCK_SHEET: StockSheet = {
  width: DEFAULT_SHEET_WIDTH,
  height: DEFAULT_SHEET_HEIGHT,
}

/** Default nesting options */
export const DEFAULT_NESTING_OPTIONS: NestingOptions = {
  stockSheet: DEFAULT_STOCK_SHEET,
  algorithm: DEFAULT_ALGORITHM,
  allowedRotations: [...DEFAULT_ALLOWED_ROTATIONS],
  kerf: DEFAULT_KERF,
  margin: DEFAULT_MARGIN,
  sortBy: DEFAULT_SORT_BY,
  maxSheets: DEFAULT_MAX_SHEETS,
  respectLayers: false,
  respectGrain: false,
  curveSegments: DEFAULT_CURVE_SEGMENTS,
  computeConvexHull: false,
}

// ─────────────────────────────────────────────
// Validation Helpers
// ─────────────────────────────────────────────

/** Validate and normalize nesting options */
export function validateNestingOptions(
  partial: Partial<NestingOptions> = {},
): NestingOptions {
  const merged: NestingOptions = {
    ...DEFAULT_NESTING_OPTIONS,
    ...partial,
    kerf: partial.kerf ?? DEFAULT_KERF,
    margin: partial.margin ?? DEFAULT_MARGIN,
    allowedRotations: partial.allowedRotations ?? [
      ...DEFAULT_ALLOWED_ROTATIONS,
    ],
  }

  const kerf = merged.kerf ?? DEFAULT_KERF
  const margin = merged.margin ?? DEFAULT_MARGIN
  merged.kerf = kerf
  merged.margin = margin

  // Normalize stockSheet to array
  if (!Array.isArray(merged.stockSheet)) {
    merged.stockSheet = [merged.stockSheet]
  }

  // Validate sheet dimensions
  for (const sheet of merged.stockSheet) {
    if (sheet.width <= 0 || sheet.height <= 0) {
      throw new Error(
        `Stock sheet must have positive dimensions, got ${sheet.width}x${sheet.height}`,
      )
    }
  }

  // Validate kerf
  if (kerf < 0) {
    throw new Error(`Kerf must be non-negative, got ${kerf}`)
  }

  // Validate margin
  if (margin < 0) {
    throw new Error(`Margin must be non-negative, got ${margin}`)
  }

  // Validate rotations
  if (merged.allowedRotations && merged.allowedRotations.length === 0) {
    merged.allowedRotations = [...DEFAULT_ALLOWED_ROTATIONS]
  }

  // Validate maxSheets
  if (merged.maxSheets !== undefined && merged.maxSheets < 0) {
    throw new Error(`maxSheets must be non-negative, got ${merged.maxSheets}`)
  }

  // Validate algorithm
  const validAlgorithms: NestingAlgorithm[] = [
    'guillotine',
    'maxrects',
    'shelf',
    'bliss',
  ]
  if (merged.algorithm && !validAlgorithms.includes(merged.algorithm)) {
    throw new Error(
      `Unknown algorithm "${merged.algorithm}". Valid: ${validAlgorithms.join(', ')}`,
    )
  }

  // Validate sortBy
  const validSorts: SortStrategy[] = [
    'area-desc',
    'area-asc',
    'perimeter-desc',
    'none',
  ]
  if (merged.sortBy && !validSorts.includes(merged.sortBy)) {
    throw new Error(
      `Unknown sort strategy "${merged.sortBy}". Valid: ${validSorts.join(', ')}`,
    )
  }

  return merged
}

/** Parse sheet size string "WxH" to StockSheet */
export function parseSheetSize(input: string): StockSheet {
  const match = input.match(/^(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)$/)
  if (!match) {
    throw new Error(
      `Invalid sheet size format: "${input}". Expected "WxH" (e.g., "3000x2000")`,
    )
  }
  return {
    width: Number.parseFloat(match[1]),
    height: Number.parseFloat(match[2]),
  }
}

/** Parse rotation angles from string "0,90,180,270" */
export function parseRotations(input: string): number[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      const n = Number.parseFloat(s)
      if (Number.isNaN(n)) {
        throw new Error(`Invalid rotation angle: "${s}"`)
      }
      return n
    })
}
