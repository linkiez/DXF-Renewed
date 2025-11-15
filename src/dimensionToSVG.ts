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

  // Get dimension style properties with defaults
  const arrowSize = dimStyle?.dimAsz ?? 2.5
  const textHeight = dimStyle?.dimTxt ?? 2.5

  // Extract dimension geometry
  const x1 = entity.measureStart?.x ?? 0
  const y1 = entity.measureStart?.y ?? 0
  const x2 = entity.measureEnd?.x ?? 0
  const y2 = entity.measureEnd?.y ?? 0
  const textX = entity.textMidpoint?.x ?? (x1 + x2) / 2
  const textY = entity.textMidpoint?.y ?? (y1 + y2) / 2

  bbox.expandByPoint({ x: x1, y: y1 })
  bbox.expandByPoint({ x: x2, y: y2 })
  bbox.expandByPoint({ x: textX, y: textY })

  // Create dimension line
  elements.push(
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${arrowSize / 10}" />`,
  )

  // Add dimension text
  if (entity.text) {
    elements.push(
      `<text x="${textX}" y="${textY}" font-size="${textHeight}" text-anchor="middle" transform="scale(1,-1) translate(0 ${-2 * textY})">${entity.text}</text>`,
    )
  }

  return {
    bbox,
    element: `<g>${elements.join('')}</g>`,
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

  // Get dimension style properties
  const textHeight = dimStyle?.dimTxt ?? 2.5

  // Extract points
  const x1 = entity.measureStart?.x ?? 0
  const y1 = entity.measureStart?.y ?? 0
  const textX = entity.textMidpoint?.x ?? x1
  const textY = entity.textMidpoint?.y ?? y1

  bbox.expandByPoint({ x: x1, y: y1 })
  bbox.expandByPoint({ x: textX, y: textY })

  // Add dimension text
  if (entity.text) {
    elements.push(
      `<text x="${textX}" y="${textY}" font-size="${textHeight}" text-anchor="middle" transform="scale(1,-1) translate(0 ${-2 * textY})">${entity.text}</text>`,
    )
  }

  return {
    bbox,
    element: `<g>${elements.join('')}</g>`,
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

  // Create diameter line
  elements.push(
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${arrowSize / 10}" />`,
  )

  // Add dimension text with diameter symbol
  const diameterText = entity.text ? `⌀${entity.text}` : '⌀'
  elements.push(
    `<text x="${textX}" y="${textY}" font-size="${textHeight}" text-anchor="middle" transform="scale(1,-1) translate(0 ${-2 * textY})">${diameterText}</text>`,
  )

  return {
    bbox,
    element: `<g>${elements.join('')}</g>`,
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

  // Create radius line
  elements.push(
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${arrowSize / 10}" />`,
  )

  // Add dimension text with radius symbol
  const radiusText = entity.text ? `R${entity.text}` : 'R'
  elements.push(
    `<text x="${textX}" y="${textY}" font-size="${textHeight}" text-anchor="middle" transform="scale(1,-1) translate(0 ${-2 * textY})">${radiusText}</text>`,
  )

  return {
    bbox,
    element: `<g>${elements.join('')}</g>`,
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

  // Create leader line
  elements.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`)

  // Add dimension text
  if (entity.text) {
    elements.push(
      `<text x="${textX}" y="${textY}" font-size="${textHeight}" text-anchor="middle" transform="scale(1,-1) translate(0 ${-2 * textY})">${entity.text}</text>`,
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
