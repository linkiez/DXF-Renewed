import type { ContextAction, RiskContext } from './riskContext'
import type { FreedMoment } from './types'

const lastCut = (actions: readonly ContextAction[]): Map<string, ContextAction> => {
  const last = new Map<string, ContextAction>()
  for (const action of actions) {
    if (action.category === 'cut' && action.partKey !== undefined) last.set(action.partKey, action)
  }
  return last
}

/**
 * Finds the moment each part becomes free: the end of its last cutting action, which closes the
 * outer contour. A part with a `tab` action stays held. A part is loose when its area is at or
 * below the loose-part limit.
 *
 * @param context - Risk context.
 * @returns The moments ordered by sheet, action index and part key.
 */
export function freedMoments(context: RiskContext): FreedMoment[] {
  const moments: FreedMoment[] = []
  const unitsSquared = context.unitsPerMeter * context.unitsPerMeter
  for (const [sheetId, actions] of context.actionsBySheet) {
    const held = new Set(actions.filter((action) => action.kind === 'tab' && action.partKey !== undefined).map((action) => action.partKey))
    const areas = new Map((context.partsBySheet.get(sheetId) ?? []).map((part) => [part.key, part.area]))
    for (const [partKey, action] of lastCut(actions)) {
      const area = areas.get(partKey) ?? 0
      moments.push({
        sheetId,
        partKey,
        actionIndex: action.index,
        planSeconds: action.end,
        held: held.has(partKey),
        loose: context.limits.loose !== undefined && area / unitsSquared <= context.limits.loose.maxArea,
        area,
      })
    }
  }
  return moments.sort((a, b) => a.sheetId.localeCompare(b.sheetId) || a.actionIndex - b.actionIndex || a.partKey.localeCompare(b.partKey))
}
