import type { Point2D } from '../../../types'
import type { GcodeWriter } from '../../gcode/writer'
import { message } from '../../machine/messages'
import type { ValidationIssue } from '../../types'
import type { Contour } from '../contourBlocks'
import { emitIncrementalMoves } from '../incrementalMoves'
import type { ProcessSettings } from './hyperthermSelection'

/** Everything the contour writer needs. */
export interface HyperthermContourContext {
  readonly writer: GcodeWriter
  readonly mapPoint: (point: Point2D) => Point2D
  readonly settings: ProcessSettings
  readonly dialect: { readonly highDefinitionKey: string }
}

type KerfSide = 'left' | 'right' | 'none'

const actionsOf = (contour: Contour) => [contour.pierce, ...contour.motions.map((m) => m.action)]

function kerfSideOf(contour: Contour): KerfSide | undefined {
  const value = actionsOf(contour).find((a) => a.metadata?.kerfSide !== undefined)?.metadata?.kerfSide
  return value === 'left' || value === 'right' || value === 'none' ? value : undefined
}

function isHighDefinition(contour: Contour, context: HyperthermContourContext): boolean {
  if (context.settings.hs === true) return true
  return actionsOf(contour).some((a) => a.metadata?.[context.dialect.highDefinitionKey] === true)
}

const numberSetting = (settings: ProcessSettings, key: string): number | undefined => {
  const value = settings[key]
  return typeof value === 'number' ? value : undefined
}

function writeKerf(side: KerfSide | undefined, context: HyperthermContourContext): void {
  if (side !== 'left' && side !== 'right') return
  const kerf = numberSetting(context.settings, 'kerf')
  if (kerf !== undefined) context.writer.beginLine().word('G', '43').word('X', kerf).endLine()
  context.writer.line(side === 'left' ? 'G41' : 'G42')
}

/**
 * Write one contour of a Hypertherm program in the vendor's format.
 *
 * Order: rapid, kerf value (`G43 X`) and side (`G41`/`G42`, immediately before `M07`), cut on, optional height control
 * freeze around the lead-in, the feed word (once per change, per contour), moves, cut off, kerf cancel. The kerf side
 * comes from the `kerfSide` metadata (`left`, `right` or `none`); a missing value is an error and never a default.
 *
 * @param contour - Contour to write.
 * @param context - Writer, mapping, process settings and dialect parameters.
 * @returns The issues raised while writing.
 */
export function emitHyperthermContour(contour: Contour, context: HyperthermContourContext): readonly ValidationIssue[] {
  const { writer, mapPoint, settings } = context
  const side = kerfSideOf(contour)
  const target = mapPoint(contour.rapidTarget)
  writer.beginLine().word('G', '00').word('X', target.x).word('Y', target.y).endLine()
  writeKerf(side, context)
  writer.line(isHighDefinition(contour, context) ? 'M07 HS' : 'M07')
  const leadIns = contour.motions.filter((m) => m.action.kind === 'lead-in').map((m) => m.action)
  const rest = contour.motions.filter((m) => m.action.kind !== 'lead-in').map((m) => m.action)
  const freeze = settings.m50n === true && leadIns.length > 0
  const feed = numberSetting(settings, 'feed')
  let lastFeed: number | undefined
  const setFeed = (value: number | undefined): void => {
    if (value === undefined || value === lastFeed) return
    writer.beginLine().word('F', value).endLine()
    lastFeed = value
  }
  if (freeze) writer.line('M50N')
  setFeed(leadIns.length > 0 ? numberSetting(settings, 'leadInFeed') ?? feed : feed)
  emitIncrementalMoves(leadIns, writer, mapPoint, { arcMinimumSweep: 0 })
  if (freeze) writer.line('M51')
  setFeed(feed)
  emitIncrementalMoves(rest, writer, mapPoint, { arcMinimumSweep: 0 })
  writer.line(settings.rt === true ? 'M08 RT' : 'M08')
  writer.line('G40')
  if (side !== undefined) return []
  return [{
    severity: 'error',
    code: 'PROCESS_SETTING_REQUIRED',
    message: message('PROCESS_SETTING_REQUIRED', { key: 'kerfSide' }),
    ...(contour.contourId ? { contourId: contour.contourId } : {}),
  }]
}
