import type { Point2D } from '../types'
import type { ContextAction, RiskContext } from './riskContext'

/** A piece of cutting inside one grid cell, with the plan-time interval it takes. */
export interface HeatEvent {
  x: number
  y: number
  cx: number
  cy: number
  /** Length in geometry units. */
  length: number
  start: number
  end: number
  actionIndex: number
  partKey?: string
}

/** The cutting events of one sheet in plan-time order. */
export interface HeatEventSet {
  sheetId: string
  /** Side of a grid cell in geometry units, half the heat radius. */
  cellSize: number
  events: HeatEvent[]
}

const piecesOf = (path: readonly Point2D[], cell: number): { mid: Point2D; length: number; cumulative: number }[] => {
  const pieces: { mid: Point2D; length: number; cumulative: number }[] = []
  let walked = 0
  for (let index = 1; index < path.length; index += 1) {
    const from = path[index - 1]
    const to = path[index]
    const length = Math.hypot(to.x - from.x, to.y - from.y)
    const steps = Math.max(1, Math.ceil(length / cell))
    for (let step = 0; step < steps; step += 1) {
      const t = (step + 0.5) / steps
      walked += length / steps
      pieces.push({ mid: { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }, length: length / steps, cumulative: walked })
    }
  }
  return pieces
}

const eventsOf = (action: ContextAction, cell: number): HeatEvent[] => {
  if (action.start === null || action.end === null || action.length <= 0) return []
  const start = action.start
  const span = action.end - start
  return piecesOf(action.path, cell).map((piece) => ({
    x: piece.mid.x,
    y: piece.mid.y,
    cx: Math.floor(piece.mid.x / cell),
    cy: Math.floor(piece.mid.y / cell),
    length: piece.length,
    start: start + (span * (piece.cumulative - piece.length)) / action.length,
    end: start + (span * piece.cumulative) / action.length,
    actionIndex: action.index,
    ...(action.partKey !== undefined ? { partKey: action.partKey } : {}),
  }))
}

/**
 * Splits the cutting of each sheet into pieces by grid cell with their plan-time interval.
 *
 * The grid cell is half the heat radius. Only cutting actions with a known time take part; the
 * events come out in plan-time order.
 *
 * @param context - Risk context.
 * @returns One event set per sheet with cutting; empty when the heat rule cannot be assessed.
 */
export function heatEvents(context: RiskContext): HeatEventSet[] {
  const limit = context.limits.heat
  if (!limit) return []
  const cellSize = (limit.radius * context.unitsPerMeter) / 2
  const sets: HeatEventSet[] = []
  for (const [sheetId, actions] of context.actionsBySheet) {
    const events = actions.filter((action) => action.category === 'cut').flatMap((action) => eventsOf(action, cellSize))
    if (events.length > 0) sets.push({ sheetId, cellSize, events })
  }
  return sets
}
