import type { CutActionKind, CutCurve } from '../cutPath/types'
import { escapeXml } from '../toNestedSvg'
import type { Point2D } from '../types'
import { actionPrefix } from './actionPrefix'
import { messages } from './messages'
import { overlayLayer } from './overlaySvg'
import { stateAt } from './stateAt'
import type { ReviewAction, ReviewOverlay, ReviewPart, ReviewPosition, ReviewScene, ReviewSelection, ReviewSheet, ReviewViewport } from './types'

/** Options of the static review renderer. */
export interface RenderReviewSvgOptions {
  sheetId: string
  /** Playback position; the whole plan is drawn when omitted. */
  position?: ReviewPosition
  selection?: ReviewSelection | null
  /** View window; the whole sheet with its legend is shown at the default viewport. */
  viewport?: ReviewViewport
  /** Candidate position, heat and markers drawn above the sheet. */
  overlay?: ReviewOverlay | null
}

type LineKind = Exclude<CutActionKind, 'pierce' | 'end'>

interface LineStyle {
  stroke: string
  width: number
  dash?: number[]
  cap?: 'butt' | 'round'
}

const LINE_STYLES: Record<LineKind, LineStyle> = {
  cut: { stroke: '#1d4ed8', width: 1 },
  rapid: { stroke: '#6b7280', width: 0.6, dash: [4, 3] },
  'lead-in': { stroke: '#15803d', width: 0.9, dash: [1, 2], cap: 'round' },
  'lead-out': { stroke: '#15803d', width: 0.9, dash: [6, 2, 1, 2] },
  overcut: { stroke: '#ea580c', width: 1.2, dash: [2, 1] },
  tab: { stroke: '#7c3aed', width: 3, cap: 'butt' },
  'common-line': { stroke: '#0f766e', width: 1.8 },
}
const LINE_KINDS = Object.keys(LINE_STYLES) as LineKind[]
const LEGEND_KINDS: CutActionKind[] = ['cut', 'rapid', 'pierce', 'lead-in', 'lead-out', 'overcut', 'tab', 'common-line']
const TAU = Math.PI * 2

const num = (value: number): string => String(Number(value.toFixed(3)))
const point = (p: Point2D): string => `${num(p.x)} ${num(p.y)}`

const attr = (name: string, value: string | number | undefined): string =>
  value === undefined ? '' : ` ${name}="${escapeXml(String(value))}"`

const dashOf = (style: LineStyle, unit: number): string | undefined =>
  style.dash ? style.dash.map((part) => num(part * unit)).join(' ') : undefined

const ring = (vertices: readonly Point2D[]): string =>
  `M ${vertices.map(point).join(' L ')} Z`

const arcSegment = (from: Point2D, to: Point2D, curve: Extract<CutCurve, { type: 'arc' }>): string => {
  const radius = Math.hypot(from.x - curve.center.x, from.y - curve.center.y)
  const flag = curve.clockwise ? 0 : 1
  if (Math.hypot(from.x - to.x, from.y - to.y) < 1e-9) {
    const opposite = { x: 2 * curve.center.x - from.x, y: 2 * curve.center.y - from.y }
    return `A ${num(radius)} ${num(radius)} 0 1 ${flag} ${point(opposite)} A ${num(radius)} ${num(radius)} 0 1 ${flag} ${point(to)}`
  }
  const a0 = Math.atan2(from.y - curve.center.y, from.x - curve.center.x)
  const a1 = Math.atan2(to.y - curve.center.y, to.x - curve.center.x)
  const raw = curve.clockwise ? a0 - a1 : a1 - a0
  const sweep = ((raw % TAU) + TAU) % TAU
  return `A ${num(radius)} ${num(radius)} 0 ${sweep > Math.PI ? 1 : 0} ${flag} ${point(to)}`
}

const actionPath = (action: ReviewAction): string => {
  const points = action.points
  if (points.length < 2) return ''
  const first = points[0]
  const last = points[points.length - 1]
  const head = `M ${point(first)}`
  if (action.curve?.type === 'arc') return `${head} ${arcSegment(first, last, action.curve)}`
  if (action.curve?.type === 'bezier') {
    const control = action.curve.controlPoints
    if (control.length === 1) return `${head} Q ${point(control[0])} ${point(last)}`
    if (control.length === 2) return `${head} C ${point(control[0])} ${point(control[1])} ${point(last)}`
  }
  return `${head} ${points.slice(1).map((p) => `L ${point(p)}`).join(' ')}`
}

type Phase = 'trail' | 'remaining' | undefined

const phaseAttrs = (phase: Phase): string =>
  phase === 'trail' ? ' data-trail="true"' : phase === 'remaining' ? ' data-remaining="true" opacity="0.3"' : ''

