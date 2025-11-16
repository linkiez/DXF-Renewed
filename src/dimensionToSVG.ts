import { Box2 } from 'vecks'

import type { DimensionEntity } from './types'
import type { DimStyleTable } from './types/dxf'
import type { BoundsAndElement } from './types/svg'

/**
 * Render DIMENSION entity to SVG with proper DIMSTYLE support
 */
export default function dimensionToSVG(
  entity: DimensionEntity,
  dimStyle?: DimStyleTable,
): BoundsAndElement {
  // Dispatch to appropriate renderer based on dimension type
  switch (entity.dimensionType) {
    case 0: // Rotated, horizontal, or vertical
    case 1: // Aligned
      return renderLinearDimension(entity, dimStyle)
    case 2: // Angular
      return renderAngularDimension(entity, dimStyle)
    case 3: // Diameter
      return renderDiameterDimension(entity, dimStyle)
    case 4: // Radius
      return renderRadialDimension(entity, dimStyle)
    case 6: // Ordinate
      return renderOrdinateDimension(entity, dimStyle)
    default:
      // Fallback to simple line rendering
      return renderFallbackDimension(entity)
  }
}

/**
 * Create SVG marker definition for dimension arrows
 */
export function createArrowMarker(
  id: string,
  size: number,
  color: string,
): string {
  const arrowPath = `M 0 0 L ${size} ${size / 2} L 0 ${size} z`
  return `<marker id="${id}" markerWidth="${size}" markerHeight="${size}" refX="${size}" refY="${size / 2}" orient="auto" markerUnits="strokeWidth">
    <path d="${arrowPath}" fill="${color}" />
  </marker>`
}

/**
 * Render linear dimension (rotated, horizontal, vertical, or aligned)
 */
