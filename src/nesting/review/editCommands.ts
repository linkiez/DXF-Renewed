import { BehaviorSubject } from 'rxjs'
import { commitEdit } from '../edit/commitEdit'
import { createEditState } from '../edit/createEditState'
import { editedCutLayout } from '../edit/editedCutLayout'
import { editedLayout } from '../edit/editedLayout'
import { judgePlacement } from '../edit/judgePlacement'
import { redoEdit } from '../edit/redoEdit'
import { transformMembers } from '../edit/transformMembers'
import { undoEdit } from '../edit/undoEdit'
import { layoutKey } from '../edit/layoutKey'
import { originalResults } from '../edit/originalResults'
import type { RiskRequest, RiskResult } from '../risk/types'
import type { CandidateEdit, EditInput, EditNotice, EditState } from '../edit/types'
import type { CutPlanResult } from '../cutPath/types'
import { messages } from './messages'
import { ghostOverlay } from './overlay'
import { startRecompute } from './startRecompute'
import type { RecomputeConfig } from './startRecompute'
import type { EditPanelState, ReviewEditHandle, ReviewInput, ReviewOverlay } from './types'

/** Collaborators of an edit handle; the handle itself never touches the DOM. */
export interface EditHandleArgs {
  input: EditInput
  /** Process profile, cost model and risk profile used to recompute the edited layout. */
  recompute?: RecomputeConfig
  /** Called with the input of the new scene after a confirmed edit, an undo or a redo. */
  onScene(input: ReviewInput): void
  /** Called with the overlay to draw, or `null` to clear it. */
  onOverlay(overlay: ReviewOverlay | null): void
  /** Called with a text for the live region. */
  onAnnounce(text: string): void
  /** Called with the new panel state after every change. */
  onChange?(state: EditPanelState): void
}

const OFF = 'off' as const

const ALL_CURRENT = { plan: 'current', cost: 'current', validation: 'current', risk: 'current' } as const

const BASE: EditPanelState = {
  mode: OFF,
  activePart: null,
  candidate: null,
  verdict: null,
  riskStatus: 'none',
  notices: [],
  freshness: ALL_CURRENT,
  planVisible: true,
  canUndo: false,
  canRedo: false,
  recomputing: false,
  comparison: null,
  risk: null,
  riskRequest: null,
}

const derivedOf = (session: EditState | null): Pick<EditPanelState, 'freshness' | 'planVisible' | 'canUndo' | 'canRedo'> => ({
  freshness: session?.freshness ?? ALL_CURRENT,
  planVisible: session ? session.freshness.plan === 'current' : true,
  canUndo: session ? session.cursor > 0 : false,
  canRedo: session ? session.cursor < session.edits.length : false,
})

const panelOf = (session: EditState | null, patch: Partial<EditPanelState>, previous: EditPanelState | null): EditPanelState => ({
  ...(previous ?? BASE),
  ...derivedOf(session),
  ...patch,
})

const sceneOf = (session: EditState, plans: ReadonlyMap<string, CutPlanResult>): ReviewInput => ({
  artifact: { ...session.input.artifact, layout: editedLayout(session) },
  layout: editedCutLayout(session) ?? undefined,
  cutPlan: session.freshness.plan === 'current' ? plans.get(layoutKey(session.edits, session.cursor)) : undefined,
})

/**
 * Creates the edit commands of a review: propose a candidate position, confirm it when valid, undo
 * and redo, with the ghost overlay and the announcements delegated to the caller.
 *
 * The handle owns the edit state and never mutates the input. A confirmed edit, an undo or a redo
 * hands a new scene input to `onScene`; until the cut plan is recomputed that input carries no plan.
 *
 * @param args - Input and callbacks.
 * @returns The edit handle; an invalid artifact leaves it off with the reasons in its state.
 * @example
 * ```typescript
 * const handle = createEditHandle({ input, onScene, onOverlay, onAnnounce })
 * handle.enter()
 * ```
 */
