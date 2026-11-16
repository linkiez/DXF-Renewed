import { EPSILON } from '../config'
import { createNeighbourIndex } from '../linking/neighbourIndex'
import { polygonDistance } from '../trueShape/bounds'
import { buildFinding } from './buildFinding'
import type { ContextPart, RiskContext } from './riskContext'
import type { RiskFinding } from './types'

const EDGE_LABEL = 'a borda da chapa'
const HOLE_LABEL = 'um furo da chapa'

const finding = (context: RiskContext, part: ContextPart, other: { key?: string; label?: string }, distance: number, minimum: number): RiskFinding =>
  buildFinding({
    category: 'thin-web',
    sheetId: part.sheetId,
    partKey: part.key,
    ...(other.key !== undefined ? { otherPartKey: other.key } : { otherLabel: other.label }),
    measured: distance / context.unitsPerMeter,
    limit: minimum / context.unitsPerMeter,
    unit: 'm',
    ratio: distance > 0 ? minimum / distance : Number.POSITIVE_INFINITY,
    criticalFactor: context.limits.critical,
  })

const pairFindings = (context: RiskContext, parts: readonly ContextPart[], minimum: number): RiskFinding[] => {
  const size = Math.max(minimum * 4, ...parts.map((part) => Math.max(part.bbox.width, part.bbox.height)))
  const index = createNeighbourIndex(parts.map((part) => ({ key: part.key, bbox: part.bbox })), size)
  const order = new Map(parts.map((part, position) => [part.key, position]))
  const byKey = new Map(parts.map((part) => [part.key, part]))
  const found: RiskFinding[] = []
  for (const part of parts) {
    for (const key of index.query(part.bbox, minimum)) {
      if ((order.get(key) as number) <= (order.get(part.key) as number)) continue
      const other = byKey.get(key) as ContextPart
      const distance = polygonDistance(part.outline, other.outline)
      if (distance < minimum - EPSILON) found.push(finding(context, part, { key }, distance, minimum))
    }
  }
  return found
}

const boundaryFindings = (context: RiskContext, parts: readonly ContextPart[], minimum: number): RiskFinding[] => {
  const found: RiskFinding[] = []
  for (const part of parts) {
    const sheet = context.sheets.get(part.sheetId)
    if (!sheet) continue
    const edge = Math.min(part.bbox.minX, part.bbox.minY, sheet.width - part.bbox.maxX, sheet.height - part.bbox.maxY)
    if (edge < minimum - EPSILON) found.push(finding(context, part, { label: EDGE_LABEL }, Math.max(edge, 0), minimum))
    for (const hole of sheet.holes ?? []) {
      const distance = polygonDistance(part.outline, hole.vertices)
      if (distance < minimum - EPSILON) found.push(finding(context, part, { label: HOLE_LABEL }, distance, minimum))
    }
  }
  return found
}

/**
 * Rule 2: flags two outlines, or an outline and a sheet edge or hole, closer than the minimum web.
 *
 * @param context - Risk context.
 * @returns One finding per thin web; none when the rule cannot be assessed.
 */
export function assessThinWeb(context: RiskContext): RiskFinding[] {
  const limit = context.limits.web
  if (!limit) return []
  const minimum = limit.minimum * context.unitsPerMeter
  return [...context.partsBySheet.values()].flatMap((parts) => [...pairFindings(context, parts, minimum), ...boundaryFindings(context, parts, minimum)])
}
