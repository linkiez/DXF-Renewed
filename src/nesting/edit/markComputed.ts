import { freshness } from './freshness'
import { layoutKey } from './layoutKey'
import type { DerivedResult, EditState } from './types'

/**
 * Records that a derived result was computed for the layout at the cursor.
 *
 * A result computed from a revision the state has left is discarded: it never becomes current.
 *
 * @param state - Session state.
 * @param result - Derived result that was computed.
 * @param revision - Revision of the state the computation started from.
 * @returns The new state, or the same state with `discarded` true when the revision is stale.
 */
export function markComputed(state: EditState, result: DerivedResult, revision: number): { state: EditState; discarded: boolean } {
  if (revision !== state.revision) return { state, discarded: true }
  const key = layoutKey(state.edits, state.cursor)
  const computedFor = { ...state.computedFor, [result]: key }
  return { state: { ...state, computedFor, freshness: freshness(computedFor, key) }, discarded: false }
}
