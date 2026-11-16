import { buildCostBreakdown } from '../cost/buildCostBreakdown'
import type { CostModel } from '../cost/types'
import { assessCutRisk } from '../risk/assessCutRisk'
import type { CutRiskProfile } from '../risk/types'
import type { ComparisonInputs, EditInput } from './types'

/**
 * Computes the cost and risk results of the original layout with the plan the session started
 * from, so an edited layout can be compared with it. A result that cannot be computed is left out.
 *
 * @param input - Session input, with the original cut plan.
 * @param costModel - Cost model, when the cost is compared.
 * @param riskProfile - Risk profile, when the risk is compared.
 * @returns The original production report, cost breakdown and risk result that could be computed.
 */
export function originalResults(input: EditInput, costModel?: CostModel, riskProfile?: CutRiskProfile): ComparisonInputs {
  const { artifact, layout, cutPlan } = input
  const results: ComparisonInputs = {}
  if (!cutPlan) return results
  try {
    if (costModel) {
      const cost = buildCostBreakdown({ artifact, layout, cutPlan, costModel })
      results.production = cost.production
      results.breakdown = cost.breakdown
    }
    if (riskProfile) results.risk = assessCutRisk({ artifact, layout, cutPlan, profile: riskProfile })
  } catch {
    return results
  }
  return results
}
