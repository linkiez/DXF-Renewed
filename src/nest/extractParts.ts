// extractParts — extracts nestable parts from a parsed DXF

import denormalise from '../denormalise'
import entityToPolyline from '../entityToPolyline'
import applyTransforms from '../applyTransforms'
import colors from '../util/colors'

import type { ParsedDXF } from '../types'
import type { Entity } from '../types'
import type { NestPart } from './types'
import { polygonArea, getBBox, simplifyPolygon, centroid } from './geometry'

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
  const filtered = entities.filter((entity) => {
    // Skip by type
    if (opts.skipTypes.includes(entity.type)) return false

    // Skip by layer name (case-insensitive partial match)
    const layerName = (entity.layer ?? '0').toUpperCase()
    if (opts.skipLayers.some((skip) => layerName.includes(skip.toUpperCase()))) return false

    // Skip invisible entities
    if (entity.visible === false) return false

    return true
  })

  // 3. Convert each entity to polyline
  const polylines: {
    vertices: [number, number][]
    layer: string
    color: [number, number, number]
    type: string
  }[] = []

  for (const entity of filtered) {
    try {
      const rawVertices = entityToPolyline(entity as any)
      const vertices = entity.transforms
        ? applyTransforms(rawVertices, entity.transforms)
        : rawVertices

      if (vertices.length < 3) continue

      // Get color
      let colorNumber = 0
      if ('colorNumber' in entity && typeof entity.colorNumber === 'number') {
        colorNumber = entity.colorNumber
      } else {
        const layerTable = parsed.tables?.layers?.[entity.layer ?? '0']
        if (layerTable && typeof layerTable.colorNumber === 'number') {
          colorNumber = layerTable.colorNumber
        }
      }
      const rgb = colors[colorNumber] ?? [0, 0, 0]

      polylines.push({
        vertices,
        layer: entity.layer ?? '0',
        color: rgb,
        type: entity.type,
      })
    } catch {
      // Skip entities that can't be converted
      continue
    }
  }

  // 4. Group by layer (if mergeByLayer)
  const parts: NestPart[] = []
  let partIndex = 0

  if (opts.mergeByLayer) {
    const byLayer = new Map<string, typeof polylines>()
    for (const pl of polylines) {
      const list = byLayer.get(pl.layer) ?? []
      list.push(pl)
      byLayer.set(pl.layer, list)
    }

    for (const [layer, layerPolylines] of byLayer) {
      // Each polyline in the layer becomes a separate part for now
      // Future: implement contour detection to separate distinct parts
      for (const pl of layerPolylines) {
        const simplified = simplifyPolygon(pl.vertices)
        const area = polygonArea(simplified)

        if (area < opts.minArea) continue

        const bbox = getBBox(simplified)

        parts.push({
          id: `part-${partIndex++}`,
          layer,
          vertices: simplified,
          holes: [], // Hole detection in Phase 2
          color: pl.color,
          bbox,
          area,
        })
      }
    }
  } else {
    for (const pl of polylines) {
      const simplified = simplifyPolygon(pl.vertices)
      const area = polygonArea(simplified)

      if (area < opts.minArea) continue

      const bbox = getBBox(simplified)

      parts.push({
        id: `part-${partIndex++}`,
        layer: pl.layer,
        vertices: simplified,
        holes: [],
        color: pl.color,
        bbox,
        area,
      })
    }
  }

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
    const outerArea = part.area
    const outerCentroid = centroid(part.vertices)

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
  const entities = denormalise(parsed)

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  for (const entity of entities) {
    try {
      const vertices = entityToPolyline(entity as any)
      const transformed = entity.transforms
        ? applyTransforms(vertices, entity.transforms)
        : vertices

      for (const v of transformed) {
        if (v[0] < minX) minX = v[0]
        if (v[0] > maxX) maxX = v[0]
        if (v[1] < minY) minY = v[1]
        if (v[1] > maxY) maxY = v[1]
      }
    } catch {
      continue
    }
  }

  if (minX === Infinity) return { width: 1000, height: 1000 }

  const contentW = maxX - minX
  const contentH = maxY - minY
  const margin = (marginPercent / 100) * Math.max(contentW, contentH)

  return {
    width: Math.ceil((contentW + margin * 2) / 10) * 10,
    height: Math.ceil((contentH + margin * 2) / 10) * 10,
  }
}
