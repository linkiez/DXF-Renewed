import { heatEvents } from './heatEvents'
import { neighbourhoodLength } from './neighbourhoodLength'
import type { RiskContext } from './riskContext'
import type { HeatCell, HeatView } from './types'

/**
 * Computes the accumulated heat of one sheet at one plan time from a prepared context.
 *
 * The cut length inside the trailing heat window is summed per cell and the length around each
 * cell is divided by the heat limit, so a value above 1 is over the limit.
 *
 * @param context - Risk context.
 * @param sheetId - Sheet to show.
 * @param planSeconds - Plan time in seconds.
 * @returns The view; unavailable, naming the missing profile paths, when the heat rule cannot be assessed.
 */
export function heatViewOf(context: RiskContext, sheetId: string, planSeconds: number): HeatView {
  const rule = context.rules.find((candidate) => candidate.category === 'heat')
  const limit = context.limits.heat
  if (!rule || !limit) return { available: false, missing: rule?.missing ?? [], cells: [], max: 0 }
  const set = heatEvents(context).find((candidate) => candidate.sheetId === sheetId)
  if (!set) return { available: true, missing: [], cells: [], max: 0 }
  const totals = new Map<string, number>()
  for (const event of set.events) {
    if (event.end > planSeconds || event.end <= planSeconds - limit.windowSeconds) continue
    const key = `${event.cx},${event.cy}`
    totals.set(key, (totals.get(key) ?? 0) + event.length)
  }
  const radius = limit.radius * context.unitsPerMeter
  const maxLength = limit.maxCutLength * context.unitsPerMeter
  const cells: HeatCell[] = [...totals.keys()].map((key) => {
    const [cx, cy] = key.split(',').map(Number)
    return { x: cx * set.cellSize, y: cy * set.cellSize, size: set.cellSize, value: neighbourhoodLength(totals, cx, cy, set.cellSize, radius) / maxLength }
  })
  return { available: true, missing: [], cells, max: cells.reduce((best, cell) => Math.max(best, cell.value), 0) }
}
