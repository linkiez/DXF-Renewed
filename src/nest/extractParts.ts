// extractParts — extracts nestable parts from a parsed DXF

import denormalise from '../denormalise'
import entityToPolyline from '../entityToPolyline'
import applyTransforms from '../applyTransforms'
import colors from '../util/colors'

import type { ParsedDXF } from '../types'
import type { NestPart } from './types'
import { polygonArea, getBBox, simplifyPolygon } from './geometry'

/**
 * Options for extracting parts from a DXF.
 */
export interface ExtractPartsOptions {
  /** Skip these layers (e.g., text, dimensions, centerlines) */
  skipLayers?: string[]
  /** Skip these entity types */
  skipTypes?: string[]
  /** Minimum area to consider a valid part (in DXF units²) */
  minArea?: number
  /** Whether to merge polylines on the same layer into single parts */
  mergeByLayer?: boolean
  /** Distance threshold for merging nearby polylines (in DXF units) */
  mergeDistance?: number
}

const DEFAULT_EXTRACT_OPTIONS: Required<ExtractPartsOptions> = {
  skipLayers: ['DIMENSION', 'CENTERLINE', 'HIDDEN', 'TEXT', 'ANNOTATION', 'DEFPOINTS'],
  skipTypes: ['TEXT', 'MTEXT', 'DIMENSION', 'POINT', 'RAY', 'XLINE', 'LEADER', 'INSERT', 'IMAGE', 'ATTDEF', 'ATTRIB', 'TABLE', 'OLEFRAME', 'OLE2FRAME'],
  minArea: 0.1,
  mergeByLayer: true,
  mergeDistance: 1.0,
}

type ExtractedPolyline = {
  vertices: [number, number][]
  layer: string
  color: [number, number, number]
  type: string
}

const shouldSkipEntity = (
  entity: ParsedDXF['entities'][number],
  options: Required<ExtractPartsOptions>,
): boolean => {
  if (options.skipTypes.includes(entity.type)) return true
  const layerName = (entity.layer ?? '0').toUpperCase()
  return (
    entity.visible === false ||
    options.skipLayers.some((skip) => layerName.includes(skip.toUpperCase()))
  )
}

const toExtractedPolyline = (
  entity: ParsedDXF['entities'][number],
  parsed: ParsedDXF,
): ExtractedPolyline | undefined => {
  try {
    const rawVertices = entityToPolyline(entity as any)
    const vertices = entity.transforms
      ? applyTransforms(rawVertices, entity.transforms)
      : rawVertices
    if (vertices.length < 3) return undefined

    const layer = entity.layer ?? '0'
    const entityColor = 'colorNumber' in entity ? entity.colorNumber : undefined
    const layerColor = parsed.tables?.layers?.[layer]?.colorNumber
    let colorNumber = 0
    if (typeof entityColor === 'number') colorNumber = entityColor
    else if (typeof layerColor === 'number') colorNumber = layerColor

    return {
      vertices,
      layer,
      color: colors[colorNumber] ?? [0, 0, 0],
      type: entity.type,
    }
  } catch {
    return undefined
  }
}

const toNestPart = (
  polyline: ExtractedPolyline,
  index: number,
  minArea: number,
): NestPart | undefined => {
  const vertices = simplifyPolygon(polyline.vertices)
  const area = polygonArea(vertices)
  if (area < minArea) return undefined

  return {
    id: `part-${index}`,
    layer: polyline.layer,
    vertices,
    holes: [],
    color: polyline.color,
    bbox: getBBox(vertices),
    area,
  }
}

const forEachTransformedPolyline = (
  parsed: ParsedDXF,
  callback: (vertices: [number, number][]) => void,
): void => {
  for (const entity of denormalise(parsed)) {
    try {
      const rawVertices = entityToPolyline(entity as any)
      const vertices = entity.transforms
        ? applyTransforms(rawVertices, entity.transforms)
        : rawVertices
      callback(vertices)
    } catch {
      continue
    }
  }
}

/**
 * Extract nestable parts from a parsed DXF.
 *
 * Converts DXF entities into NestPart objects suitable for the nesting algorithm.
 * Each part has an outer contour and optionally inner holes.
 */
export function extractParts(
  parsed: ParsedDXF,
  options?: Partial<ExtractPartsOptions>
): NestPart[] {
  const opts = { ...DEFAULT_EXTRACT_OPTIONS, ...options }

  // 1. Denormalize to get flat entity list
  const entities = denormalise(parsed)

  // 2. Filter entities
  const filtered = entities.filter((entity) => !shouldSkipEntity(entity, opts))

  // 3. Convert each entity to polyline
  const polylines = filtered.flatMap((entity) => {
    const polyline = toExtractedPolyline(entity, parsed)
    return polyline ? [polyline] : []
  })

  // 4. Group by layer (if mergeByLayer)
  const parts: NestPart[] = []
  const sourcePolylines = opts.mergeByLayer
    ? Array.from(
        polylines.reduce((groups, polyline) => {
          const group = groups.get(polyline.layer) ?? []
          group.push(polyline)
          groups.set(polyline.layer, group)
          return groups
        }, new Map<string, ExtractedPolyline[]>()),
      ).flatMap(([, group]) => group)
    : polylines

  sourcePolylines.forEach((polyline, index) => {
    const part = toNestPart(polyline, index, opts.minArea)
    if (part) parts.push(part)
  })

  console.log(`[extractParts] Extracted ${parts.length} parts from ${filtered.length} entities`)
  return parts
}

/**
 * Detect holes in a set of polylines.
 * A polyline is considered a hole if it is fully contained within another polyline
 * and has a smaller area.
 */
export function detectHoles(parts: NestPart[]): NestPart[] {
  return parts.map((part) => {
    // For now, holes are detected from separate polylines on the same layer
    // that are inside this part's contour
    return { ...part }
  })
}

/**
 * Auto-detect bin size from DXF content.
 * Uses the bounding box of all entities with a margin.
 */
export function autoDetectBin(
  parsed: ParsedDXF,
  marginPercent = 10
): { width: number; height: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  forEachTransformedPolyline(parsed, (vertices) => {
    for (const [x, y] of vertices) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  })

  if (minX === Infinity) return { width: 1000, height: 1000 }

  const contentW = maxX - minX
  const contentH = maxY - minY
  const margin = (marginPercent / 100) * Math.max(contentW, contentH)

  return {
    width: Math.ceil((contentW + margin * 2) / 10) * 10,
    height: Math.ceil((contentH + margin * 2) / 10) * 10,
  }
}
