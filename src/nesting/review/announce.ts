import { inspect } from './inspect'
import { messages } from './messages'
import type { ReviewScene, ReviewState } from './types'

const sameSelection = (a: ReviewState['selection'], b: ReviewState['selection']): boolean =>
  JSON.stringify(a) === JSON.stringify(b)

/**
 * Chooses the announcement for the live region after a state change.
 *
 * @param scene - Review scene.
 * @param previous - State before the change, or `null` for the first state.
 * @param state - State after the change.
 * @returns Announcement in Brazilian Portuguese, or `null` when nothing worth announcing changed.
 */
export function announcementFor(scene: ReviewScene, previous: ReviewState | null, state: ReviewState): string | null {
  if (!previous) return null
  if (state.sheetId !== previous.sheetId) return messages.announceSheet(state.sheetId)
  if (state.renderer !== previous.renderer) return messages.announceRendererFallback()
  if (state.playing !== previous.playing) return state.playing ? messages.announcePlaying() : messages.announcePaused()
  if (!sameSelection(state.selection, previous.selection)) {
    return state.selection
      ? messages.announceSelection(inspect(scene, state.selection).title)
      : messages.announceSelectionCleared()
  }
  if (!state.playing && state.position.actionIndex !== previous.position.actionIndex) {
    const total = scene.sheets.find((sheet) => sheet.id === state.sheetId)?.timeline?.actions.length ?? 0
    return messages.announceSeek(Math.min(state.position.actionIndex + 1, total), total)
  }
  return null
}
