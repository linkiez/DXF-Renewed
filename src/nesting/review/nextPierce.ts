import type { ReviewPosition, ReviewScene } from './types'

/**
 * Finds the position of the first pierce after the current action.
 *
 * @param scene - Review scene.
 * @param position - Current position.
 * @returns Start of the next pierce action, or `null` when none follows.
 */
export function nextPierce(scene: ReviewScene, position: ReviewPosition): ReviewPosition | null {
  const timeline = scene.sheets.find((sheet) => sheet.id === position.sheetId)?.timeline
  const next = timeline?.pierceIndices.find((index) => index > position.actionIndex)
  return next === undefined ? null : { sheetId: position.sheetId, actionIndex: next, progress: 0 }
}
