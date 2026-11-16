import { buildFinding } from './buildFinding'
import { heatEvents } from './heatEvents'
import type { HeatEvent, HeatEventSet } from './heatEvents'
import { neighbourhoodLength } from './neighbourhoodLength'
import type { RiskContext } from './riskContext'
import type { RiskFinding } from './types'

interface Candidate {
  event: HeatEvent
  /** Windowed cut length around the event, in geometry units. */
  length: number
}

const peaks = (set: HeatEventSet, windowSeconds: number, radius: number, limit: number): Candidate[] => {
  const totals = new Map<string, number>()
  const candidates: Candidate[] = []
  let oldest = 0
  for (const event of set.events) {
    const key = `${event.cx},${event.cy}`
    totals.set(key, (totals.get(key) ?? 0) + event.length)
    while (set.events[oldest].end <= event.end - windowSeconds) {
      const old = set.events[oldest]
      const oldKey = `${old.cx},${old.cy}`
      totals.set(oldKey, (totals.get(oldKey) ?? 0) - old.length)
      oldest += 1
    }
    const length = neighbourhoodLength(totals, event.cx, event.cy, set.cellSize, radius)
    if (length >= limit) candidates.push({ event, length })
  }
  return candidates
}

const apart = (chosen: readonly Candidate[], candidate: Candidate, radius: number): boolean =>
  chosen.every((other) => Math.hypot(other.event.x - candidate.event.x, other.event.y - candidate.event.y) >= radius)

/**
 * Rule 1: flags a region where the cut length performed inside the heat radius during the trailing
 * window exceeds the limit. Each hot region is reported once: the strongest peak wins and the next
 * ones must lie at least one radius away.
 *
 * @param context - Risk context.
 * @returns One finding per hot region; none when the rule cannot be assessed.
 */
export function assessHeat(context: RiskContext): RiskFinding[] {
  const limit = context.limits.heat
  if (!limit) return []
  const radius = limit.radius * context.unitsPerMeter
  const maxLength = limit.maxCutLength * context.unitsPerMeter
  return heatEvents(context).flatMap((set) => {
    const ordered = peaks(set, limit.windowSeconds, radius, maxLength)
      .sort((a, b) => b.length - a.length || a.event.end - b.event.end || a.event.cx - b.event.cx || a.event.cy - b.event.cy)
    const chosen: Candidate[] = []
    for (const candidate of ordered) if (apart(chosen, candidate, radius)) chosen.push(candidate)
    return chosen.map((candidate) => buildFinding({
      category: 'heat',
      sheetId: set.sheetId,
      ...(candidate.event.partKey !== undefined ? { partKey: candidate.event.partKey } : {}),
      actionIndex: candidate.event.actionIndex,
      planSeconds: candidate.event.end,
      region: { x: candidate.event.x, y: candidate.event.y, radius },
      measured: candidate.length / context.unitsPerMeter,
      limit: limit.maxCutLength,
      unit: 'm',
      ratio: candidate.length / maxLength,
      criticalFactor: context.limits.critical,
    }))
  })
}
