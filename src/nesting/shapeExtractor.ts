/**
 * Shape Extractor
 *
 * Extracts closed shapes from DXF entities.
 * Identifies closed polylines, circles, ellipses, splines, solids, and traces.
 * Approximates curves as polygons with configurable density.
 */

import type {
  Entity,
  ArcEntity,
  CircleEntity,
  EllipseEntity,
  SolidEntity,
  SplineEntity,
  TraceEntity,
  PolylineEntity,
} from '../types'
import type { NestingOptions, NestableShape, CompoundShape, ExtractionResult, Point2D } from './types'
import { DEFAULT_CURVE_SEGMENTS, EPSILON } from './config'
import {
  computeArea,
  computeCentroid,
  computeBoundingBox,
  computePerimeter,
  ensureClosed,
  isClosed,
  normalizeWinding,
  circleToPolygon,
  ellipseToPolygon,
  arcToPolygon,
  pointInPolygon,
} from './polygonUtils'
import logger from '../util/logger'

// ─────────────────────────────────────────────
// Shape ID Counter
// ─────────────────────────────────────────────

let shapeIdCounter = 0
function nextShapeId(): string {
  return `shape-${++shapeIdCounter}`
}

// ─────────────────────────────────────────────
// Entity → Vertices Conversion
// ─────────────────────────────────────────────

/** Extract vertices from a LWPOLYLINE entity */
function extractLwpolylineVertices(entity: Entity): Point2D[] | null {
  const poly = entity as PolylineEntity
  if (!poly.vertices || poly.vertices.length < 3) return null

  // Check if closed (flag 70 = 1 or 12)
  const isClosedPoly = poly.closed || (poly as any).flags === 1 || (poly as any).flags === 12
  if (!isClosedPoly) {
    logger.warn(`LWPOLYLINE is not closed, skipping for nesting: ${entity.handle}`)
    return null
  }

  const vertices: Point2D[] = poly.vertices
    .filter((v) => v.x !== undefined && v.y !== undefined)
    .map((v) => ({ x: v.x!, y: v.y! }))

  if (vertices.length < 3) return null

  return ensureClosed(vertices)
}

/** Extract vertices from a POLYLINE entity */
function extractPolylineVertices(entity: Entity): Point2D[] | null {
  const poly = entity as PolylineEntity
  if (!poly.vertices || poly.vertices.length < 3) return null

  const isClosedPoly = poly.closed || (poly as any).flags === 1
  if (!isClosedPoly) {
    logger.warn(`POLYLINE is not closed, skipping for nesting: ${entity.handle}`)
    return null
  }

  const vertices: Point2D[] = poly.vertices
    .filter((v) => v.x !== undefined && v.y !== undefined)
    .map((v) => ({ x: v.x!, y: v.y! }))

  if (vertices.length < 3) return null

  return ensureClosed(vertices)
}

/** Extract vertices from a CIRCLE entity */
function extractCircleVertices(entity: Entity, segments: number): Point2D[] | null {
  const circle = entity as CircleEntity
  if (circle.r === undefined || circle.r <= 0) return null
  if (!isFinite(circle.r)) return null

  return circleToPolygon(circle.x, circle.y, circle.r, segments)
}

/** Extract vertices from an ELLIPSE entity */
function extractEllipseVertices(entity: Entity, segments: number): Point2D[] | null {
  const ellipse = entity as EllipseEntity
  if (!ellipse.majorX || !ellipse.majorY || !ellipse.axisRatio) return null

  const radiusX = Math.sqrt(ellipse.majorX * ellipse.majorX + ellipse.majorY * ellipse.majorY)
  const radiusY = radiusX * ellipse.axisRatio

  if (radiusX <= 0 || radiusY <= 0) return null

  // Check if it's a full ellipse (not an arc)
  const startAngle = ellipse.startAngle ?? 0
  const endAngle = ellipse.endAngle ?? 360
  const sweep = endAngle - startAngle

  if (Math.abs(sweep - 360) > EPSILON && Math.abs(sweep + 360) > EPSILON) {
    // It's an elliptical arc, not a full ellipse
    // Still extract as closed shape for nesting (arc segment)
    logger.warn(`ELLIPSE is an arc (sweep: ${sweep}°), extracting as polygon: ${entity.handle}`)
    return arcToPolygon(ellipse.x, ellipse.y, radiusX, startAngle, endAngle, segments)
  }

  // Rotation from major axis direction
  const rotation = Math.atan2(ellipse.majorY, ellipse.majorX) * (180 / Math.PI)

  return ellipseToPolygon(ellipse.x, ellipse.y, radiusX, radiusY, rotation, segments)
}

