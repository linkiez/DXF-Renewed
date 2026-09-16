/**
 * Nesting Optimization — Objective Validation & Scoring
 *
 * FR-001: the caller supplies four finite weights (material use, travel, sheet count, remnant
 * preference), each `>= 0`, normalized so the effective sum is 1 (compared with `EPSILON`).
 * Invalid input (negative, `NaN`, non-finite, all zero) yields an explicit reason — never silent
 * coercion (Constitution V).
 *
 * `scoreLayout` is the single source of truth for the weighted score: the CPU search and the
 * fixed-point accelerator kernel both consume it, so the two paths can never disagree on ordering.
 *
 * @module nesting/optimization/objective
 */

import type { OptimizationObjective } from '../types'
import { DEFAULT_OBJECTIVE_WEIGHTS, EPSILON } from '../config'

/** The four weight keys, in the stable order used by every comparison and report. */
export const OBJECTIVE_KEYS = [
  'materialUse',
  'travel',
  'sheetCount',
  'remnant',
] as const

export type ObjectiveKey = (typeof OBJECTIVE_KEYS)[number]

/** The normalized outcome of a valid objective. */
export interface NormalizedObjective {
  ok: true
  /** The effective weights, summing to 1 within `EPSILON`. */
  normalized: OptimizationObjective
}

/** A rejected objective carrying the explicit reason surfaced to the caller. */
export interface InvalidObjective {
  ok: false
  reason: string
}

export type ObjectiveResult = NormalizedObjective | InvalidObjective

/**
 * Validates and normalizes a caller objective. Omitted input resolves to the documented defaults
 * (material use only), which preserves feature-002 behavior exactly.
 */
export function normalizeObjective(
  input: OptimizationObjective | undefined,
): ObjectiveResult {
  if (input === undefined) {
    return { ok: true, normalized: { ...DEFAULT_OBJECTIVE_WEIGHTS } }
  }

  for (const key of OBJECTIVE_KEYS) {
    const value = input[key]
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return {
        ok: false,
        reason: `objective.${key} must be a finite number >= 0, got ${String(value)}`,
      }
    }
    if (!Number.isFinite(value)) {
      return {
        ok: false,
        reason: `objective.${key} must be finite, got ${String(value)}`,
      }
    }
    if (value < 0) {
      return {
        ok: false,
        reason: `objective.${key} must be >= 0, got ${value}`,
      }
    }
  }

  const sum =
    input.materialUse + input.travel + input.sheetCount + input.remnant

  if (!(sum > EPSILON)) {
    return {
      ok: false,
      reason:
        'objective weights must not all be zero; at least one weight must exceed EPSILON',
    }
  }

  return {
    ok: true,
    normalized: {
      materialUse: input.materialUse / sum,
      travel: input.travel / sum,
      sheetCount: input.sheetCount / sum,
      remnant: input.remnant / sum,
    },
  }
}

/**
 * Layout metrics, each on a comparable 0–100 scale where higher is better. Built from an
 * arrangement so the weighted score is deterministic and independent of enumeration order.
 */
export interface LayoutMetrics {
  /** Material use as a percentage (placed area / consumed area). */
  materialUse: number
  /** Travel desirability, higher for shorter tool paths. */
  travel: number
  /** Sheet-count desirability, higher for fewer sheets. */
  sheetCount: number
  /** Remnant preference, higher when remnant stock carries more of the consumed area. */
  remnant: number
}

/** Weighted score. With default weights (`materialUse: 1`) this equals the use percentage. */
export function scoreLayout(
  metrics: LayoutMetrics,
  weights: OptimizationObjective,
): number {
  return (
    metrics.materialUse * weights.materialUse +
    metrics.travel * weights.travel +
    metrics.sheetCount * weights.sheetCount +
    metrics.remnant * weights.remnant
  )
}
