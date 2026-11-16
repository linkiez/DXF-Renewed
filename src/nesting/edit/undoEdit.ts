import { moveCursor } from './moveCursor'
import type { EditState } from './types'

/**
 * Steps back in the edit log, restoring the layout exactly as it was.
 *
 * @param state - Session state.
 * @returns The state one edit earlier; the same state when nothing is applied.
 */
export function undoEdit(state: EditState): EditState {
  return state.cursor === 0 ? state : moveCursor(state, state.cursor - 1)
}