const lineGroup = (kind: LineKind, actions: readonly ReviewAction[], unit: number, phase?: Phase): string => {
  const style = LINE_STYLES[kind]
  const d = actions.map(actionPath).filter(Boolean).join(' ')
  if (!d) return ''
  return `<path${attr('data-kind', kind)}${phaseAttrs(phase)}${attr('d', d)} fill="none"${attr('stroke', style.stroke)}` +
    `${attr('stroke-width', num(style.width * unit))}${attr('stroke-dasharray', dashOf(style, unit))}` +
    `${attr('stroke-linecap', style.cap)}/>`
}

const markerShape = (center: Point2D, radius: number): string =>
  `<circle${attr('cx', num(center.x))}${attr('cy', num(center.y))}${attr('r', num(radius))}/>` +
  `<path${attr('d', `M ${num(center.x - radius * 1.8)} ${num(center.y)} L ${num(center.x + radius * 1.8)} ${num(center.y)} M ${num(center.x)} ${num(center.y - radius * 1.8)} L ${num(center.x)} ${num(center.y + radius * 1.8)}`)} fill="none"/>`

const pierceGroup = (actions: readonly ReviewAction[], unit: number, phase?: Phase): string => {
  if (actions.length === 0) return ''
  const radius = 1.6 * unit
  return `<g data-kind="pierce"${phaseAttrs(phase)} fill="#dc2626" stroke="#dc2626"${attr('stroke-width', num(0.5 * unit))}>` +
    `${actions.map((action) => markerShape(action.points[0], radius)).join('')}</g>`
}

const partElement = (part: ReviewPart, unit: number, selected: boolean): string => {
  const flagged = part.status === 'flagged'
  const d = part.outlines.map(ring).join(' ')
  return `<path${attr('data-part-key', part.key)}${attr('data-status', part.status)}${attr('d', d)} fill-rule="evenodd"` +
    `${attr('fill', flagged ? 'url(#review-hatch)' : '#dbeafe')}${attr('stroke', flagged ? '#b91c1c' : '#1d4ed8')}` +
    `${attr('stroke-width', num((selected ? 2.4 : 0.8) * unit))}` +
    `${attr('stroke-dasharray', flagged ? `${num(3 * unit)} ${num(2 * unit)}` : undefined)}` +
    `${selected ? ' data-selected="true"' : ''}/>`
}

const legend = (unit: number, width: number, top: number): string => {
  const size = unit * 9
  const rowHeight = size * 2.2
  const columns = 4
  const cell = width / columns
  const entries = LEGEND_KINDS.map((kind, index) => {
    const x = (index % columns) * cell
    const y = top + Math.floor(index / columns) * rowHeight + rowHeight / 2
    const sample = kind === 'pierce'
      ? `<g data-kind="pierce" fill="#dc2626" stroke="#dc2626">${markerShape({ x: x + size * 1.2, y }, 1.6 * unit)}</g>`
      : (() => {
          const style = LINE_STYLES[kind as LineKind]
          return `<path${attr('d', `M ${num(x)} ${num(y)} L ${num(x + size * 2.4)} ${num(y)}`)} fill="none"${attr('stroke', style.stroke)}` +
            `${attr('stroke-width', num(style.width * unit))}${attr('stroke-dasharray', dashOf(style, unit))}${attr('stroke-linecap', style.cap)}/>`
        })()
    return `<g data-legend-kind="${kind}" role="listitem">${sample}` +
      `<text${attr('x', num(x + size * 3))}${attr('y', num(y + size * 0.35))}${attr('font-size', num(size))} fill="#111827">` +
      `${escapeXml(messages.actionLabel(kind))}</text></g>`
  })
  return `<g data-legend role="list"${attr('aria-label', messages.panels.legend)}>${entries.join('')}</g>`
}

const headMarker = (head: Point2D, unit: number): string =>
  `<g data-head${attr('data-x', num(head.x))}${attr('data-y', num(head.y))} fill="none" stroke="#f59e0b"${attr('stroke-width', num(1.2 * unit))}>` +
  `<circle${attr('cx', num(head.x))}${attr('cy', num(head.y))}${attr('r', num(3 * unit))}/>` +
  `<path${attr('d', `M ${num(head.x - 4.5 * unit)} ${num(head.y)} L ${num(head.x + 4.5 * unit)} ${num(head.y)} M ${num(head.x)} ${num(head.y - 4.5 * unit)} L ${num(head.x)} ${num(head.y + 4.5 * unit)}`)}/></g>`

const actionLayers = (actions: readonly ReviewAction[], unit: number, phase?: Phase): string =>
  LINE_KINDS.map((kind) => lineGroup(kind, actions.filter((a) => a.kind === kind), unit, phase)).join('') +
  pierceGroup(actions.filter((a) => a.kind === 'pierce'), unit, phase)

const playbackLayers = (scene: ReviewScene, actions: readonly ReviewAction[], position: ReviewPosition, unit: number): string => {
  const state = stateAt(scene, position)
  const current = state.current
  const partial = current && current.kind !== 'pierce' && position.progress > 0
    ? [{ ...current, curve: undefined, points: actionPrefix(current, position.progress) }]
    : []
  return actionLayers(actions.slice(state.completed), unit, 'remaining') +
    actionLayers([...actions.slice(0, state.completed), ...partial], unit, 'trail') +
    (state.head ? headMarker(state.head, unit) : '')
}

