import { applyEdit } from './applyEdit'
import { freshness } from './freshness'
import { judgePlacement } from './judgePlacement'
import { layoutKey } from './layoutKey'
import { notice } from './notice'
import type { CandidateEdit, CommitResult } from './types'
import type { EditState } from './types'

/**
 * Confirms a candidate edit when its verdict is valid.
 *
 * A valid edit is appended at the cursor, the redo branch is discarded, the revision increases and
 * every derived result becomes outdated. An invalid edit leaves the state untouched and returns
 * its verdict; a full log refuses the edit with `EDIT_LOG_FULL` instead of dropping history.
 *
 * @param state - Session state.
 * @param edit - Candidate edit.
 * @returns The new state (the same one when nothing was applied), the verdict and any notices.
 * @throws {RangeError} When the part key is not in the session.
 * @example
 * ```typescript
 * const { state: next, verdict } = commitEdit(state, { partKey: 'part-1#0', kind: 'rotate', delta: { degrees: 90 } })
 * ```
 */
export function commitEdit(state: EditState, edit: CandidateEdit): CommitResult {
  const verdict = judgePlacement(state, edit)
  if (!verdict.valid) return { state, verdict, notices: [] }
  if (state.cursor + 1 > state.maxLogLength) {
    return { state, verdict, notices: [notice('warning', 'EDIT_LOG_FULL', { limit: state.maxLogLength })] }
  }
  const applied = applyEdit(state.working, edit)
  const edits = [...state.edits.slice(0, state.cursor), applied.edit]
  const cursor = state.cursor + 1
  const next: EditState = {
    ...state,
    edits,
    cursor,
    revision: state.revision + 1,
    working: applied.working,
    freshness: freshness(state.computedFor, layoutKey(edits, cursor)),
  }
  return { state: next, verdict, notices: [] }
}
