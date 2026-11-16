import type { CutAction } from '../../cutPath'
import type { Point2D } from '../../types'
import type { GcodeWriter } from '../gcode/writer'
import { arcSweep } from './arcSweep'

/** Dialect parameters that the move writer reads. */
export interface IncrementalMoveDialect {
  /** Arcs with a sweep of this many degrees or less are written as lines. */
  readonly arcMinimumSweep: number
}

const MOTION = new Set(['lead-in', 'cut', 'lead-out', 'overcut'])

function line(writer: GcodeWriter, to: Point2D): void {
  writer.beginLine().word('G', '01').word('X', to.x).word('Y', to.y).endLine()
}

function arc(writer: GcodeWriter, start: Point2D, end: Point2D, center: Point2D, clockwise: boolean): void {
  writer.beginLine().word('G', clockwise ? '02' : '03').word('X', end.x).word('Y', end.y)
    .word('I', center.x - start.x).word('J', center.y - start.y).endLine()
}

function emitAction(action: CutAction, writer: GcodeWriter, mapPoint: (p: Point2D) => Point2D, dialect: IncrementalMoveDialect): void {
  const points = action.points.map(mapPoint)
  if (action.curve?.type === 'arc') {
    const start = points[0]
    const end = points[points.length - 1]
    const center = mapPoint(action.curve.center)
    const sweep = arcSweep(start, end, center, action.curve.clockwise)
    if (sweep <= dialect.arcMinimumSweep) line(writer, end)
    else arc(writer, start, end, center, action.curve.clockwise)
    return
  }
  for (const point of points.slice(1)) line(writer, point)
}

/**
 * Write the moves of a contour as `G01` lines and `G02`/`G03` arcs with an incremental center (LaserAhead and EIA dialects).
 *
 * Lines are `G01`; arcs are `G02`/`G03` with the center as an offset from the arc start, in the arc's own direction;
 * a full circle is one arc; arcs of `arcMinimumSweep` degrees or less are lines. No feed word is written.
 *
 * @param actions - Lead-in, cut, lead-out and overcut actions in order; other kinds write nothing.
 * @param writer - Writer configured with the decimals of the configuration.
 * @param mapPoint - Nesting-to-machine point mapping.
 * @param dialect - Dialect parameters.
 */
export function emitIncrementalMoves(
  actions: readonly CutAction[],
  writer: GcodeWriter,
  mapPoint: (point: Point2D) => Point2D,
  dialect: IncrementalMoveDialect,
): void {
  for (const action of actions) if (MOTION.has(action.kind)) emitAction(action, writer, mapPoint, dialect)
}