const selectedActionLayer = (sheet: ReviewSheet, selection: ReviewSelection | null | undefined, unit: number): string => {
  if (selection?.kind !== 'action' || selection.sheetId !== sheet.id) return ''
  const action = sheet.timeline?.actions[selection.actionIndex]
  if (!action) return ''
  const d = action.points.length >= 2 ? actionPath(action) : `M ${point(action.points[0] ?? { x: 0, y: 0 })} l 0.001 0`
  return `<path data-selected-action="true"${attr('d', d)} fill="none" stroke="#f59e0b"${attr('stroke-width', num(3.2 * unit))} stroke-linecap="round"/>`
}

const sheetBody = (scene: ReviewScene, sheet: ReviewSheet, options: RenderReviewSvgOptions, unit: number): string => {
  const { width, height } = sheet.stock
  const selectedPart = options.selection?.kind === 'part' && options.selection.sheetId === sheet.id
    ? options.selection.partKey
    : undefined
  const actions = sheet.timeline?.actions ?? []
  const layers = options.position && actions.length > 0
    ? playbackLayers(scene, actions, options.position, unit)
    : actionLayers(actions, unit)
  return `<g${attr('data-sheet-id', sheet.id)} transform="matrix(1 0 0 -1 0 ${num(height)})">` +
    `<rect x="0" y="0"${attr('width', num(width))}${attr('height', num(height))} fill="#ffffff" stroke="#374151"` +
    `${attr('stroke-width', num(1.5 * unit))}${attr('stroke-dasharray', `${num(6 * unit)} ${num(4 * unit)}`)}/>` +
    `${sheet.parts.map((part) => partElement(part, unit, part.key === selectedPart)).join('')}${layers}` +
    `${selectedActionLayer(sheet, options.selection, unit)}${overlayLayer(options.overlay, unit)}</g>`
}

/**
 * Renders one sheet of a review scene as a self-contained, DOM-free SVG string.
 *
 * Parts are filled, flagged parts are hatched and dashed, and each action kind has its own line
 * style or marker shape, so the distinction never relies on color alone.
 *
 * @param scene - Scene built by `buildReviewScene`.
 * @param options - Sheet to draw, optional playback position and selection.
 * @returns SVG markup; an explicit empty drawing when the sheet does not exist.
 * @example
 * ```typescript
 * const svg = renderReviewSvg(scene, { sheetId: 'sheet-1' })
 * ```
 */
export function renderReviewSvg(scene: ReviewScene, options: RenderReviewSvgOptions): string {
  const sheet = scene.sheets.find((candidate) => candidate.id === options.sheetId)
  const shell = (viewBox: string, title: string, description: string, body: string): string =>
    `<svg xmlns="http://www.w3.org/2000/svg"${attr('viewBox', viewBox)} role="img" aria-labelledby="review-title review-desc" width="100%" height="100%">` +
    `<title id="review-title">${escapeXml(title)}</title><desc id="review-desc">${escapeXml(description)}</desc>${body}</svg>`
  if (!sheet) {
    return shell('0 0 100 50', messages.svgTitle(options.sheetId), messages.svgDescription(0, 0), '')
  }

  const { width, height } = sheet.stock
  const unit = Math.max(width, height) / 400
  const margin = Math.max(width, height) * 0.04
  const legendTop = height + margin * 1.5
  const legendHeight = unit * 9 * 2.2 * Math.ceil(LEGEND_KINDS.length / 4)
  const zoomed = options.viewport &&
    (options.viewport.zoom !== 1 || options.viewport.center.x !== width / 2 || options.viewport.center.y !== height / 2)
  const viewBox = zoomed && options.viewport
    ? `${num(options.viewport.center.x - (width * 1.08) / options.viewport.zoom / 2)} ${num(height - options.viewport.center.y - (height * 1.08) / options.viewport.zoom / 2)} ${num((width * 1.08) / options.viewport.zoom)} ${num((height * 1.08) / options.viewport.zoom)}`
    : `${num(-margin)} ${num(-margin)} ${num(width + margin * 2)} ${num(height + margin * 2.5 + legendHeight)}`
  const actions = sheet.timeline?.actions.length ?? 0
  const defs = `<defs><pattern id="review-hatch" width="${num(4 * unit)}" height="${num(4 * unit)}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
    `<rect width="${num(4 * unit)}" height="${num(4 * unit)}" fill="#fee2e2"/>` +
    `<line x1="0" y1="0" x2="0" y2="${num(4 * unit)}" stroke="#b91c1c" stroke-width="${num(1 * unit)}"/></pattern></defs>`
  return shell(
    viewBox,
    messages.svgTitle(sheet.id),
    messages.svgDescription(sheet.parts.length, actions),
    defs + sheetBody(scene, sheet, options, unit) + legend(unit, width, legendTop),
  )
}
