import type { ReviewPosition, ReviewTimeline } from './types'

/**
 * Maps a review position to its distance on the playback axis.
 *
 * @param timeline - Timeline of the position's sheet.
 * @param position - Position inside that timeline.
 * @returns Distance along the playback axis; the total span for a finished position.
 */
export function distanceAtPosition(timeline: ReviewTimeline, position: ReviewPosition): number {
  const actions = timeline.actions
  if (position.actionIndex >= actions.length) return timeline.playTotal
  if (position.actionIndex <= 0 && position.progress <= 0) return 0
  const action = actions[Math.max(0, position.actionIndex)]
  return action.playStart + action.playSpan * Math.min(Math.max(position.progress, 0), 1)
}
