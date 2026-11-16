import type { RiskCategory } from '../risk/types'
import { createEditState } from './createEditState'
import { judgePlacement } from './judgePlacement'
import { notice } from './notice'
import type { CompareRequest, ComparisonInputs, ComparisonSummary, DerivedResult, EditNotice, EditState, FigureDelta } from './types'

const CATEGORIES: RiskCategory[] = ['heat', 'thin-web', 'loose-part', 'head-strike']

const figure = (before: number | null, after: number | null): FigureDelta => ({
  before,
  after,
  delta: before !== null && after !== null ? after - before : null,
})

const invalidParts = (state: EditState | null): number | null => {
  if (!state) return null
  return state.working.order.filter((key) => !judgePlacement(state, { partKey: key, kind: 'move', delta: { dx: 0, dy: 0 } }).valid).length
}

const secondsOf = (inputs: ComparisonInputs): number | null => inputs.production?.time.job.totalSeconds ?? null
const costOf = (inputs: ComparisonInputs): number | null => inputs.breakdown?.job.total.amount ?? null
const riskOf = (inputs: ComparisonInputs, category: RiskCategory): number | null =>
  !inputs.risk || inputs.risk.status === 'unavailable' ? null : inputs.risk.findings.filter((finding) => finding.category === category).length

const stale = (state: EditState, result: DerivedResult): boolean => state.freshness[result] !== 'current'

const staleNotices = (state: EditState): EditNotice[] => {
  const groups: [DerivedResult, string][] = [['cost', 'tempo de corte'], ['cost', 'custo'], ['risk', 'risco']]
  return groups.filter(([result]) => stale(state, result)).map(([, label]) => notice('info', 'FIGURE_OUTDATED', { detail: label }))
}

/**
 * Compares the edited layout with the original: parts that violate a rule, cut time, cost and the
 * number of risk findings per category.
 *
 * A figure that is outdated or unavailable on either side is `null` with a notice, never a number.
 * The original side is always the layout before any edit.
 *
 * @param request - Session state and the results computed for each side.
 * @returns The summary with before, after and difference of each figure.
 * @example
 * ```typescript
 * const summary = compareLayouts({ state, original: { production }, edited: { production: next } })
 * ```
 */
export function compareLayouts(request: CompareRequest): ComparisonSummary {
  const { state } = request
  const original = createEditState(state.input).state
  const costFresh = !stale(state, 'cost')
  const riskFresh = !stale(state, 'risk')
  return {
    invalidParts: figure(invalidParts(original), invalidParts(state)),
    cutSeconds: figure(secondsOf(request.original), costFresh ? secondsOf(request.edited) : null),
    cost: figure(costOf(request.original), costFresh ? costOf(request.edited) : null),
    risk: Object.fromEntries(CATEGORIES.map((category) => [
      category,
      figure(riskOf(request.original, category), riskFresh ? riskOf(request.edited, category) : null),
    ])) as Record<RiskCategory, FigureDelta>,
    notices: staleNotices(state),
  }
}
