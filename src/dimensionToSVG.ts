import { Box2 } from 'vecks'

import colors from './util/colors'
import escapeXmlText from './util/escapeXmlText'
import round10 from './util/round10'

import type { DimensionEntity, ToSVGOptions } from './types'
import type { DimStyleTable } from './types/dxf'
import type { BoundsAndElement } from './types/svg'

const DEFAULT_DIMENSION_DECIMALS = 2
const DEFAULT_SCREEN_STROKE_WIDTH_PERCENT = 0.1
const DEFAULT_DIMENSION_LINE_WEIGHT = 0.5

export interface DimensionViewport {
  width: number
  height: number
}

// AutoScale is meant to improve readability of dimension graphics.
// Scale is derived from the drawing viewport (final SVG viewBox size).
// No min/max clamp by design.
const AUTOSCALE_VIEWPORT_REFERENCE = 40

const computeViewportAutoScaleFactor = (
  viewport: DimensionViewport,
  options: ToSVGOptions | undefined,
): number => {
  const viewportMin = Math.min(
    Math.abs(viewport.width),
    Math.abs(viewport.height),
  )
  if (!Number.isFinite(viewportMin) || viewportMin <= 0) return 1

  const reference = options?.dimension?.autoScaleViewportReference
  const safeReference =
    Number.isFinite(reference) && (reference ?? 0) > 0
      ? (reference as number)
      : AUTOSCALE_VIEWPORT_REFERENCE

  return viewportMin / safeReference
}

const getViewportMin = (viewport: DimensionViewport): number => {
  const viewportMin = Math.min(
    Math.abs(viewport.width),
    Math.abs(viewport.height),
  )
  return Number.isFinite(viewportMin) ? viewportMin : Number.NaN
}

const getViewportPercentageSize = (
  viewport: DimensionViewport,
  percent: number | undefined,
): number | undefined => {
  if (!Number.isFinite(percent) || (percent ?? 0) <= 0) return undefined
  const viewportMin = getViewportMin(viewport)
  if (!Number.isFinite(viewportMin) || viewportMin <= 0) return undefined
  return viewportMin * ((percent as number) / 100)
}

export const getDimensionGeometryBBox = (entity: DimensionEntity): Box2 => {
  const bbox = new Box2()

  const points = [
    entity.start,
    entity.angleVertex,
    entity.arcPoint,
    entity.textMidpoint,
    entity.measureStart,
    entity.measureEnd,
  ]

  for (const p of points) {
    if (!p) continue
    const x = p.x
    const y = p.y
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    bbox.expandByPoint({ x, y })
  }

  return bbox
}

const getScaledDimensionSizes = (
  dimStyle: DimStyleTable | undefined,
  options: ToSVGOptions | undefined,
  viewport: DimensionViewport | undefined,
): {
  arrowSize: number
  textHeight: number
  extLineOffset: number
  extLineExtension: number
} => {
  const autoScale = options?.dimension?.autoScale === true

  const baseArrowSize = dimStyle?.dimAsz ?? 2.5
  const baseTextHeight = dimStyle?.dimTxt ?? 2.5
  const baseExtLineOffset = dimStyle?.dimExo ?? 0.625
  const baseExtLineExtension = dimStyle?.dimExe ?? 1.25

  if (!autoScale || !viewport) {
    return {
      arrowSize: baseArrowSize,
      textHeight: baseTextHeight,
      extLineOffset: baseExtLineOffset,
      extLineExtension: baseExtLineExtension,
    }
  }

  const scale = computeViewportAutoScaleFactor(viewport, options)

  const perc = options?.dimension?.autoScaleViewportPercentages
  const arrowFromPct = getViewportPercentageSize(viewport, perc?.arrowSize)
  const textFromPct = getViewportPercentageSize(viewport, perc?.textHeight)
  const offsetFromPct = getViewportPercentageSize(viewport, perc?.extLineOffset)
  const extensionFromPct = getViewportPercentageSize(
    viewport,
    perc?.extLineExtension,
  )

  return {
    arrowSize: arrowFromPct ?? baseArrowSize * scale,
    textHeight: textFromPct ?? baseTextHeight * scale,
    extLineOffset: offsetFromPct ?? baseExtLineOffset * scale,
    extLineExtension: extensionFromPct ?? baseExtLineExtension * scale,
  }
}

const formatDimensionValue = (
  value: number,
  decimals: number = DEFAULT_DIMENSION_DECIMALS,
): string => {
  if (!Number.isFinite(value)) return ''
  const rounded = round10(value, -decimals)
  return rounded.toFixed(decimals)
}

