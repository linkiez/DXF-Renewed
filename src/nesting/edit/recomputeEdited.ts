import { defer, from } from 'rxjs'
import type { Observable } from 'rxjs'
import { buildCostBreakdown } from '../cost/buildCostBreakdown'
import { planCutPath } from '../cutPath/plan'
import type { CutPlanResult } from '../cutPath/types'
import { assessCutRisk } from '../risk/assessCutRisk'
import { commonLinesBroken } from './commonLinesBroken'
import { editedCutLayout } from './editedCutLayout'
import { editedLayout } from './editedLayout'
import { notice } from './notice'
import type { EditNotice, RecomputeRequest, RecomputeStep } from './types'

type Step<K extends RecomputeStep['step']> = Extract<RecomputeStep, { step: K }>

const reasonOf = (error: unknown): string => (error instanceof Error ? error.message : String(error))

const planStep = (request: RecomputeRequest): Step<'plan'> => {
  const { state } = request
  const layout = editedCutLayout(state)
  const base = { step: 'plan' as const, revision: state.revision }
  if (!layout) return { ...base, status: 'unavailable', notices: [notice('error', 'PLAN_RECOMPUTE_FAILED', { detail: 'não há layout de corte' })] }
  try {
    const result = planCutPath(layout, request.processProfile)
    const broken = commonLinesBroken(state, result)
    return result.valid
      ? { ...base, status: 'current', result, notices: broken }
      : { ...base, status: 'unavailable', result, notices: [notice('error', 'PLAN_RECOMPUTE_FAILED', { detail: result.problems[0]?.message ?? 'plano inválido' }), ...broken] }
  } catch (error) {
    return { ...base, status: 'unavailable', notices: [notice('error', 'PLAN_RECOMPUTE_FAILED', { detail: reasonOf(error) })] }
  }
}

const costStep = (request: RecomputeRequest, plan: Step<'plan'>): Step<'cost'> => {
  const { state } = request
  const base = { step: 'cost' as const, revision: state.revision }
  const failed = (detail: string): Step<'cost'> => ({ ...base, status: 'unavailable', notices: [notice('error', 'COST_RECOMPUTE_FAILED', { detail })] })
  if (plan.status !== 'current' || !plan.result) return failed('o plano de corte não está disponível')
  try {
    const result = buildCostBreakdown({
      artifact: { ...state.input.artifact, layout: editedLayout(state) },
      layout: editedCutLayout(state) ?? undefined,
      cutPlan: plan.result,
      costModel: request.costModel as NonNullable<RecomputeRequest['costModel']>,
    })
    if (!result.breakdown) return failed(result.notices[0]?.message ?? 'sem detalhamento')
    return { ...base, status: 'current', result: { breakdown: result.breakdown, production: result.production }, notices: [] }
  } catch (error) {
    return failed(reasonOf(error))
  }
}

const riskStep = (request: RecomputeRequest, plan: Step<'plan'>): Step<'risk'> => {
  const { state } = request
  const base = { step: 'risk' as const, revision: state.revision }
  const failed = (detail: string): Step<'risk'> => ({ ...base, status: 'unavailable', notices: [notice('warning', 'RISK_UNAVAILABLE', { detail })] })
  if (plan.status !== 'current' || !plan.result) return failed('o plano de corte não está disponível')
  try {
    const result = assessCutRisk({
      artifact: { ...state.input.artifact, layout: editedLayout(state) },
      layout: editedCutLayout(state) ?? undefined,
      cutPlan: plan.result as CutPlanResult,
      profile: request.riskProfile as NonNullable<RecomputeRequest['riskProfile']>,
    })
    if (result.status === 'unavailable') return failed(result.notices[0]?.message ?? 'avaliação indisponível')
    return { ...base, status: 'current', result, notices: [] as EditNotice[] }
  } catch (error) {
    return failed(reasonOf(error))
  }
}

function* steps(request: RecomputeRequest): Generator<RecomputeStep> {
  const plan = planStep(request)
  yield plan
  if (request.costModel !== undefined) yield costStep(request, plan)
  if (request.riskProfile !== undefined) yield riskStep(request, plan)
}

/**
 * Recomputes what depends on the edited layout: the cut plan, then the cost and the risk when a cost
 * model and a risk profile are supplied.
 *
 * Each step carries the revision it started from, so a consumer can discard a step when the state has
 * moved on. A failed step keeps the edited layout, reports its reason and leaves the steps that depend
 * on it unavailable. Cold: every subscription recomputes. Inputs are never mutated.
 *
 * @param request - Session state, process profile and the optional cost model and risk profile.
 * @returns Observable that emits one step per requested result and completes.
 * @throws {TypeError} In the error channel when the request has no state.
 * @example
 * ```typescript
 * recomputeEdited({ state, processProfile, costModel }).subscribe((step) => console.log(step.step, step.status))
 * ```
 */
export function recomputeEdited(request: RecomputeRequest): Observable<RecomputeStep> {
  return defer(() => {
    if (!request?.state) throw new TypeError('recomputeEdited needs the state of an edit session')
    return from(steps(request))
  })
}
