/**
 * Nested SVG Output
 *
 * Generates SVG output with nested shapes, stock sheet overlay,
 * and utilization metrics.
 */

import type {
  NestingResult,
  NestableShape,
  Placement,
  StockSheet,
  Point2D,
} from './types'
import { degToRad } from './polygonUtils'

// ─────────────────────────────────────────────
// SVG Generation Helpers
// ─────────────────────────────────────────────

/** Escape XML special characters */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Generate a path d attribute from vertices */
function verticesToPath(vertices: Point2D[]): string {
  if (vertices.length < 2) return ''

  let d = `M ${vertices[0].x.toFixed(2)} ${vertices[0].y.toFixed(2)}`

  for (let i = 1; i < vertices.length; i++) {
    d += ` L ${vertices[i].x.toFixed(2)} ${vertices[i].y.toFixed(2)}`
  }

  d += ' Z'
  return d
}

/** Compute viewBox from placements and sheets */
function computeViewBox(
  sheets: StockSheet[],
  placements: Placement[],
  margin: number = 50
): { minX: number; minY: number; width: number; height: number } {
  if (sheets.length === 0) {
    return { minX: -margin, minY: -margin, width: 100 + 2 * margin, height: 100 + 2 * margin }
  }

  // Use the largest sheet dimensions
  const maxSheet = sheets.reduce(
    (max, s) => ({
      width: Math.max(max.width, s.width),
      height: Math.max(max.height, s.height),
    }),
    { width: 0, height: 0 }
  )

  return {
    minX: -margin,
    minY: -margin,
    width: maxSheet.width + 2 * margin,
    height: maxSheet.height + 2 * margin,
  }
}

// ─────────────────────────────────────────────
// Main SVG Generation
// ─────────────────────────────────────────────

/**
 * Generate SVG output for nesting results.
 *
 * @param result - Nesting result
 * @param shapes - Original shapes (for vertex data)
 * @param options - SVG generation options
 * @returns SVG string
 */
export function toNestedSvg(
  result: NestingResult,
  shapes: NestableShape[],
  options: {
    showSheetOutline?: boolean
    showMetrics?: boolean
    showLayerColors?: boolean
    strokeWidth?: number
    fillColor?: string
  } = {}
): string {
  const {
    showSheetOutline = true,
    showMetrics = true,
    showLayerColors = true,
    strokeWidth = 1,
    fillColor = 'none',
  } = options

  const viewBox = computeViewBox(result.sheets, result.placements)

  // Build shape lookup
  const shapeMap = new Map<string, NestableShape>()
  for (const shape of shapes) {
    shapeMap.set(shape.id, shape)
  }

  // Start SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}" width="100%" height="100%">\n`

  // Add styles
  svg += `  <style>\n`
  svg += `    .sheet-outline { fill: none; stroke: #333; stroke-width: 2; stroke-dasharray: 5,5; }\n`
  svg += `    .shape-path { fill: ${fillColor}; stroke: #0066cc; stroke-width: ${strokeWidth}; }\n`
  svg += `    .metrics-text { font-family: monospace; font-size: 12px; fill: #333; }\n`
  svg += `    .metrics-bg { fill: rgba(255,255,255,0.8); }\n`
  svg += `  </style>\n`

  // Draw sheet outlines
  if (showSheetOutline) {
    for (let i = 0; i < result.sheets.length; i++) {
      const sheet = result.sheets[i]
      svg += `  <rect class="sheet-outline" x="0" y="0" width="${sheet.width}" height="${sheet.height}" />\n`
    }
  }

  // Draw shapes
  for (const placement of result.placements) {
    const shape = shapeMap.get(placement.shapeId)
    if (!shape) continue

    // Transform vertices to placement position
    const transformedVertices: Point2D[] = shape.vertices.map((v) => ({
      x: v.x + placement.x - shape.centroid.x,
      y: v.y + placement.y - shape.centroid.y,
    }))

    const path = verticesToPath(transformedVertices)
    svg += `  <path class="shape-path" d="${path}" data-shape-id="${escapeXml(placement.shapeId)}" />\n`
  }

  // Draw metrics overlay
  if (showMetrics) {
    const metricsX = 10
    const metricsY = result.sheets.length > 0 ? result.sheets[0].height + 20 : 10

    svg += `  <rect class="metrics-bg" x="${metricsX - 5}" y="${metricsY - 15}" width="300" height="100" rx="5" />\n`
    svg += `  <text class="metrics-text" x="${metricsX}" y="${metricsY}">Nesting Metrics</text>\n`
    svg += `  <text class="metrics-text" x="${metricsX}" y="${metricsY + 18}">Shapes: ${result.placements.length} placed, ${result.unplacedShapes.length} unplaced</text>\n`
    svg += `  <text class="metrics-text" x="${metricsX}" y="${metricsY + 36}">Utilization: ${result.utilization.toFixed(1)}%</text>\n`
    svg += `  <text class="metrics-text" x="${metricsX}" y="${metricsY + 54}">Sheets: ${result.sheetCount}</text>\n`
    svg += `  <text class="metrics-text" x="${metricsX}" y="${metricsY + 72}">Time: ${result.processingTimeMs.toFixed(1)}ms</text>\n`
  }

  svg += `</svg>`

  return svg
}

// ─────────────────────────────────────────────
// Color Generation
// ─────────────────────────────────────────────

/** Generate a color for a layer name */
function layerToColor(layer: string): string {
  // Simple hash-based color generation
  let hash = 0
  for (let i = 0; i < layer.length; i++) {
    hash = ((hash << 5) - hash + layer.charCodeAt(i)) | 0
  }

  const h = Math.abs(hash) % 360
  return `hsl(${h}, 70%, 50%)`
}

/** Get stroke color for a shape based on its layer */
function getShapeStrokeColor(shape: NestableShape): string {
  return layerToColor(shape.layer)
}
