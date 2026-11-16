import { actionPrefix } from './actionPrefix'
import type { ReviewPosition, ReviewScene, ReviewToolState } from './types'

/**
 * Derives the displayed tool state for a position: head, completed actions and current action.
 *
 * This is the only place the displayed state is computed, so every renderer and every way of
 * reaching a position (play, seek, step) shows the same thing.
 *
 * @param scene - Review scene.
 * @param position - Position on one of its sheets.
 * @returns Head point, number of completed actions and the current action.
 */
export function stateAt(scene: ReviewScene, position: ReviewPosition): ReviewToolState {
  const actions = scene.sheets.find((sheet) => sheet.id === position.sheetId)?.timeline?.actions ?? []
  if (actions.length === 0) return { head: null, completed: 0, current: null }
  const index = Math.min(actions.length, Math.max(0, Math.trunc(position.actionIndex)))
  if (index >= actions.length) {
    const last = actionPrefix(actions[actions.length - 1], 1)
    return { head: last.length > 0 ? last[last.length - 1] : null, completed: actions.length, current: null }
  }
  const current = actions[index]
  const progress = Math.min(Math.max(position.progress, 0), 1)
  const prefix = actionPrefix(current, progress)
  return { head: prefix.length > 0 ? prefix[prefix.length - 1] : null, completed: index, current }
}
