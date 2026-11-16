import { messages } from './messages'
import type { ReviewScene } from './types'

/**
 * Writes the summary of a scene: sheets, parts, unplaced items, yield, cut and rapid length and
 * pierces, exactly as supplied by the artifact and the cut plan.
 *
 * @param scene - Review scene.
 * @returns Summary text in Brazilian Portuguese.
 */
export function summarize(scene: ReviewScene): string {
  return messages.summaryText(scene.summary)
}
