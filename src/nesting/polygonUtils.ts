/**
 * Polygon Utilities
 *
 * Core geometric operations for polygon manipulation:
 * area, perimeter, centroid, convex hull, winding number, etc.
 */

import type { Point2D, BoundingBox } from './types'
import { EPSILON } from './config'

// ─────────────────────────────────────────────
// Distance & Angle
// ─────────────────────────────────────────────

/** Euclidean distance between two points */
export function distance(a: Point2D, b: Point2D): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

/** Squared distance (avoids sqrt for comparisons) */
export function distanceSquared(a: Point2D, b: Point2D): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return dx * dx + dy * dy
}

/** Angle from point a to point b (radians, 0 = right, CCW positive) */
export function angle(a: Point2D, b: Point2D): number {
  return Math.atan2(b.y - a.y, b.x - a.x)
}

/** Degrees to radians */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/** Radians to degrees */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI
}

// ─────────────────────────────────────────────
// Rotation
// ─────────────────────────────────────────────

/** Rotate a point around a center by angle (degrees) */
export function rotatePoint(
  point: Point2D,
  center: Point2D,
  angleDeg: number
): Point2D {
  const rad = degToRad(angleDeg)
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = point.x - center.x
  const dy = point.y - center.y
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  }
}

/** Rotate all vertices of a polygon around its centroid */
export function rotatePolygon(
  vertices: Point2D[],
  centroid: Point2D,
  angleDeg: number
): Point2D[] {
  return vertices.map((v) => rotatePoint(v, centroid, angleDeg))
}

/** Translate all vertices by (dx, dy) */
export function translatePolygon(
  vertices: Point2D[],
  dx: number,
  dy: number
): Point2D[] {
  return vertices.map((v) => ({ x: v.x + dx, y: v.y + dy }))
}

// ─────────────────────────────────────────────
// Area (Shoelace Formula)
// ─────────────────────────────────────────────

/**
 * Compute signed area of a polygon using the shoelace formula.
 * Positive = counter-clockwise, Negative = clockwise.
 */
export function signedArea(vertices: Point2D[]): number {
  if (vertices.length < 3) return 0

  let sum = 0
  const n = vertices.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    sum += vertices[i].x * vertices[j].y
    sum -= vertices[j].x * vertices[i].y
  }

  return sum / 2
}

/** Absolute area of a polygon */
export function computeArea(vertices: Point2D[]): number {
  return Math.abs(signedArea(vertices))
}

/**
 * Check if polygon vertices are in counter-clockwise order.
 * Returns true if CCW (positive signed area).
 */
export function isCounterClockwise(vertices: Point2D[]): boolean {
  return signedArea(vertices) > 0
}

/**
 * Normalize polygon to counter-clockwise orientation.
 * Reverses vertex order if clockwise.
 */
export function normalizeWinding(vertices: Point2D[]): Point2D[] {
  if (vertices.length < 3) return vertices
  if (isCounterClockwise(vertices)) return vertices
  return [...vertices].reverse()
}

// ─────────────────────────────────────────────
// Perimeter
// ─────────────────────────────────────────────

/** Compute perimeter of a polygon */
export function computePerimeter(vertices: Point2D[]): number {
  if (vertices.length < 2) return 0

  let perimeter = 0
  const n = vertices.length

  for (let i = 0; i < n - 1; i++) {
    perimeter += distance(vertices[i], vertices[i + 1])
  }

  return perimeter
}

// ─────────────────────────────────────────────
// Centroid
// ─────────────────────────────────────────────

/**
 * Compute centroid of a polygon.
 * Uses the standard formula based on signed area.
 */
export function computeCentroid(vertices: Point2D[]): Point2D {
  if (vertices.length === 0) return { x: 0, y: 0 }

  const signedA = signedArea(vertices)
  if (Math.abs(signedA) < EPSILON) {
    // Degenerate polygon, return average of vertices
    let sumX = 0, sumY = 0
    for (const v of vertices) {
      sumX += v.x
      sumY += v.y
    }
    return { x: sumX / vertices.length, y: sumY / vertices.length }
  }

  let cx = 0
  let cy = 0
  const n = vertices.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const cross = vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y
    cx += (vertices[i].x + vertices[j].x) * cross
    cy += (vertices[i].y + vertices[j].y) * cross
  }

  const factor = 6 * signedA
  return { x: cx / factor, y: cy / factor }
}

// ─────────────────────────────────────────────
// Bounding Box
// ─────────────────────────────────────────────

