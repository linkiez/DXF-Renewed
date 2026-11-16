import { applyEdit } from './applyEdit'
import type { PartEdit, WorkingLayout } from './types'

/**
 * Rebuilds the layout after the first `count` edits of a log, starting from the base layout.
 *
 * @param base - Layout before any edit.
 * @param edits - Edit log.
 * @param count - How many edits of the log to apply.
 * @returns The layout at that point of the log.
 */
export function replayEdits(base: WorkingLayout, edits: readonly PartEdit[], count: number): WorkingLayout {
  let working = base
  for (const edit of edits.slice(0, count)) working = applyEdit(working, edit).working
  return working
}
