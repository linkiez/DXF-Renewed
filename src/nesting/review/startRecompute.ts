import { asyncScheduler, observeOn } from 'rxjs'
import type { Subscription } from 'rxjs'
import type { CostModel } from '../cost/types'
import type { CutProcessProfile, CutPlanResult } from '../cutPath/types'
import { compareLayouts } from '../edit/compareLayouts'
import { editedCutLayout } from '../edit/editedCutLayout'
import { editedLayout } from '../edit/editedLayout'
import { layoutKey } from '../edit/layoutKey'
import { markComputed } from '../edit/markComputed'
import { notice } from '../edit/notice'
import { originalResults } from '../edit/originalResults'
import { recomputeEdited } from '../edit/recomputeEdited'
import type { ComparisonInputs, EditInput, EditNotice, EditState, RecomputeStep } from '../edit/types'
import type { CutRiskProfile, RiskRequest, RiskResult } from '../risk/types'
import { messages } from './messages'
import type { EditPanelState } from './types'

/** Inputs of a recomputation of the edited layout. */
export interface RecomputeConfig {
  processProfile: CutProcessProfile
  costModel?: CostModel
  riskProfile?: CutRiskProfile
}

/** What a recomputation reads and changes in the edit handle. */
export interface RecomputeDeps {
  input: EditInput
  config: RecomputeConfig
  session(): EditState | null
  update(state: EditState): void
  /** Plans by layout key; a current plan is shown, an outdated one never. */
  plans: Map<string, CutPlanResult>
  /** Risk results by layout key, with the inputs they were assessed from. */
  risks: Map<string, { result: RiskResult; request: RiskRequest }>
  /** Called when the plan of the displayed layout is ready, so the scene can be rebuilt with it. */
  onPlan(): void
  emit(patch: Partial<EditPanelState>): void
  announce(text: string): void
}

const RESULT_OF = { plan: 'plan', cost: 'cost', risk: 'risk' } as const

const riskRequestOf = (deps: RecomputeDeps, state: EditState, key: string): RiskRequest => ({
  artifact: { ...state.input.artifact, layout: editedLayout(state) },
  layout: editedCutLayout(state) ?? undefined,
  cutPlan: deps.plans.get(key) as CutPlanResult,
  profile: deps.config.riskProfile as CutRiskProfile,
})

const keep = (results: Map<string, ComparisonInputs>, key: string, step: RecomputeStep): void => {
  const current = results.get(key) ?? {}
  if (step.step === 'cost') results.set(key, { ...current, production: step.result?.production ?? null, breakdown: step.result?.breakdown ?? null })
  if (step.step === 'risk') results.set(key, { ...current, risk: step.result ?? null })
}

/**
 * Starts a recomputation of the edited layout and applies each step as it arrives.
 *
 * Steps are delivered on separate turns of the event loop, so the user can edit in between; a step
 * that started from an older revision is discarded, never marks a result current and ends the run
 * with `RECOMPUTE_DISCARDED`. When the run completes the layout is compared with the original.
 *
 * @param deps - Input, configuration and the callbacks into the edit handle.
 * @returns The subscription of the run.
 */
export function startRecompute(deps: RecomputeDeps): Subscription {
  const results = new Map<string, ComparisonInputs>()
  const notices: EditNotice[] = []
  const state = deps.session() as EditState
  const finish = (): void => {
    const current = deps.session() as EditState
    const key = layoutKey(current.edits, current.cursor)
    const comparison = compareLayouts({
      state: current,
      original: originalResults(deps.input, deps.config.costModel, deps.config.riskProfile),
      edited: results.get(key) ?? {},
    })
    deps.emit({ recomputing: false, comparison, notices: [...notices, ...comparison.notices] })
    deps.announce(messages.edit.announceRecomputeDone())
  }
  deps.emit({ recomputing: true, notices: [] })
  const run = recomputeEdited({ state, ...deps.config }).pipe(observeOn(asyncScheduler)).subscribe({
    next: (step) => {
      const session = deps.session() as EditState
      const marked = markComputed(session, RESULT_OF[step.step], step.revision)
      if (marked.discarded) {
        notices.push(notice('warning', 'RECOMPUTE_DISCARDED', { detail: step.step }))
        deps.emit({ recomputing: false, notices: [...notices] })
        deps.announce(messages.edit.announceRecomputeDiscarded())
        run.unsubscribe()
        return
      }
      notices.push(...step.notices)
      if (step.status !== 'current') return
      const key = layoutKey(marked.state.edits, marked.state.cursor)
      let next = marked.state
      if (step.step === 'plan' && step.result) {
        deps.plans.set(key, step.result)
        next = markComputed(next, 'validation', step.revision).state
        deps.update(next)
        deps.onPlan()
        return
      }
      if (step.step === 'risk' && step.result) deps.risks.set(key, { result: step.result, request: riskRequestOf(deps, marked.state, key) })
      keep(results, key, step)
      deps.update(next)
    },
    complete: () => {
      if (!run.closed) finish()
    },
  })
  return run
}
