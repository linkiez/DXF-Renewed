import type { Point2D } from '../../../types'
import { formatNumber } from '../../gcode/formatNumber'
import type { GcodeWriter } from '../../gcode/writer'
import type { ProcessMapping } from '../../machine/types'
import type { ValidationIssue } from '../../types'
import type { Contour } from '../contourBlocks'
import { emitIncrementalMoves } from '../incrementalMoves'
import { talviSelector } from './talviSelector'

/** Everything the contour writer needs. */
export interface TalviContourContext {
  readonly writer: GcodeWriter
  readonly mapPoint: (point: Point2D) => Point2D
  readonly mapping: ProcessMapping | undefined
  readonly dialect: { readonly arcMinimumSweep: number; readonly lastDistance: number; readonly distanceDecimals: number }
  readonly isLast: boolean
}

/**
 * Write one contour block of a Talvi program.
 *
 * Order: number, process selector, rapid, `#<_openslag>=1`, `layer_start`, moves, distance to the next contour
 * (the configured sentinel for the last one) and `layer_end`.
 *
 * @param contour - Contour to write.
 * @param index - Zero-based position of the contour; the block number is `index + 1`.
 * @param context - Writer, mapping, selector mapping and dialect parameters.
 * @returns The issues raised while writing (an unmapped process selector).
 */
export function emitTalviContour(contour: Contour, index: number, context: TalviContourContext): readonly ValidationIssue[] {
  const { writer, mapPoint, dialect } = context
  const selector = talviSelector(contour, context.mapping)
  const target = mapPoint(contour.rapidTarget)
  writer.line(`N${String(index + 1).padStart(4, '0')}`)
  writer.line(selector.line)
  writer.beginLine().word('G', '00').word('X', target.x).word('Y', target.y).endLine()
  writer.line('#<_openslag>=1')
  writer.line('o<layer_start> call')
  emitIncrementalMoves(contour.motions.map((m) => m.action), writer, mapPoint, dialect)
  const distance = context.isLast || contour.nextRapidLength === undefined
    ? formatNumber(dialect.lastDistance, 0)
    : formatNumber(contour.nextRapidLength, dialect.distanceDecimals, true)
  writer.line(`#<_NextOneDis>=${distance}`)
  writer.line('o<layer_end> call')
  return selector.issues
}
