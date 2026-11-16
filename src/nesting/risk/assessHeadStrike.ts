import { EPSILON } from '../config'
import { buildFinding } from './buildFinding'
import { freedMoments } from './freedMoments'
import { pathDistance } from './pathDistance'
import type { ContextAction, ContextPart, RiskContext } from './riskContext'
import type { RiskFinding } from './types'

const nearBox = (action: ContextAction, part: ContextPart, margin: number): boolean => {
  const xs = action.path.map((point) => point.x)
  const ys = action.path.map((point) => point.y)
  return Math.min(...xs) <= part.bbox.maxX + margin && Math.max(...xs) >= part.bbox.minX - margin &&
    Math.min(...ys) <= part.bbox.maxY + margin && Math.max(...ys) >= part.bbox.minY - margin
}

const strikeOf = (actions: readonly ContextAction[], part: ContextPart, freedAt: number, clearance: number): { action: ContextAction; distance: number } | null => {
  for (const action of actions) {
    const moving = action.category === 'cut' || action.category === 'travel'
    if (!moving || action.index <= freedAt + 1 || !nearBox(action, part, clearance)) continue
    const distance = pathDistance(action.path, part.outline)
    if (distance <= clearance + EPSILON) return { action, distance }
  }
  return null
}

/**
 * Rule 4: flags a cut or rapid path that passes within the clearance of a loose part after the part
 * has come free. The move that leaves the part right after its release is not counted, and a part
 * held by a tab or larger than the loose-part limit is never a target. Each part is reported once,
 * at the first offending action.
 *
 * @param context - Risk context.
 * @returns One finding per struck part; none when the rule cannot be assessed.
 */
export function assessHeadStrike(context: RiskContext): RiskFinding[] {
  const limit = context.limits.strike
  if (!limit || !context.limits.loose) return []
  const clearance = limit.clearance * context.unitsPerMeter
  const found: RiskFinding[] = []
  for (const moment of freedMoments(context).filter((candidate) => candidate.loose && !candidate.held)) {
    const part = context.partsBySheet.get(moment.sheetId)?.find((candidate) => candidate.key === moment.partKey)
    const strike = part ? strikeOf(context.actionsBySheet.get(moment.sheetId) ?? [], part, moment.actionIndex, clearance) : null
    if (!strike) continue
    found.push(buildFinding({
      category: 'head-strike',
      sheetId: moment.sheetId,
      partKey: moment.partKey,
      actionIndex: strike.action.index,
      planSeconds: strike.action.start,
      measured: strike.distance / context.unitsPerMeter,
      limit: limit.clearance,
      unit: 'm',
      ratio: strike.distance > 0 ? clearance / strike.distance : Number.POSITIVE_INFINITY,
      criticalFactor: context.limits.critical,
    }))
  }
  return found
}