export function createEditHandle(args: EditHandleArgs): ReviewEditHandle {
  const created = createEditState(args.input)
  let session = created.state
  let announcedValid: boolean | null = null
  const plans = new Map<string, CutPlanResult>(args.input.cutPlan ? [['', args.input.cutPlan]] : [])
  let running: { unsubscribe(): void } | null = null
  const risks = new Map<string, { result: RiskResult; request: RiskRequest }>()
  const original = args.recompute?.riskProfile ? originalResults(args.input, undefined, args.recompute.riskProfile).risk : undefined
  if (original && args.input.cutPlan && args.recompute?.riskProfile) {
    risks.set('', { result: original, request: { artifact: args.input.artifact, layout: args.input.layout, cutPlan: args.input.cutPlan, profile: args.recompute.riskProfile } })
  }
  const riskNow = (): { result: RiskResult; request: RiskRequest } | null =>
    session && session.freshness.risk === 'current' ? (risks.get(layoutKey(session.edits, session.cursor)) ?? null) : null
  const subject = new BehaviorSubject<EditPanelState>(panelOf(session, {
    notices: created.notices,
    risk: original ?? null,
    riskStatus: original?.status ?? 'none',
    riskRequest: risks.get('')?.request ?? null,
  }, null))

  const emit = (patch: Partial<EditPanelState>): void => {
    const risk = riskNow()
    const next = panelOf(session, { risk: risk?.result ?? null, riskStatus: risk?.result.status ?? 'none', riskRequest: risk?.request ?? null, ...patch }, subject.value)
    subject.next(next)
    args.onChange?.(next)
  }
  const active = (): boolean => session !== null && subject.value.mode === 'edit'
  const clearCandidate = (): void => {
    announcedValid = null
    args.onOverlay(null)
    emit({ candidate: null, verdict: null })
  }
  const publishScene = (): void => {
    if (session) args.onScene(sceneOf(session, plans))
    announcedValid = null
    args.onOverlay(null)
    emit({ candidate: null, verdict: null })
  }

  const propose = (candidate: CandidateEdit | null): void => {
    if (!session || !active()) return
    if (candidate === null) return clearCandidate()
    const verdict = judgePlacement(session, candidate)
    const outline = transformMembers(session.working, candidate).parts[0].outlines[0]
    args.onOverlay(ghostOverlay(outline, verdict))
    if (announcedValid !== verdict.valid) {
      announcedValid = verdict.valid
      args.onAnnounce(verdict.valid
        ? messages.edit.announceVerdictValid(candidate.partKey)
        : messages.edit.announceVerdictInvalid(candidate.partKey, verdict.violations.map((v) => v.message)))
    }
    emit({ activePart: candidate.partKey, candidate, verdict })
  }

  const confirm = (): void => {
    const { candidate, verdict } = subject.value
    if (!session || !candidate) return
    if (!verdict?.valid) return args.onAnnounce(messages.edit.announceRefused())
    const result = commitEdit(session, candidate)
    const refusals: EditNotice[] = result.notices
    if (result.state === session) return emit({ notices: refusals })
    session = result.state
    publishScene()
    emit({ notices: refusals })
    args.onAnnounce(messages.edit.announceConfirmed(candidate.partKey))
  }

  const step = (move: (state: EditState) => EditState, text: string): void => {
    if (!session || !active()) return
    const next = move(session)
    if (next === session) return
    session = next
    publishScene()
    args.onAnnounce(text)
  }

  return {
    edit$: subject.asObservable(),
    enter() {
      if (!session) return
      emit({ mode: 'edit' })
      args.onAnnounce(messages.edit.announceEntered())
    },
    leave() {
      if (!session) return
      args.onOverlay(null)
      announcedValid = null
      emit({ mode: OFF, candidate: null, verdict: null })
      args.onAnnounce(messages.edit.announceLeft())
    },
    selectPart(partKey) {
      if (!active() || (partKey !== null && !session?.working.parts.has(partKey))) return
      args.onOverlay(null)
      announcedValid = null
      emit({ activePart: partKey, candidate: null, verdict: null })
    },
    propose,
    confirm,
    cancel() {
      if (!active()) return
      clearCandidate()
      args.onAnnounce(messages.edit.announceCancelled())
    },
    undo: () => step(undoEdit, messages.edit.announceUndone()),
    redo: () => step(redoEdit, messages.edit.announceRedone()),
    recompute() {
      if (!session || !active()) return
      if (!args.recompute) return args.onAnnounce(messages.edit.recomputeUnavailable)
      running?.unsubscribe()
      running = startRecompute({
        input: args.input,
        config: args.recompute,
        session: () => session,
        update: (next) => {
          session = next
          emit({})
        },
        plans,
        risks,
        onPlan: publishScene,
        emit,
        announce: args.onAnnounce,
      })
    },
    dispose() {
      running?.unsubscribe()
      subject.complete()
    },
  }
}
