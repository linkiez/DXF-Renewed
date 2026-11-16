import { moveCursor } from './moveCursor'
import type { EditState } from './types'

/**
 * Steps forward in the edit log, reapplying the next edit.
 *
 * @param state - Session state.
 * @returns The state one edit later; the same state at the end of the log.
 */
export function redoEdit(state: EditState): EditState {
  return state.cursor >= state.edits.length ? state : moveCursor(state, state.cursor + 1)
}
