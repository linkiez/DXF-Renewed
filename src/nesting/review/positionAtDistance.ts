import type { ReviewPosition, ReviewTimeline } from './types'

/**
 * Maps a distance on the playback axis to a review position.
 *
 * Every action has a positive span, so the mapping is one to one: the start of an action maps to
 * `{ actionIndex, progress: 0 }` and distances past the end map to the finished position.
 *
 * @param timeline - Timeline of one sheet.
 * @param sheetId - Sheet the timeline belongs to.
 * @param distance - Distance along the playback axis.
 * @returns The matching position.
 */
export function positionAtDistance(
  timeline: ReviewTimeline,
  sheetId: string,
  distance: number,
): ReviewPosition {
  const actions = timeline.actions
  if (actions.length === 0 || distance <= 0) return { sheetId, actionIndex: 0, progress: 0 }
  if (distance >= timeline.playTotal) return { sheetId, actionIndex: actions.length, progress: 0 }
  let low = 0
  let high = actions.length - 1
  while (low < high) {
    const middle = (low + high) >> 1
    const action = actions[middle]
    if (action.playStart + action.playSpan > distance) high = middle
    else low = middle + 1
  }
  const action = actions[low]
  return { sheetId, actionIndex: low, progress: (distance - action.playStart) / action.playSpan }
}