function renderLinearDimension(
  entity: DimensionEntity,
  dimStyle?: DimStyleTable,
): BoundsAndElement {
  const bbox = new Box2()
  const elements: string[] = []
  const markers: string[] = []

  // Get dimension style properties with defaults
  const arrowSize = dimStyle?.dimAsz ?? 2.5
  const textHeight = dimStyle?.dimTxt ?? 2.5
  const extLineOffset = dimStyle?.dimExo ?? 0.625
  const extLineExtension = dimStyle?.dimExe ?? 1.25

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
  
  // Create arrow markers
  markers.push(
    createArrowMarker(markerId1, arrowSize, 'currentColor'),
    createArrowMarker(markerId2, arrowSize, 'currentColor'),
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

  elements.push(
    `<line x1="${extLine1StartX}" y1="${extLine1StartY}" x2="${extLine1EndX}" y2="${extLine1EndY}" stroke-width="0.5" />`,
    `<line x1="${extLine2StartX}" y1="${extLine2StartY}" x2="${extLine2EndX}" y2="${extLine2EndY}" stroke-width="0.5" />`,
    `<line x1="${dimLine1X}" y1="${dimLine1Y}" x2="${dimLine2X}" y2="${dimLine2Y}" stroke-width="0.5" marker-start="url(#${markerId1})" marker-end="url(#${markerId2})" />`,
  )

  // Add dimension text
  if (entity.text) {
    const textRotation = (angle * 180) / Math.PI
    elements.push(
      `<text x="${textX}" y="${textY}" font-size="${textHeight}" text-anchor="middle" transform="rotate(${-textRotation} ${textX} ${textY}) scale(1,-1) translate(0 ${-2 * textY})">${entity.text}</text>`,
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
): BoundsAndElement {
  const bbox = new Box2()
  const elements: string[] = []
  const markers: string[] = []

  // Get dimension style properties
  const arrowSize = dimStyle?.dimAsz ?? 2.5
  const textHeight = dimStyle?.dimTxt ?? 2.5

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
    createArrowMarker(markerId1, arrowSize, 'currentColor'),
    createArrowMarker(markerId2, arrowSize, 'currentColor'),
  )

  // Draw extension lines from center to definition points
  elements.push(
    `<line x1="${centerX}" y1="${centerY}" x2="${x1}" y2="${y1}" stroke-width="0.5" />`,
    `<line x1="${centerX}" y1="${centerY}" x2="${x2}" y2="${y2}" stroke-width="0.5" />`,
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
    `<path d="M ${arcStartX} ${arcStartY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${arcEndX} ${arcEndY}" fill="none" stroke-width="0.5" marker-start="url(#${markerId1})" marker-end="url(#${markerId2})" />`,
  )

  // Add dimension text
  if (entity.text) {
    const midAngle = (startAngle + endAngle) / 2
    const textRotation = (midAngle * 180) / Math.PI
    
    elements.push(
      `<text x="${textX}" y="${textY}" font-size="${textHeight}" text-anchor="middle" transform="rotate(${-textRotation} ${textX} ${textY}) scale(1,-1) translate(0 ${-2 * textY})">${entity.text}</text>`,
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
): BoundsAndElement {
  const bbox = new Box2()
  const elements: string[] = []
  const markers: string[] = []

  // Get dimension style properties
  const arrowSize = dimStyle?.dimAsz ?? 2.5
  const textHeight = dimStyle?.dimTxt ?? 2.5

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

  // Create arrow markers
  const markerId = `dim-diameter-arrow-${Date.now()}`
  markers.push(createArrowMarker(markerId, arrowSize, 'currentColor'))

  // Create diameter line with arrow at the end
  elements.push(
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="0.5" marker-end="url(#${markerId})" />`,
  )

  // Add dimension text with diameter symbol
  const diameterText = entity.text ? `⌀${entity.text}` : '⌀'
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const textRotation = (angle * 180) / Math.PI
  
  elements.push(
    `<text x="${textX}" y="${textY}" font-size="${textHeight}" text-anchor="middle" transform="rotate(${-textRotation} ${textX} ${textY}) scale(1,-1) translate(0 ${-2 * textY})">${diameterText}</text>`,
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
): BoundsAndElement {
  const bbox = new Box2()
  const elements: string[] = []
  const markers: string[] = []

  // Get dimension style properties
  const arrowSize = dimStyle?.dimAsz ?? 2.5
  const textHeight = dimStyle?.dimTxt ?? 2.5

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

  // Create arrow markers
  const markerId = `dim-radius-arrow-${Date.now()}`
  markers.push(createArrowMarker(markerId, arrowSize, 'currentColor'))

  // Create radius line with arrow at the end
  elements.push(
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="0.5" marker-end="url(#${markerId})" />`,
  )

  // Add dimension text with radius symbol
  const radiusText = entity.text ? `R${entity.text}` : 'R'
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const textRotation = (angle * 180) / Math.PI
  
  elements.push(
    `<text x="${textX}" y="${textY}" font-size="${textHeight}" text-anchor="middle" transform="rotate(${-textRotation} ${textX} ${textY}) scale(1,-1) translate(0 ${-2 * textY})">${radiusText}</text>`,
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
): BoundsAndElement {
  const bbox = new Box2()
  const elements: string[] = []

  // Get dimension style properties
  const textHeight = dimStyle?.dimTxt ?? 2.5

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
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="0.5" />`,
  )

  // Add dimension text
  if (entity.text) {
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const textRotation = (angle * 180) / Math.PI
    
    elements.push(
      `<text x="${textX}" y="${textY}" font-size="${textHeight}" text-anchor="middle" transform="rotate(${-textRotation} ${textX} ${textY}) scale(1,-1) translate(0 ${-2 * textY})">${entity.text}</text>`,
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

    if (entity.text) {
      elements.push(
        `<text x="${textX}" y="${textY}" font-size="2.5" text-anchor="middle" transform="scale(1,-1) translate(0 ${-2 * textY})">${entity.text}</text>`,
      )
    }
  }

  return {
    bbox,
    element: `<g>${elements.join('')}</g>`,
  }
}