/** Extract vertices from an ARC entity (only if full circle) */
function extractArcVertices(entity: Entity, segments: number): Point2D[] | null {
  const arc = entity as ArcEntity
  if (arc.r === undefined || arc.r <= 0) return null

  const startAngle = arc.startAngle ?? 0
  const endAngle = arc.endAngle ?? 360
  const sweep = endAngle - startAngle

  // Only extract if it's a full circle (360° arc)
  if (Math.abs(sweep - 360) > EPSILON && Math.abs(sweep + 360) > EPSILON) {
    logger.warn(`ARC is not a full circle (sweep: ${sweep}°), skipping for nesting: ${entity.handle}`)
    return null
  }

  return circleToPolygon(arc.x, arc.y, arc.r, segments)
}

/** Extract vertices from a SOLID entity */
function extractSolidVertices(entity: Entity): Point2D[] | null {
  const solid = entity as SolidEntity
  if (!solid.points || solid.points.length < 3) return null

  const vertices: Point2D[] = solid.points
    .slice(0, 4) // SOLID has up to 4 points
    .map((p) => ({ x: p.x, y: p.y }))

  return ensureClosed(vertices)
}

/** Extract vertices from a TRACE entity */
function extractTraceVertices(entity: Entity): Point2D[] | null {
  const trace = entity as TraceEntity
  if (!trace.corners || trace.corners.length < 3) return null

  const vertices: Point2D[] = trace.corners
    .slice(0, 4)
    .map((p) => ({ x: p.x, y: p.y }))

  return ensureClosed(vertices)
}

/** Extract vertices from a closed SPLINE entity */
function extractSplineVertices(entity: Entity, segments: number): Point2D[] | null {
  const spline = entity as SplineEntity
  if (!spline.controlPoints || spline.controlPoints.length < 3) return null

  // Check if closed
  const isClosedSpline = (spline as any).flags === 1 || (spline as any).closed === true
  if (!isClosedSpline) {
    logger.warn(`SPLINE is not closed, skipping for nesting: ${entity.handle}`)
    return null
  }

  // Approximate spline as polygon using control points
  // For better accuracy, interpolate between control points
  const vertices: Point2D[] = []
  const cps = spline.controlPoints
  const totalSegments = Math.max(segments, cps.length * 4)

  for (let i = 0; i < totalSegments; i++) {
    const t = i / totalSegments
    const idx = t * (cps.length - 1)
    const i0 = Math.floor(idx)
    const i1 = Math.min(i0 + 1, cps.length - 1)
    const frac = idx - i0

    // Linear interpolation between control points (simplified)
    const x = cps[i0].x + (cps[i1].x - cps[i0].x) * frac
    const y = cps[i0].y + (cps[i1].y - cps[i0].y) * frac
    vertices.push({ x, y })
  }

  return ensureClosed(vertices)
}

// ─────────────────────────────────────────────
// Entity Router
// ─────────────────────────────────────────────

/** Route an entity to its appropriate vertex extractor */
function extractVertices(
  entity: Entity,
  segments: number
): Point2D[] | null {
  switch (entity.type) {
    case 'LWPOLYLINE':
      return extractLwpolylineVertices(entity)
    case 'POLYLINE':
      return extractPolylineVertices(entity)
    case 'CIRCLE':
      return extractCircleVertices(entity, segments)
    case 'ELLIPSE':
      return extractEllipseVertices(entity, segments)
    case 'ARC':
      return extractArcVertices(entity, segments)
    case 'SOLID':
      return extractSolidVertices(entity)
    case 'TRACE':
      return extractTraceVertices(entity)
    case 'SPLINE':
      return extractSplineVertices(entity, segments)
    default:
      return null
  }
}

// ─────────────────────────────────────────────
// Shape Creation
// ─────────────────────────────────────────────