const computeRadiusFallback = (entity: DimensionEntity): number => {
  const cx = entity.start?.x ?? 0
  const cy = entity.start?.y ?? 0
  const x1 = entity.measureStart?.x ?? 0
  const y1 = entity.measureStart?.y ?? 0
  const x2 = entity.measureEnd?.x ?? 0
  const y2 = entity.measureEnd?.y ?? 0

  const r1 = Math.hypot(x1 - cx, y1 - cy)
  const r2 = Math.hypot(x2 - cx, y2 - cy)
  const chord = Math.hypot(x2 - x1, y2 - y1)
  return Math.max(r1, r2, chord)
}

const computeLinearDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number => Math.hypot(x2 - x1, y2 - y1)

const computeAngularDegreesMinimal = (
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number => {
  const a1 = Math.atan2(y1 - cy, x1 - cx)
  const a2 = Math.atan2(y2 - cy, x2 - cx)
  let delta = Math.abs(a2 - a1)
  while (delta > Math.PI * 2) delta -= Math.PI * 2
  if (delta > Math.PI) delta = Math.PI * 2 - delta
  return (delta * 180) / Math.PI
}

const computeAngularDegreesCCW = (
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number => {
  const a1 = Math.atan2(y1 - cy, x1 - cx)
  const a2 = Math.atan2(y2 - cy, x2 - cx)
  let delta = a2 - a1
  while (delta < 0) delta += Math.PI * 2
  while (delta >= Math.PI * 2) delta -= Math.PI * 2
  return (delta * 180) / Math.PI
}

const computeDimensionMeasurement = (entity: DimensionEntity): string => {
  const x1 = entity.measureStart?.x ?? 0
  const y1 = entity.measureStart?.y ?? 0
  const x2 = entity.measureEnd?.x ?? 0
  const y2 = entity.measureEnd?.y ?? 0

  switch (entity.dimensionType) {
    case 0:
    case 1:
    case 6: {
      const dist = computeLinearDistance(x1, y1, x2, y2)
      return formatDimensionValue(dist)
    }
    case 3: {
      const dist = computeLinearDistance(x1, y1, x2, y2)
      if (dist > 0) return formatDimensionValue(dist)
      const radius = computeRadiusFallback(entity)
      return formatDimensionValue(radius * 2)
    }
    case 4: {
      const dist = computeLinearDistance(x1, y1, x2, y2)
      if (dist > 0) return formatDimensionValue(dist)
      const radius = computeRadiusFallback(entity)
      return formatDimensionValue(radius)
    }
    case 2: {
      const cx = entity.start?.x ?? 0
      const cy = entity.start?.y ?? 0
      const degrees = computeAngularDegreesMinimal(cx, cy, x1, y1, x2, y2)
      const formatted = formatDimensionValue(degrees)
      return formatted ? `${formatted}°` : ''
    }
    case 5: {
      const cx = entity.angleVertex?.x ?? 0
      const cy = entity.angleVertex?.y ?? 0
      const degrees = computeAngularDegreesCCW(cx, cy, x1, y1, x2, y2)
      const formatted = formatDimensionValue(degrees)
      return formatted ? `${formatted}°` : ''
    }
    default:
      return ''
  }
}

const resolveDimensionText = (entity: DimensionEntity): string => {
  const raw = typeof entity.text === 'string' ? entity.text : ''
  const trimmed = raw.trim()
  const measured = computeDimensionMeasurement(entity)

  if (!trimmed) return measured
  if (trimmed.includes('<>')) {
    return trimmed.split('<>').join(measured)
  }
  return trimmed
}

const expandBBoxForMarker = (
  bbox: Box2,
  x: number,
  y: number,
  size: number,
) => {
  bbox.expandByPoint({ x: x - size, y: y - size })
  bbox.expandByPoint({ x: x + size, y: y + size })
}

const expandBBoxForText = (
  bbox: Box2,
  x: number,
  y: number,
  height: number,
  content: string,
) => {
  const textWidth = content.length * height * 0.6
  // text-anchor="middle" is used everywhere in DIMENSION rendering
  bbox.expandByPoint({ x: x - textWidth / 2, y: y - height })
  bbox.expandByPoint({ x: x + textWidth / 2, y: y + height })
}

/**
 * Convert DXF color number to SVG color string
 */
function colorNumberToSVG(colorNumber?: number): string {
  if (colorNumber === undefined || colorNumber < 0) {
    return 'currentColor'
  }

  // DXF color 0 is ByBlock, 256 is ByLayer, 7 is white/black (depends on bg)
  if (colorNumber === 0 || colorNumber === 256) {
    return 'currentColor'
  }

  // Get RGB from color table
  const rgb = colors[colorNumber]
  if (!rgb) {
    return 'currentColor'
  }

  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
}

const getScaledStrokeWidth = (
  baseWeight: number,
  viewport: DimensionViewport | undefined,
  options: ToSVGOptions | undefined,
): string => {
  if (!options?.strokeWidth) {
    return String(baseWeight)
  }

  const ratio = baseWeight / DEFAULT_DIMENSION_LINE_WEIGHT
  const value =
    Number.isFinite(options.strokeWidth.value) &&
    (options.strokeWidth.value ?? 0) > 0
      ? (options.strokeWidth.value as number)
      : DEFAULT_SCREEN_STROKE_WIDTH_PERCENT

  if (options.strokeWidth.mode === 'viewport') {
    if (!viewport) {
      return String(baseWeight)
    }

    const viewportMin = getViewportMin(viewport)
    if (!Number.isFinite(viewportMin) || viewportMin <= 0) {
      return String(baseWeight)
    }

    return String((viewportMin * value * ratio) / 100)
  }

  return `${value * ratio}%`
}

const normalizeDimensionLineWeight = (weight: number | undefined): number => {
  return Number.isFinite(weight) && (weight ?? 0) > 0
    ? (weight as number)
    : DEFAULT_DIMENSION_LINE_WEIGHT
}

/**
 * Get dimension colors and weights from DIMSTYLE with defaults
 */
function getDimensionColors(
  dimStyle: DimStyleTable | undefined,
  options: ToSVGOptions | undefined,
  viewport: DimensionViewport | undefined,
): {
  dimLineColor: string
  extLineColor: string
  textColor: string
  dimLineWeight: string
  extLineWeight: string
} {
  const dimLineWeight = normalizeDimensionLineWeight(dimStyle?.dimLwd)
  const extLineWeight = normalizeDimensionLineWeight(dimStyle?.dimLwe)

  return {
    dimLineColor: colorNumberToSVG(dimStyle?.dimClrd),
    extLineColor: colorNumberToSVG(dimStyle?.dimClre),
    textColor: colorNumberToSVG(dimStyle?.dimClrt),
    dimLineWeight: getScaledStrokeWidth(dimLineWeight, viewport, options),
    extLineWeight: getScaledStrokeWidth(extLineWeight, viewport, options),
  }
}

/**
 * Render DIMENSION entity to SVG with proper DIMSTYLE support
 */
export default function dimensionToSVG(
  entity: DimensionEntity,
  dimStyle?: DimStyleTable,
  options?: ToSVGOptions,
  viewport?: DimensionViewport,
): BoundsAndElement {
  // Dispatch to appropriate renderer based on dimension type
  switch (entity.dimensionType) {
    case 0: // Rotated, horizontal, or vertical
    case 1: // Aligned
      return renderLinearDimension(entity, dimStyle, options, viewport)
    case 2: // Angular
      return renderAngularDimension(entity, dimStyle, options, viewport)
    case 5: // Angular 3-point
      return renderAngular3PointDimension(entity, dimStyle, options, viewport)
    case 3: // Diameter
      return renderDiameterDimension(entity, dimStyle, options, viewport)
    case 4: // Radius
      return renderRadialDimension(entity, dimStyle, options, viewport)
    case 6: // Ordinate
      return renderOrdinateDimension(entity, dimStyle, options, viewport)
    default:
      // Fallback to simple line rendering
      return renderFallbackDimension(entity)
  }
}

/**
 * Render angular 3-point dimension (type 5).
 *
 * Based on DXF reference + ezdxf: angle is measured from p1 to p2
 * counter-clockwise around the vertex.
 */
function renderAngular3PointDimension(
  entity: DimensionEntity,
  dimStyle?: DimStyleTable,
  options?: ToSVGOptions,
  viewport?: DimensionViewport,
): BoundsAndElement {
  const bbox = new Box2()
  const elements: string[] = []
  const markers: string[] = []

  const { arrowSize, textHeight } = getScaledDimensionSizes(
    dimStyle,
    options,
    viewport,
  )
  const {
    dimLineColor,
    extLineColor,
    textColor,
    dimLineWeight,
    extLineWeight,
  } = getDimensionColors(dimStyle, options, viewport)

  const vertexX = entity.angleVertex?.x ?? 0
  const vertexY = entity.angleVertex?.y ?? 0
  const x1 = entity.measureStart?.x ?? 0
  const y1 = entity.measureStart?.y ?? 0
  const x2 = entity.measureEnd?.x ?? 0
  const y2 = entity.measureEnd?.y ?? 0

  // DXF reference: point (10,20,30) specifies the dimension line arc location.
  // In practice, ezdxf may also provide (16,26,36); prefer arcPoint only if it
  // yields a meaningful radius away from the vertex.
  const startArcX = entity.start?.x ?? 0
  const startArcY = entity.start?.y ?? 0
  const arcPointX = entity.arcPoint?.x
  const arcPointY = entity.arcPoint?.y

  const arcPointRadius =
    Number.isFinite(arcPointX) && Number.isFinite(arcPointY)
      ? Math.hypot(
          (arcPointX as number) - vertexX,
          (arcPointY as number) - vertexY,
        )
      : Number.NaN

  const useArcPoint = Number.isFinite(arcPointRadius) && arcPointRadius > 1e-9
  const arcLocationX = useArcPoint ? (arcPointX as number) : startArcX
  const arcLocationY = useArcPoint ? (arcPointY as number) : startArcY

  const textX = entity.textMidpoint?.x ?? arcLocationX
  const textY = entity.textMidpoint?.y ?? arcLocationY

  bbox.expandByPoint({ x: vertexX, y: vertexY })
  bbox.expandByPoint({ x: x1, y: y1 })
  bbox.expandByPoint({ x: x2, y: y2 })
  bbox.expandByPoint({ x: arcLocationX, y: arcLocationY })
  bbox.expandByPoint({ x: textX, y: textY })

  const a1 = Math.atan2(y1 - vertexY, x1 - vertexX)
  const a2 = Math.atan2(y2 - vertexY, x2 - vertexX)

  let radius = Math.hypot(arcLocationX - vertexX, arcLocationY - vertexY)
  if (!Number.isFinite(radius) || radius <= 1e-9) {
    radius = Math.hypot(textX - vertexX, textY - vertexY)
  }
  if (!Number.isFinite(radius) || radius <= 1e-9) {
    radius = Math.max(
      Math.hypot(x1 - vertexX, y1 - vertexY),
      Math.hypot(x2 - vertexX, y2 - vertexY),
    )
  }

  const arcStartX = vertexX + radius * Math.cos(a1)
  const arcStartY = vertexY + radius * Math.sin(a1)
  const arcEndX = vertexX + radius * Math.cos(a2)
  const arcEndY = vertexY + radius * Math.sin(a2)

  bbox.expandByPoint({ x: arcStartX, y: arcStartY })
  bbox.expandByPoint({ x: arcEndX, y: arcEndY })

  // Create arrow markers
  const markerId1 = `dim-angular-3p-arrow-start-${Date.now()}`
  const markerId2 = `dim-angular-3p-arrow-end-${Date.now()}`
  markers.push(
    createArrowMarker(markerId1, arrowSize, dimLineColor, 'backward'),
    createArrowMarker(markerId2, arrowSize, dimLineColor, 'forward'),
  )

  // Extension lines from definition points to arc endpoints.
  elements.push(
    `<line x1="${x1}" y1="${y1}" x2="${arcStartX}" y2="${arcStartY}" stroke="${extLineColor}" stroke-width="${extLineWeight}" />`,
    `<line x1="${x2}" y1="${y2}" x2="${arcEndX}" y2="${arcEndY}" stroke="${extLineColor}" stroke-width="${extLineWeight}" />`,
  )

  // Arc from a1 to a2 in CCW orientation.
  let delta = a2 - a1
  while (delta < 0) delta += Math.PI * 2
  while (delta >= Math.PI * 2) delta -= Math.PI * 2
  const largeArcFlag = delta > Math.PI ? 1 : 0
  const sweepFlag = 1

  expandBBoxForMarker(bbox, arcStartX, arcStartY, arrowSize)
  expandBBoxForMarker(bbox, arcEndX, arcEndY, arrowSize)

  elements.push(
    `<path d="M ${arcStartX} ${arcStartY} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${arcEndX} ${arcEndY}" fill="none" stroke="${dimLineColor}" stroke-width="${dimLineWeight}" marker-start="url(#${markerId1})" marker-end="url(#${markerId2})" />`,
  )

  const resolvedText = resolveDimensionText(entity)
  if (resolvedText) {
    const midAngle = a1 + delta / 2
    const textRotation = (midAngle * 180) / Math.PI

    expandBBoxForText(bbox, textX, textY, textHeight, resolvedText)

    elements.push(
      `<text x="${textX}" y="${textY}" font-size="${textHeight}" fill="${textColor}" stroke="none" text-anchor="middle" transform="rotate(${-textRotation} ${textX} ${textY}) scale(1,-1) translate(0 ${-2 * textY})">${escapeXmlText(resolvedText)}</text>`,
    )
  }

  return {
    bbox,
    element: `<defs>${markers.join('')}</defs><g>${elements.join('')}</g>`,
  }
}

/**
 * Create SVG marker definition for dimension arrows
 */
export function createArrowMarker(
  id: string,
  size: number,
  color: string,
  direction: 'forward' | 'backward' = 'forward',
): string {
  const arrowPath =
    direction === 'forward'
      ? `M 0 0 L ${size} ${size / 2} L 0 ${size} z`
      : `M ${size} 0 L 0 ${size / 2} L ${size} ${size} z`
  const refX = direction === 'forward' ? size : 0

  return `<marker id="${id}" markerWidth="${size}" markerHeight="${size}" refX="${refX}" refY="${size / 2}" orient="auto" markerUnits="userSpaceOnUse">
    <path d="${arrowPath}" fill="${color}" />
  </marker>`
}

/**
 * Render linear dimension (rotated, horizontal, vertical, or aligned)
 */
function renderLinearDimension(
  entity: DimensionEntity,
  dimStyle?: DimStyleTable,
  options?: ToSVGOptions,
  viewport?: DimensionViewport,
): BoundsAndElement {
  const bbox = new Box2()
  const elements: string[] = []
  const markers: string[] = []

  // Get dimension style properties with defaults (optionally auto-scaled)
  const { arrowSize, textHeight, extLineOffset, extLineExtension } =
    getScaledDimensionSizes(dimStyle, options, viewport)
  const {
    dimLineColor,
    extLineColor,
    textColor,
    dimLineWeight,
    extLineWeight,
  } = getDimensionColors(dimStyle, options, viewport)

  // Extract dimension geometry
  const defPoint1X = entity.measureStart?.x ?? 0
  const defPoint1Y = entity.measureStart?.y ?? 0
  const defPoint2X = entity.measureEnd?.x ?? 0
  const defPoint2Y = entity.measureEnd?.y ?? 0
  const dimLineY = entity.start?.y ?? 0
  const textX = entity.textMidpoint?.x ?? (defPoint1X + defPoint2X) / 2
  const textY = entity.textMidpoint?.y ?? (defPoint1Y + defPoint2Y) / 2

  // Calculate dimension line angle
  const angle = Math.atan2(defPoint2Y - defPoint1Y, defPoint2X - defPoint1X)
  const perpAngle = angle + Math.PI / 2

  // Calculate dimension line endpoints
  const dimLine1X = defPoint1X + Math.cos(perpAngle) * (dimLineY - defPoint1Y)
  const dimLine1Y = defPoint1Y + Math.sin(perpAngle) * (dimLineY - defPoint1Y)
  const dimLine2X = defPoint2X + Math.cos(perpAngle) * (dimLineY - defPoint2Y)
  const dimLine2Y = defPoint2Y + Math.sin(perpAngle) * (dimLineY - defPoint2Y)

  // Expand bounding box
  bbox.expandByPoint({ x: defPoint1X, y: defPoint1Y })
  bbox.expandByPoint({ x: defPoint2X, y: defPoint2Y })
  bbox.expandByPoint({ x: dimLine1X, y: dimLine1Y })
  bbox.expandByPoint({ x: dimLine2X, y: dimLine2Y })
  bbox.expandByPoint({ x: textX, y: textY })

  // Create unique marker IDs for arrows
  const markerId1 = `dim-arrow-start-${Date.now()}`
  const markerId2 = `dim-arrow-end-${Date.now()}`

  // Create arrow markers with dimension line color
  markers.push(
    createArrowMarker(markerId1, arrowSize, dimLineColor, 'backward'),
    createArrowMarker(markerId2, arrowSize, dimLineColor, 'forward'),
  )

  // Draw extension lines
  const extLine1StartX = defPoint1X + Math.cos(perpAngle) * extLineOffset
  const extLine1StartY = defPoint1Y + Math.sin(perpAngle) * extLineOffset
  const extLine1EndX = dimLine1X + Math.cos(perpAngle) * extLineExtension
  const extLine1EndY = dimLine1Y + Math.sin(perpAngle) * extLineExtension

  const extLine2StartX = defPoint2X + Math.cos(perpAngle) * extLineOffset
  const extLine2StartY = defPoint2Y + Math.sin(perpAngle) * extLineOffset
  const extLine2EndX = dimLine2X + Math.cos(perpAngle) * extLineExtension
  const extLine2EndY = dimLine2Y + Math.sin(perpAngle) * extLineExtension

  // Expand bounding box to include full extension lines and arrow markers
  bbox.expandByPoint({ x: extLine1StartX, y: extLine1StartY })
  bbox.expandByPoint({ x: extLine1EndX, y: extLine1EndY })
  bbox.expandByPoint({ x: extLine2StartX, y: extLine2StartY })
  bbox.expandByPoint({ x: extLine2EndX, y: extLine2EndY })
  expandBBoxForMarker(bbox, dimLine1X, dimLine1Y, arrowSize)
  expandBBoxForMarker(bbox, dimLine2X, dimLine2Y, arrowSize)

  elements.push(
    `<line x1="${extLine1StartX}" y1="${extLine1StartY}" x2="${extLine1EndX}" y2="${extLine1EndY}" stroke="${extLineColor}" stroke-width="${extLineWeight}" />`,
    `<line x1="${extLine2StartX}" y1="${extLine2StartY}" x2="${extLine2EndX}" y2="${extLine2EndY}" stroke="${extLineColor}" stroke-width="${extLineWeight}" />`,
    `<line x1="${dimLine1X}" y1="${dimLine1Y}" x2="${dimLine2X}" y2="${dimLine2Y}" stroke="${dimLineColor}" stroke-width="${dimLineWeight}" marker-start="url(#${markerId1})" marker-end="url(#${markerId2})" />`,
  )

  // Add dimension text
  const resolvedText = resolveDimensionText(entity)
  if (resolvedText) {
    const textRotation = (angle * 180) / Math.PI
    expandBBoxForText(bbox, textX, textY, textHeight, resolvedText)
    elements.push(
      `<text x="${textX}" y="${textY}" font-size="${textHeight}" fill="${textColor}" stroke="none" text-anchor="middle" transform="rotate(${-textRotation} ${textX} ${textY}) scale(1,-1) translate(0 ${-2 * textY})">${escapeXmlText(resolvedText)}</text>`,
    )
  }

  return {
    bbox,
    element: `<defs>${markers.join('')}</defs><g>${elements.join('')}</g>`,
  }
}

/**
 * Render angular dimension
 */
function renderAngularDimension(
  entity: DimensionEntity,
  dimStyle?: DimStyleTable,
  options?: ToSVGOptions,
  viewport?: DimensionViewport,
): BoundsAndElement {
  const bbox = new Box2()
  const elements: string[] = []
  const markers: string[] = []

  // Get dimension style properties (optionally auto-scaled)
  const { arrowSize, textHeight } = getScaledDimensionSizes(
    dimStyle,
    options,
    viewport,
  )
  const {
    dimLineColor,
    extLineColor,
    textColor,
    dimLineWeight,
    extLineWeight,
  } = getDimensionColors(dimStyle, options, viewport)

  // Extract points
  const centerX = entity.start?.x ?? 0
  const centerY = entity.start?.y ?? 0
  const x1 = entity.measureStart?.x ?? 0
  const y1 = entity.measureStart?.y ?? 0
  const x2 = entity.measureEnd?.x ?? 0
  const y2 = entity.measureEnd?.y ?? 0
  const textX = entity.textMidpoint?.x ?? centerX
  const textY = entity.textMidpoint?.y ?? centerY

  bbox.expandByPoint({ x: centerX, y: centerY })
  bbox.expandByPoint({ x: x1, y: y1 })
  bbox.expandByPoint({ x: x2, y: y2 })
  bbox.expandByPoint({ x: textX, y: textY })

  // Create arrow markers
  const markerId1 = `dim-angular-arrow-start-${Date.now()}`
  const markerId2 = `dim-angular-arrow-end-${Date.now()}`
  markers.push(
    createArrowMarker(markerId1, arrowSize, dimLineColor, 'backward'),
    createArrowMarker(markerId2, arrowSize, dimLineColor, 'forward'),
  )

  // Draw extension lines from center to definition points
  elements.push(
    `<line x1="${centerX}" y1="${centerY}" x2="${x1}" y2="${y1}" stroke="${extLineColor}" stroke-width="${extLineWeight}" />`,
    `<line x1="${centerX}" y1="${centerY}" x2="${x2}" y2="${y2}" stroke="${extLineColor}" stroke-width="${extLineWeight}" />`,
  )

  // Calculate arc radius (distance from center to text midpoint)
  const radius = Math.hypot(textX - centerX, textY - centerY)
  const startAngle = Math.atan2(y1 - centerY, x1 - centerX)
  const endAngle = Math.atan2(y2 - centerY, x2 - centerX)

  // Draw arc for angular dimension
  const largeArcFlag = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0
  const arcStartX = centerX + radius * Math.cos(startAngle)
  const arcStartY = centerY + radius * Math.sin(startAngle)
  const arcEndX = centerX + radius * Math.cos(endAngle)
  const arcEndY = centerY + radius * Math.sin(endAngle)

  elements.push(
    `<path d="M ${arcStartX} ${arcStartY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${arcEndX} ${arcEndY}" fill="none" stroke="${dimLineColor}" stroke-width="${dimLineWeight}" marker-start="url(#${markerId1})" marker-end="url(#${markerId2})" />`,
  )

  // Add dimension text
  const resolvedText = resolveDimensionText(entity)
  if (resolvedText) {
    const midAngle = (startAngle + endAngle) / 2
    const textRotation = (midAngle * 180) / Math.PI

    expandBBoxForText(bbox, textX, textY, textHeight, resolvedText)

    elements.push(
      `<text x="${textX}" y="${textY}" font-size="${textHeight}" fill="${textColor}" stroke="none" text-anchor="middle" transform="rotate(${-textRotation} ${textX} ${textY}) scale(1,-1) translate(0 ${-2 * textY})">${escapeXmlText(resolvedText)}</text>`,
    )
  }

  return {
    bbox,
    element: `<defs>${markers.join('')}</defs><g>${elements.join('')}</g>`,
  }
}

/**
 * Render diameter dimension
 */
function renderDiameterDimension(
  entity: DimensionEntity,
  dimStyle?: DimStyleTable,
  options?: ToSVGOptions,
  viewport?: DimensionViewport,
): BoundsAndElement {
  const bbox = new Box2()
  const elements: string[] = []
  const markers: string[] = []

  // Get dimension style properties (optionally auto-scaled)
  const { arrowSize, textHeight } = getScaledDimensionSizes(
    dimStyle,
    options,
    viewport,
  )
  const { dimLineColor, textColor, dimLineWeight } = getDimensionColors(
    dimStyle,
    options,
    viewport,
  )

  // Extract geometry
  const x1 = entity.measureStart?.x ?? 0
  const y1 = entity.measureStart?.y ?? 0
  const x2 = entity.measureEnd?.x ?? 0
  const y2 = entity.measureEnd?.y ?? 0
  const textX = entity.textMidpoint?.x ?? (x1 + x2) / 2
  const textY = entity.textMidpoint?.y ?? (y1 + y2) / 2

  bbox.expandByPoint({ x: x1, y: y1 })
  bbox.expandByPoint({ x: x2, y: y2 })
  bbox.expandByPoint({ x: textX, y: textY })

  const diameterLen = Math.hypot(x2 - x1, y2 - y1)
  if (Number.isFinite(diameterLen) && diameterLen > 1e-6) {
    // Create arrow markers
    const markerId = `dim-diameter-arrow-${Date.now()}`
    markers.push(
      createArrowMarker(markerId, arrowSize, dimLineColor, 'backward'),
    )

    // Create diameter line with arrow at the end
    elements.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${dimLineColor}" stroke-width="${dimLineWeight}" marker-end="url(#${markerId})" />`,
    )

    expandBBoxForMarker(bbox, x2, y2, arrowSize)
  }

  // Add dimension text with diameter symbol
  const resolvedText = resolveDimensionText(entity)
  const diameterText = resolvedText ? `⌀${resolvedText}` : '⌀'
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const textRotation = (angle * 180) / Math.PI

  expandBBoxForText(bbox, textX, textY, textHeight, diameterText)

  elements.push(
    `<text x="${textX}" y="${textY}" font-size="${textHeight}" fill="${textColor}" stroke="none" text-anchor="middle" transform="rotate(${-textRotation} ${textX} ${textY}) scale(1,-1) translate(0 ${-2 * textY})">${escapeXmlText(diameterText)}</text>`,
  )

  return {
    bbox,
    element: `<defs>${markers.join('')}</defs><g>${elements.join('')}</g>`,
  }
}

/**
 * Render radial dimension
 */
function renderRadialDimension(
  entity: DimensionEntity,
  dimStyle?: DimStyleTable,
  options?: ToSVGOptions,
  viewport?: DimensionViewport,
): BoundsAndElement {
  const bbox = new Box2()
  const elements: string[] = []
  const markers: string[] = []

  // Get dimension style properties (optionally auto-scaled)
  const { arrowSize, textHeight } = getScaledDimensionSizes(
    dimStyle,
    options,
    viewport,
  )
  const { dimLineColor, textColor, dimLineWeight } = getDimensionColors(
    dimStyle,
    options,
    viewport,
  )

  // Extract geometry
  const x1 = entity.measureStart?.x ?? 0
  const y1 = entity.measureStart?.y ?? 0
  const x2 = entity.measureEnd?.x ?? 0
  const y2 = entity.measureEnd?.y ?? 0
  const textX = entity.textMidpoint?.x ?? (x1 + x2) / 2
  const textY = entity.textMidpoint?.y ?? (y1 + y2) / 2

  bbox.expandByPoint({ x: x1, y: y1 })
  bbox.expandByPoint({ x: x2, y: y2 })
  bbox.expandByPoint({ x: textX, y: textY })

  const radiusLen = Math.hypot(x2 - x1, y2 - y1)
  if (Number.isFinite(radiusLen) && radiusLen > 1e-6) {
    // Create arrow markers
    const markerId = `dim-radius-arrow-${Date.now()}`
    markers.push(
      createArrowMarker(markerId, arrowSize, dimLineColor, 'backward'),
    )

    // Create radius line with arrow at the end
    elements.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${dimLineColor}" stroke-width="${dimLineWeight}" marker-end="url(#${markerId})" />`,
    )

    expandBBoxForMarker(bbox, x2, y2, arrowSize)
  }

  // Add dimension text with radius symbol
  const resolvedText = resolveDimensionText(entity)
  const radiusText = resolvedText ? `R${resolvedText}` : 'R'
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const textRotation = (angle * 180) / Math.PI

  expandBBoxForText(bbox, textX, textY, textHeight, radiusText)

  elements.push(
    `<text x="${textX}" y="${textY}" font-size="${textHeight}" fill="${textColor}" stroke="none" text-anchor="middle" transform="rotate(${-textRotation} ${textX} ${textY}) scale(1,-1) translate(0 ${-2 * textY})">${escapeXmlText(radiusText)}</text>`,
  )

  return {
    bbox,
    element: `<defs>${markers.join('')}</defs><g>${elements.join('')}</g>`,
  }
}

/**
 * Render ordinate dimension
 */
function renderOrdinateDimension(
  entity: DimensionEntity,
  dimStyle?: DimStyleTable,
  options?: ToSVGOptions,
  viewport?: DimensionViewport,
): BoundsAndElement {
  const bbox = new Box2()
  const elements: string[] = []

  // Get dimension style properties (optionally auto-scaled)
  const { textHeight } = getScaledDimensionSizes(dimStyle, options, viewport)
  const { dimLineColor, textColor, dimLineWeight } = getDimensionColors(
    dimStyle,
    options,
    viewport,
  )

  // Extract geometry
  const x1 = entity.measureStart?.x ?? 0
  const y1 = entity.measureStart?.y ?? 0
  const x2 = entity.start?.x ?? 0
  const y2 = entity.start?.y ?? 0
  const textX = entity.textMidpoint?.x ?? x2
  const textY = entity.textMidpoint?.y ?? y2

  bbox.expandByPoint({ x: x1, y: y1 })
  bbox.expandByPoint({ x: x2, y: y2 })
  bbox.expandByPoint({ x: textX, y: textY })

  // Create leader line (no arrow for ordinate dimensions)
  elements.push(
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${dimLineColor}" stroke-width="${dimLineWeight}" />`,
  )

  // Add dimension text
  const resolvedText = resolveDimensionText(entity)
  if (resolvedText) {
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const textRotation = (angle * 180) / Math.PI

    expandBBoxForText(bbox, textX, textY, textHeight, resolvedText)

    elements.push(
      `<text x="${textX}" y="${textY}" font-size="${textHeight}" fill="${textColor}" stroke="none" text-anchor="middle" transform="rotate(${-textRotation} ${textX} ${textY}) scale(1,-1) translate(0 ${-2 * textY})">${escapeXmlText(resolvedText)}</text>`,
    )
  }

  return {
    bbox,
    element: `<g>${elements.join('')}</g>`,
  }
}

/**
 * Fallback renderer for unsupported dimension types
 */
function renderFallbackDimension(entity: DimensionEntity): BoundsAndElement {
  const bbox = new Box2()
  const elements: string[] = []

  // Just render text at midpoint
  if (entity.textMidpoint) {
    const textX = entity.textMidpoint.x ?? 0
    const textY = entity.textMidpoint.y ?? 0
    bbox.expandByPoint({ x: textX, y: textY })

    const resolvedText = resolveDimensionText(entity)
    if (resolvedText) {
      elements.push(
        `<text x="${textX}" y="${textY}" font-size="2.5" stroke="none" text-anchor="middle" transform="scale(1,-1) translate(0 ${-2 * textY})">${escapeXmlText(resolvedText)}</text>`,
      )
    }
  }

  return {
    bbox,
    element: `<g>${elements.join('')}</g>`,
  }
}
