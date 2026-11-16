import type { CutAction, CutPlanResult } from '../cutPath/types'
import type { EditNotice, EditState } from './types'
import { notice } from './notice'

const pairKey = (action: CutAction): string => `${action.metadata?.firstContourId}|${action.metadata?.secondContourId}`

const pairsOf = (result: CutPlanResult | undefined): Set<string> => {
  const plans = result?.plans ?? (result?.plan ? [result.plan] : [])
  const commonLines = plans.flatMap((plan) => plan.actions).filter((action) => action.kind === 'common-line')
  return new Set(commonLines.map(pairKey))
}

const ownerOf = (state: EditState, contourId: string): string | undefined => {
  for (const part of state.working.parts.values()) if (part.contourIds.includes(contourId)) return part.key
  return undefined
}

/**
 * Finds the common lines of the original plan that the edited plan no longer has and that involve a
 * part that was moved.
 *
 * @param state - Session state.
 * @param next - Plan computed for the edited layout.
 * @returns One `COMMON_LINE_BROKEN` notice per moved part that lost a shared line.
 */
export function commonLinesBroken(state: EditState, next: CutPlanResult): EditNotice[] {
  const kept = pairsOf(next)
  const moved = new Set(state.edits.slice(0, state.cursor).map((edit) => edit.partKey))
  const broken = new Set<string>()
  for (const pair of pairsOf(state.input.cutPlan)) {
    if (kept.has(pair)) continue
    for (const contourId of pair.split('|')) {
      const owner = ownerOf(state, contourId)
      if (owner !== undefined && moved.has(owner)) broken.add(owner)
    }
  }
  return [...broken].sort().map((partKey) => notice('warning', 'COMMON_LINE_BROKEN', { partKey }))
}
