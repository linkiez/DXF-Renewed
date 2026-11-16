import { buildFinding } from './buildFinding'
import { freedMoments } from './freedMoments'
import type { RiskContext } from './riskContext'
import type { RiskFinding } from './types'

/**
 * Rule 3: flags a part that becomes free (outer contour finished, no tab) with an area at or below
 * the loose-part limit, because it can move or tip up.
 *
 * @param context - Risk context.
 * @returns One finding per loose part; none when the rule cannot be assessed.
 */
export function assessLoosePart(context: RiskContext): RiskFinding[] {
  const limit = context.limits.loose
  if (!limit) return []
  const unitsSquared = context.unitsPerMeter * context.unitsPerMeter
  return freedMoments(context)
    .filter((moment) => moment.loose && !moment.held)
    .map((moment) => {
      const area = moment.area / unitsSquared
      return buildFinding({
        category: 'loose-part',
        sheetId: moment.sheetId,
        partKey: moment.partKey,
        actionIndex: moment.actionIndex,
        planSeconds: moment.planSeconds,
        measured: area,
        limit: limit.maxArea,
        unit: 'm²',
        ratio: area > 0 ? limit.maxArea / area : Number.POSITIVE_INFINITY,
        criticalFactor: context.limits.critical,
      })
    })
}
