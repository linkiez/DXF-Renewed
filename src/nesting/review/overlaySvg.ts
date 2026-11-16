import { escapeXml } from '../toNestedSvg'
import type { Point2D } from '../types'
import type { ReviewOverlay } from './types'

const num = (value: number): string => String(Number(value.toFixed(3)))
const attr = (name: string, value: string | number): string => ` ${name}="${escapeXml(String(value))}"`
const ring = (vertices: readonly Point2D[]): string => `M ${vertices.map((p) => `${num(p.x)} ${num(p.y)}`).join(' L ')} Z`

const VALID_STROKE = '#15803d'
const INVALID_STROKE = '#b91c1c'
const LABEL_SIZE = 6
const LINE_HEIGHT = 1.4

const label = (text: string, at: Point2D, unit: number, code: string): string =>
  `<text${attr('data-overlay-mark', code)}${attr('transform', `translate(${num(at.x)} ${num(at.y)}) scale(1 -1)`)}` +
  `${attr('font-size', num(LABEL_SIZE * unit))} fill="${INVALID_STROKE}" stroke="#ffffff" paint-order="stroke"` +
  `${attr('stroke-width', num(unit * 0.8))}>${escapeXml(text)}</text>`

const ghostLayer = (ghost: NonNullable<ReviewOverlay['ghost']>, unit: number): string => {
  const stroke = ghost.valid ? VALID_STROKE : INVALID_STROKE
  const dash = ghost.valid ? '' : attr('stroke-dasharray', `${num(3 * unit)} ${num(2 * unit)}`)
  const fill = ghost.valid ? 'fill="#bbf7d0" fill-opacity="0.45"' : 'fill="url(#review-hatch)" fill-opacity="0.8"'
  const marks = ghost.marks.map((mark, index) =>
    label(mark.label, { x: ghost.anchor.x, y: ghost.anchor.y - index * LABEL_SIZE * LINE_HEIGHT * unit }, unit, mark.code),
  )
  return `<g data-overlay-ghost${attr('data-valid', String(ghost.valid))}>` +
    `<path${attr('d', ring(ghost.outline))} ${fill}${attr('stroke', stroke)}${attr('stroke-width', num(2 * unit))}${dash}/>` +
    `${marks.join('')}</g>`
}

const HEAT_FILL = '#f97316'
const FREED_STROKE = '#0f766e'
const MARKER_STROKE = '#7c2d12'

const heatLayer = (heat: NonNullable<ReviewOverlay['heat']>): string => {
  const cells = heat.cells.map((cell) => {
    const over = cell.value > 1
    const fill = over ? 'url(#review-hatch)' : HEAT_FILL
    const opacity = over ? 0.85 : Math.min(0.55, 0.15 + cell.value * 0.4)
    return `<rect data-overlay-heat${attr('data-over', String(over))}${attr('x', num(cell.x))}${attr('y', num(cell.y))}` +
      `${attr('width', num(cell.size))}${attr('height', num(cell.size))}${attr('fill', fill)}${attr('fill-opacity', opacity)}>` +
      `<title>${escapeXml(`${Math.round(cell.value * 100)}%`)}</title></rect>`
  })
  return `<g data-overlay-heat-layer${attr('data-max', num(heat.max))}>${cells.join('')}</g>`
}

const freedLayer = (freed: NonNullable<ReviewOverlay['freed']>, unit: number): string =>
  freed.map((part) =>
    `<path data-overlay-freed${attr('data-part-key', part.key)}${attr('d', ring(part.outline))} fill="none"${attr('stroke', FREED_STROKE)}` +
    `${attr('stroke-width', num(2.2 * unit))}${attr('stroke-dasharray', `${num(unit)} ${num(2 * unit)}`)}/>`,
  ).join('')

const markerLayer = (markers: NonNullable<ReviewOverlay['markers']>, unit: number): string =>
  markers.map((marker) => {
    const r = 4 * unit
    const diamond = `M ${num(marker.x)} ${num(marker.y + r)} L ${num(marker.x + r)} ${num(marker.y)} L ${num(marker.x)} ${num(marker.y - r)} L ${num(marker.x - r)} ${num(marker.y)} Z`
    return `<g data-overlay-marker${attr('data-id', marker.id)}${attr('data-severity', marker.severity)}>` +
      `<path${attr('d', diamond)} fill="${marker.severity === 'critical' ? MARKER_STROKE : '#ffffff'}"${attr('stroke', MARKER_STROKE)}${attr('stroke-width', num(unit))}/>` +
      `<text${attr('transform', `translate(${num(marker.x + r * 1.3)} ${num(marker.y)}) scale(1 -1)`)}${attr('font-size', num(LABEL_SIZE * unit))} fill="${MARKER_STROKE}"` +
      `${attr('stroke', '#ffffff')} paint-order="stroke"${attr('stroke-width', num(unit * 0.8))}>${escapeXml(marker.label)}</text></g>`
  }).join('')

/**
 * Draws the overlay of a review in sheet coordinates: the accumulated heat (hatched where it is over
 * the limit), the parts that are free (dotted outline), one labelled diamond per finding and the
 * candidate position as a ghost outline, dashed and hatched when it is invalid, with one text label
 * per violation, so nothing is conveyed by colour alone.
 *
 * @param overlay - Overlay to draw; `null` or `undefined` draws nothing.
 * @param unit - Size of one drawing unit, derived from the sheet.
 * @returns SVG markup to place inside the sheet group.
 */
export function overlayLayer(overlay: ReviewOverlay | null | undefined, unit: number): string {
  if (!overlay) return ''
  return (overlay.heat?.available ? heatLayer(overlay.heat) : '') +
    (overlay.freed ? freedLayer(overlay.freed, unit) : '') +
    (overlay.markers ? markerLayer(overlay.markers, unit) : '') +
    (overlay.ghost ? ghostLayer(overlay.ghost, unit) : '')
}