/** Compute axis-aligned bounding box of a polygon */
export function computeBoundingBox(vertices: Point2D[]): BoundingBox {
  if (vertices.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const v of vertices) {
    if (v.x < minX) minX = v.x
    if (v.y < minY) minY = v.y
    if (v.x > maxX) maxX = v.x
    if (v.y > maxY) maxY = v.y
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

/**
 * Compute bounding box of a rotated polygon.
 * Rotates vertices first, then computes AABB.
 */
export function computeRotatedBoundingBox(
  vertices: Point2D[],
  centroid: Point2D,
  angleDeg: number
): BoundingBox {
  const rotated = rotatePolygon(vertices, centroid, angleDeg)
  return computeBoundingBox(rotated)
}

// ─────────────────────────────────────────────
// Convex Hull (Monotone Chain)
// ─────────────────────────────────────────────

/** Cross product of vectors OA and OB (2D) */
function crossProduct(
  o: Point2D,
  a: Point2D,
  b: Point2D
): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}

/**
 * Compute convex hull using Monotone Chain algorithm.
 * O(n log n) time complexity.
 * Returns vertices in counter-clockwise order.
 */
export function computeConvexHull(points: Point2D[]): Point2D[] {
  if (points.length <= 1) return [...points]

  // Sort by x, then by y
  const sorted = [...points].sort((a, b) => {
    if (Math.abs(a.x - b.x) > EPSILON) return a.x - b.x
    return a.y - b.y
  })

  // Build lower hull
  const lower: Point2D[] = []
  for (const p of sorted) {
    while (
      lower.length >= 2 &&
      crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop()
    }
    lower.push(p)
  }

  // Build upper hull
  const upper: Point2D[] = []
  for (let i = sorted.length - 1; i >= 0; i--) {
    while (
      upper.length >= 2 &&
      crossProduct(upper[upper.length - 2], upper[upper.length - 1], sorted[i]) <=
        0
    ) {
      upper.pop()
    }
    upper.push(sorted[i])
  }

  // Remove last point of each half because it's repeated
  lower.pop()
  upper.pop()

  return [...lower, ...upper]
}

/** Check if a polygon is convex */
export function isConvex(vertices: Point2D[]): boolean {
  if (vertices.length < 3) return true

  let positiveCrossings = 0
  let negativeCrossings = 0
  const n = vertices.length

  for (let i = 0; i < n; i++) {
    const a = vertices[i]
    const b = vertices[(i + 1) % n]
    const c = vertices[(i + 2) % n]
    const cross = crossProduct(a, b, c)

    if (cross > EPSILON) positiveCrossings++
    else if (cross < -EPSILON) negativeCrossings++
  }

  return positiveCrossings === 0 || negativeCrossings === 0
}

// ─────────────────────────────────────────────
// Point-in-Polygon (Ray Casting)
// ─────────────────────────────────────────────

/**
 * Check if a point is inside a polygon using ray casting algorithm.
 * Returns true if inside, false if outside.
 * Points on the edge are considered inside.
 */
export function pointInPolygon(
  point: Point2D,
  vertices: Point2D[]
): boolean {
  let inside = false
  const n = vertices.length

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const vi = vertices[i]
    const vj = vertices[j]

    const intersect =
      vi.y > point.y !== vj.y > point.y &&
      point.x <
        ((vj.x - vi.x) * (point.y - vi.y)) / (vj.y - vi.y) + vi.x

    if (intersect) {
      inside = !inside
    }
  }

  return inside
}

// ─────────────────────────────────────────────
// Polygon Closure
// ─────────────────────────────────────────────

/**
 * Ensure polygon is closed (first vertex === last vertex).
 * Adds closing vertex if needed.
 */
export function ensureClosed(vertices: Point2D[]): Point2D[] {
  if (vertices.length < 2) return vertices

  const first = vertices[0]
  const last = vertices[vertices.length - 1]

  if (distanceSquared(first, last) > EPSILON * EPSILON) {
    return [...vertices, { x: first.x, y: first.y }]
  }

  return vertices
}

/** Check if polygon is closed */
export function isClosed(vertices: Point2D[]): boolean {
  if (vertices.length < 2) return false
  return distanceSquared(vertices[0], vertices[vertices.length - 1]) < EPSILON * EPSILON
}

// ─────────────────────────────────────────────
// Curve Approximation
// ─────────────────────────────────────────────

/**
 * Approximate a circle as a polygon.
 * @param centerX Circle center X
 * @param centerY Circle center Y
 * @param radius Circle radius
 * @param segments Number of segments (default: 36)
 */
export function circleToPolygon(
  centerX: number,
  centerY: number,
  radius: number,
  segments: number = 36
): Point2D[] {
  const vertices: Point2D[] = []
  for (let i = 0; i < segments; i++) {
    const angle = (2 * Math.PI * i) / segments
    vertices.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    })
  }
  // Close the polygon
  vertices.push({ x: vertices[0].x, y: vertices[0].y })
  return vertices
}

/**
 * Approximate an ellipse as a polygon.
 * @param centerX Ellipse center X
 * @param centerY Ellipse center Y
 * @param radiusX Semi-major axis
 * @param radiusY Semi-minor axis
 * @param rotation Rotation angle in degrees
 * @param segments Number of segments
 */
export function ellipseToPolygon(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  rotation: number = 0,
  segments: number = 36
): Point2D[] {
  const vertices: Point2D[] = []
  const center = { x: centerX, y: centerY }

  for (let i = 0; i < segments; i++) {
    const angle = (2 * Math.PI * i) / segments
    const x = centerX + radiusX * Math.cos(angle)
    const y = centerY + radiusY * Math.sin(angle)
    vertices.push(rotatePoint({ x, y }, center, rotation))
  }

  // Close the polygon
  vertices.push({ x: vertices[0].x, y: vertices[0].y })
  return vertices
}

/**
 * Approximate an arc as a polygon.
 * @param centerX Arc center X
 * @param centerY Arc center Y
 * @param radius Arc radius
 * @param startAngle Start angle in degrees
 * @param endAngle End angle in degrees
 * @param segments Number of segments
 */
export function arcToPolygon(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  segments: number = 36
): Point2D[] {
  const vertices: Point2D[] = []
  const startRad = degToRad(startAngle)
  const endRad = degToRad(endAngle)
  const sweep = endRad - startRad

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const angle = startRad + sweep * t
    vertices.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    })
  }

  return vertices
}
