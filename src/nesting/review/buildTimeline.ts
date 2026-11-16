import type { CutAction } from '../cutPath/types'
import { actionLength } from '../linking/actionLength'
import type { ReviewAction, ReviewTimeline } from './types'

const DWELL_SHARE = 0.5
const DEFAULT_DWELL = 1

/**
 * Flattens the ordered actions of one sheet into a timeline with cumulative lengths.
 *
 * Besides the geometric length, every action gets a positive playback span (a dwell for actions
 * without length, such as a pierce), so playback positions and seek targets map one to one.
 *
 * @param actions - Ordered cut actions of a single sheet.
 * @returns Timeline with per-action lengths, playback spans and the pierce indices.
 * @example
 * ```typescript
 * const timeline = buildTimeline(plan.actions)
 * ```
 */
export function buildTimeline(actions: readonly CutAction[]): ReviewTimeline {
  const lengths = actions.map((action) =>
    actionLength(action.points, action.curve),
  )
  const totalLength = lengths.reduce((sum, length) => sum + length, 0)
  const dwell = totalLength > 0 && actions.length > 0
    ? (totalLength / actions.length) * DWELL_SHARE
    : DEFAULT_DWELL

  let cursor = 0
  let playCursor = 0
  const pierceIndices: number[] = []
  const flattened = actions.map<ReviewAction>((action, index) => {
    const length = lengths[index]
    const playSpan = length > 0 ? length : dwell
    const entry: ReviewAction = {
      index,
      kind: action.kind,
      points: action.points,
      ...(action.curve ? { curve: action.curve } : {}),
      startLength: cursor,
      length,
      playStart: playCursor,
      playSpan,
      ...(action.contourId ? { contourId: action.contourId } : {}),
      ...(action.metadata ? { metadata: action.metadata } : {}),
      notices: [],
    }
    cursor += length
    playCursor += playSpan
    if (action.kind === 'pierce') pierceIndices.push(index)
    return entry
  })
  return { actions: flattened, totalLength: cursor, playTotal: playCursor, pierceIndices }
}
