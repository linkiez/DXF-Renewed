import { freshness } from './freshness'
import { layoutKey } from './layoutKey'
import { replayEdits } from './replayEdits'
import type { EditState } from './types'

/**
 * Moves the cursor of the log to `cursor` and rebuilds the layout by replaying the log from the base.
 *
 * @param state - Session state.
 * @param cursor - Target cursor in `0..edits.length`.
 * @returns A state at the new cursor with a new revision.
 */
export function moveCursor(state: EditState, cursor: number): EditState {
  return {
    ...state,
    cursor,
    revision: state.revision + 1,
    working: replayEdits(state.baseWorking, state.edits, cursor),
    freshness: freshness(state.computedFor, layoutKey(state.edits, cursor)),
  }
}
