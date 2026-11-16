import type { CutAction } from '../../../cutPath'
import type { Point2D } from '../../../types'
import type { GcodeWriter } from '../../gcode/writer'
import { message } from '../../machine/messages'
import type { ValidationIssue } from '../../types'
import { arcSweep } from '../arcSweep'
import type { Contour } from '../contourBlocks'
import { splitArcAtQuadrants } from '../splitArcAtQuadrants'
import { contourQuality } from './glorystarQuality'

/** Dialect parameters that the contour writer reads. */
export interface GlorystarContourDialect {
  readonly arcMinimumSweep: number
  readonly heightOffCode: string
  readonly heightOnCode: string
  readonly smallContourClass: string
  readonly regulatorOffQuality: number
  readonly thickMaterialGroups: readonly string[]
  readonly thickMinThickness: number
}

/** Everything the contour writer needs. */
export interface GlorystarContourContext {
  readonly writer: GcodeWriter
  readonly mapPoint: (point: Point2D) => Point2D
  readonly format: (value: number) => string
  readonly settings: { readonly feed: number; readonly piercingType: number; readonly thickness: number }
  readonly dialect: GlorystarContourDialect
  /** The head is raised: the contour starts with the head-up rapid. */
  readonly headUp: boolean
}

const actionsOf = (contour: Contour): CutAction[] => [contour.pierce, ...contour.motions.map((m) => m.action)]

const metadataOf = (contour: Contour, key: string): string | number | boolean | undefined =>
  actionsOf(contour).find((a) => a.metadata?.[key] !== undefined)?.metadata?.[key]

function startLines(index: number, wValue: string, rapid: Point2D | undefined, format: (n: number) => string): string[] {
  const lines = [`N${index + 1}`, `G650,T3,W${wValue}`, 'G806,T3,N1,H1,D1']
  if (index === 0) lines.push('G153,Z(trav_safe_z_start)')
  if (rapid) {
    lines.push(`G180,X${format(rapid.x)},Y${format(rapid.y)},Z(workpiece_safe_dist)`, 'G153,G0,X(kine_x),Y(kine_y)', 'G153,G0,Z(kine_z)')
  }
  return lines
}

function arcLines(action: CutAction, context: GlorystarContourContext): string[] {
  const { mapPoint, format, dialect } = context
  const points = action.points.map(mapPoint)
  if (action.curve?.type !== 'arc') return points.slice(1).map((p) => `G1,X${format(p.x)},Y${format(p.y)}`)
  const start = points[0]
  const end = points[points.length - 1]
  const center = mapPoint(action.curve.center)
  if (arcSweep(start, end, center, action.curve.clockwise) <= dialect.arcMinimumSweep) return [`G1,X${format(end.x)},Y${format(end.y)}`]
  const code = action.curve.clockwise ? 'G2' : 'G3'
  return splitArcAtQuadrants(start, end, center, action.curve.clockwise)
    .map((piece) => `${code},X${format(piece.end.x)},Y${format(piece.end.y)},I${format(center.x)},J${format(center.y)}`)
}

interface Style {
  readonly thick: boolean
  readonly quality: string
  readonly regulatorOff: boolean
  readonly small: boolean
}

const wantedSensor = (action: CutAction, style: Style, dialect: GlorystarContourDialect): string =>
  style.small || action.kind === 'lead-in' || action.kind === 'lead-out' ? dialect.heightOffCode : dialect.heightOnCode

function writeMotions(contour: Contour, context: GlorystarContourContext, style: Style): void {
  const { writer, dialect } = context
  let sensor = ''
  let previous: CutAction | undefined
  for (const { action } of contour.motions) {
    if (previous?.kind === 'lead-in' && action.kind !== 'lead-in') {
      writer.line('G832')
      if (style.thick) writer.line(`G834 W${style.quality}`)
    }
    const wanted = wantedSensor(action, style, dialect)
    if (!style.regulatorOff && wanted !== sensor) {
      writer.line(wanted)
      sensor = wanted
    }
    for (const line of arcLines(action, context)) writer.line(line)
    previous = action
  }
}

function styleOf(contour: Contour, context: GlorystarContourContext): Style {
  const { settings, dialect } = context
  const quality = contourQuality(contour) ?? ''
  const group = String(metadataOf(contour, 'materialGroup'))
  return {
    thick: dialect.thickMaterialGroups.includes(group) && settings.thickness >= dialect.thickMinThickness,
    quality,
    regulatorOff: quality === String(dialect.regulatorOffQuality),
    small: metadataOf(contour, 'contourClass') === dialect.smallContourClass,
  }
}

/**
 * Write one contour of a GloryStar program.
 *
 * Order: number, offset selection, safe start (first contour), head-up rapid when needed, the cut start `G800`, then the
 * moves with the height sensor words, `G832` (and `G834` for thick aluminium and stainless steel) when the lead-in ends,
 * lines as `G1` and arcs as `G2`/`G3` with absolute centers, broken at the quadrants.
 *
 * @param contour - Contour to write.
 * @param index - Zero-based position of the contour; the block number is `index + 1`.
 * @param context - Writer, mapping, settings, dialect parameters and the head state.
 * @returns The issues raised (a missing quality).
 */
export function emitGlorystarContour(contour: Contour, index: number, context: GlorystarContourContext): readonly ValidationIssue[] {
  const { writer, format, settings } = context
  const style = styleOf(contour, context)
  const start = context.mapPoint(contour.rapidTarget)
  for (const line of startLines(index, style.thick ? '6' : style.quality, context.headUp ? start : undefined, format)) writer.line(line)
  writer.line(';==============================CORTE==============================')
  writer.line(`G800,K1,D1,X${format(start.x)},Y${format(start.y)},Z0,F${format(settings.feed)},T1,P${settings.piercingType},R${style.regulatorOff ? 0 : 1},U0,V0,W1`)
  writeMotions(contour, context, style)
  if (contourQuality(contour) !== undefined) return []
  return [{
    severity: 'error',
    code: 'PROCESS_SETTING_REQUIRED',
    message: message('PROCESS_SETTING_REQUIRED', { key: 'quality' }),
    ...(contour.contourId ? { contourId: contour.contourId } : {}),
  }]
}
