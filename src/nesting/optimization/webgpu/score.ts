/**
 * Nesting Optimization — Fixed-Point Scoring Kernel
 *
 * The accelerator only *proposes* an ordering: it converts the same normalized weights and layout
 * metrics used by the CPU into stable fixed-point integers and returns candidate indices in a
 * deterministic order. Selection, tie-breaking and validation stay on the CPU baseline
 * (Constitution IV, FR-001/FR-003).
 *
 * @module nesting/optimization/webgpu/score
 */

import type { OptimizationObjective } from '../../types'
import { scoreLayout, type LayoutMetrics } from '../objective'

/** Fixed-point scale: weights and metrics are ~0–100, so scores stay exact integers here. */
export const FIXED_POINT_SCALE = 1_000_000

/** Scores one candidate as a stable integer for hardware and software parity. */
export function fixedPointScore(
  metrics: LayoutMetrics,
  weights: OptimizationObjective,
): number {
  return Math.round(scoreLayout(metrics, weights) * FIXED_POINT_SCALE)
}

/** One indexed candidate proposal. */
export interface CandidateProposal {
  index: number
  score: number
}

/**
 * Ranks candidates best-first with a total order: descending score, then ascending index. The
 * index tie-break makes the proposal deterministic regardless of the underlying executor.
 */
export function proposeOrder(
  candidates: readonly LayoutMetrics[],
  weights: OptimizationObjective,
): CandidateProposal[] {
  return candidates
    .map((metrics, index) => ({
      index,
      score: fixedPointScore(metrics, weights),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
}
