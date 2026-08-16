/**
 * Collision Detection
 *
 * Detects collisions between shapes using:
 * 1. Bounding box overlap (fast reject)
 * 2. Separating Axis Theorem (SAT) for convex polygons
 * 3. Point-in-polygon for containment checks
 */

import type { Point2D, BoundingBox, CollisionResult } from './types'
import { EPSILON } from './config'
import { rotatePolygon, computeConvexHull } from './polygonUtils'

// ─────────────────────────────────────────────
// Bounding Box Overlap
// ─────────────────────────────────────────────

/**
 * Check if two axis-aligned bounding boxes overlap.
 * Returns false if they do NOT overlap (fast reject).
 */
export function bboxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.minX < b.maxX &&
    a.maxX > b.minX &&
    a.minY < b.maxY &&
    a.maxY > b.minY
  )
}

/**
 * Check if two bounding boxes overlap with a margin.
 */
export function bboxesOverlapWithMargin(
  a: BoundingBox,
  b: BoundingBox,
  margin: number
): boolean {
  const aEnlarged = {
    minX: a.minX - margin,
    minY: a.minY - margin,
    maxX: a.maxX + margin,
    maxY: a.maxY + margin,
    width: a.width + 2 * margin,
    height: a.height + 2 * margin,
  }
  return bboxesOverlap(aEnlarged, b)
}

// ─────────────────────────────────────────────
// Separating Axis Theorem (SAT)
// ─────────────────────────────────────────────

/**
 * Project a polygon onto an axis.
 * Returns [min, max] projection range.
 */
function projectPolygon(
  vertices: Point2D[],
  axis: Point2D
): [number, number] {
  let min = Infinity
  let max = -Infinity

  for (const v of vertices) {
    const projection = v.x * axis.x + v.y * axis.y
    if (projection < min) min = projection
    if (projection > max) max = projection
  }

  return [min, max]
}

/**
 * Check if two projections overlap.
 */
function projectionsOverlap(
  a: [number, number],
  b: [number, number],
  margin: number
): boolean {
  return a[0] < b[1] + margin && a[1] > b[0] - margin
}

/**
 * Get normal vector of an edge.
 */
function edgeNormal(p1: Point2D, p2: Point2D): Point2D {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const length = Math.sqrt(dx * dx + dy * dy)
  if (length < EPSILON) return { x: 1, y: 0 }
  return { x: -dy / length, y: dx / length }
}

/**
 * Separating Axis Theorem for convex polygons.
 * Returns true if polygons collide (overlap).
 */
export function satCollision(
  polyA: Point2D[],
  polyB: Point2D[],
  margin: number = 0
): boolean {
  // Ensure we use convex hulls
  const hullA = polyA.length > 3 ? computeConvexHull(polyA) : polyA
  const hullB = polyB.length > 3 ? computeConvexHull(polyB) : polyB

  // Collect axes to test (normals of all edges)
  const axes: Point2D[] = []

  // Edges of polygon A
  for (let i = 0; i < hullA.length - 1; i++) {
    axes.push(edgeNormal(hullA[i], hullA[i + 1]))
  }

  // Edges of polygon B
  for (let i = 0; i < hullB.length - 1; i++) {
    axes.push(edgeNormal(hullB[i], hullB[i + 1]))
  }

  // Test each axis
  for (const axis of axes) {
    const projA = projectPolygon(hullA, axis)
    const projB = projectPolygon(hullB, axis)

    // If projections don't overlap, polygons don't collide
    if (!projectionsOverlap(projA, projB, margin)) {
      return false
    }
  }

  // No separating axis found → polygons collide
  return true
}

// ─────────────────────────────────────────────
// Full Collision Check
// ─────────────────────────────────────────────

/**
 * Check if two shapes collide, using bounding box as fast reject
 * and SAT for precise detection.
 */
export function checkCollision(
  verticesA: Point2D[],
  bboxA: BoundingBox,
  verticesB: Point2D[],
  bboxB: BoundingBox,
  margin: number = 0
): CollisionResult {
  // Fast reject: bounding box check
  if (!bboxesOverlapWithMargin(bboxA, bboxB, margin)) {
    return { collides: false }
  }

  // Precise check: SAT
  const collides = satCollision(verticesA, verticesB, margin)

  return {
    collides,
  }
}

// ─────────────────────────────────────────────
// Transformed Collision Check
// ─────────────────────────────────────────────

/**
 * Check collision between two shapes after applying transforms
 * (translation + rotation).
 */
export function checkTransformedCollision(
  verticesA: Point2D[],
  centroidA: Point2D,
  rotationA: number,
  offsetXA: number,
  offsetYA: number,
  verticesB: Point2D[],
  centroidB: Point2D,
  rotationB: number,
  offsetXB: number,
  offsetYB: number,
  margin: number
): boolean {
  // Apply transforms
  const rotatedA = rotatePolygon(verticesA, centroidA, rotationA)
  const translatedA = rotatedA.map((v) => ({
    x: v.x + offsetXA,
    y: v.y + offsetYA,
  }))

  const rotatedB = rotatePolygon(verticesB, centroidB, rotationB)
  const translatedB = rotatedB.map((v) => ({
    x: v.x + offsetXB,
    y: v.y + offsetYB,
  }))

  return satCollision(translatedA, translatedB, margin)
}

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

/**
 * Validate that no placements overlap.
 * Returns an array of collision pairs if any.
 */
export function validatePlacements(
  placements: Array<{
    id: string
    vertices: Point2D[]
    bbox: BoundingBox
  }>,
  margin: number
): string[][] {
  const collisions: string[][] = []

  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      const a = placements[i]
      const b = placements[j]

      if (
        checkCollision(
          a.vertices,
          a.bbox,
          b.vertices,
          b.bbox,
          margin
        ).collides
      ) {
        collisions.push([a.id, b.id])
      }
    }
  }

  return collisions
}