/** Create a NestableShape from vertices */
function createShape(
  vertices: Point2D[],
  entity: Entity,
  options: Required<Pick<NestingOptions, 'allowedRotations' | 'kerf'>>
): NestableShape {
  // Normalize winding to CCW
  const normalized = normalizeWinding(vertices)

  const area = computeArea(normalized)
  const perimeter = computePerimeter(normalized)
  const centroid = computeCentroid(normalized)
  const bbox = computeBoundingBox(normalized)

  return {
    id: nextShapeId(),
    layer: entity.layer ?? '0',
    originalHandle: entity.handle,
    vertices: normalized,
    bbox,
    area,
    perimeter,
    centroid,
    allowedRotations: [...options.allowedRotations],
    kerf: options.kerf,
    isHole: false,
  }
}

// ─────────────────────────────────────────────
// Hole Detection
// ─────────────────────────────────────────────

/**
 * Detect holes (inner contours) by checking if a shape's centroid
 * is inside another shape. If so, the inner shape is a hole.
 */
function detectHoles(shapes: NestableShape[]): {
  outerShapes: NestableShape[]
  compoundShapes: CompoundShape[]
} {
  const outerShapes: NestableShape[] = []
  const usedAsHole = new Set<string>()

  // Sort by area descending (larger shapes are more likely to be outer)
  const sorted = [...shapes].sort((a, b) => b.area - a.area)

  for (const shape of sorted) {
    if (usedAsHole.has(shape.id)) continue

    let isHoleOfOuter = false
    const holes: NestableShape[] = []

    // Check if this shape contains any other shapes
    for (const other of sorted) {
      if (other.id === shape.id || usedAsHole.has(other.id)) continue

      // Check if other's centroid is inside this shape
      if (pointInPolygon(other.centroid, shape.vertices)) {
        // Check that other is smaller (it's a hole, not overlapping)
        if (other.area < shape.area * 0.9) {
          other.isHole = true
          holes.push(other)
          usedAsHole.add(other.id)
        }
      }
    }

    if (holes.length > 0) {
      // Create compound shape
      const netArea = shape.area - holes.reduce((sum, h) => sum + h.area, 0)
      const compoundShape: CompoundShape = {
        id: shape.id,
        layer: shape.layer,
        originalHandle: shape.originalHandle,
        outer: shape,
        holes,
        bbox: shape.bbox,
        netArea: Math.max(0, netArea),
        centroid: shape.centroid,
        allowedRotations: [...shape.allowedRotations],
        kerf: shape.kerf,
      }
      // Don't add outer to outerShapes since it's in compoundShapes
    } else {
      outerShapes.push(shape)
    }
  }

  return { outerShapes, compoundShapes: [] } // compound shapes need more work
}

// ─────────────────────────────────────────────
// Main Extraction Function
// ─────────────────────────────────────────────

/**
 * Extract closed shapes from DXF entities.
 *
 * @param entities - Array of DXF entities (denormalized)
 * @param options - Nesting options
 * @returns Extraction result with shapes and metadata
 */
export function extractShapes(
  entities: Entity[],
  options: NestingOptions
): ExtractionResult {
  const segments = options.curveSegments ?? DEFAULT_CURVE_SEGMENTS
  const shapes: NestableShape[] = []
  const compoundShapes: CompoundShape[] = []
  const skippedEntities: Array<{ type: string; reason: string }> = []

  for (const entity of entities) {
    const vertices = extractVertices(entity, segments)

    if (!vertices) {
      // Entity not suitable for nesting
      const reason =
        entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE'
          ? 'not closed'
          : 'not a closed shape or unsupported'
      skippedEntities.push({ type: entity.type, reason })
      continue
    }

    if (vertices.length < 4) {
      skippedEntities.push({ type: entity.type, reason: 'too few vertices' })
      continue
    }

    const shape = createShape(vertices, entity, {
      allowedRotations: options.allowedRotations ?? [0, 90, 180, 270],
      kerf: options.kerf ?? 2,
    })

    // Skip degenerate shapes (zero area)
    if (shape.area < EPSILON) {
      skippedEntities.push({ type: entity.type, reason: 'zero area' })
      continue
    }

    shapes.push(shape)
  }

  // Detect holes
  const { outerShapes } = detectHoles(shapes)

  return {
    shapes: outerShapes,
    compoundShapes,
    skippedEntities,
  }
}

/** Reset shape ID counter (for testing) */
export function resetShapeIdCounter(): void {
  shapeIdCounter = 0
}
