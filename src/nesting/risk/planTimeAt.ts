import type { RiskContext } from './riskContext'

/**
 * Converts a playback position into a plan time.
 *
 * @param context - Risk context.
 * @param sheetId - Sheet of the position.
 * @param actionIndex - Number of completed actions; the length of the plan means finished.
 * @param progress - Fraction of the current action, in `[0, 1)`.
 * @returns Seconds on the plan time axis, or `null` when times are unavailable.
 */
export function planTimeAt(context: RiskContext, sheetId: string, actionIndex: number, progress: number): number | null {
  const actions = context.actionsBySheet.get(sheetId) ?? []
  if (actions.length === 0) return null
  const action = actions[Math.min(actionIndex, actions.length - 1)]
  if (actionIndex >= actions.length) return action.end
  if (action.start === null || action.end === null) return null
  return action.start + (action.end - action.start) * progress
}
