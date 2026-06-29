/**
 * Geometry Analysis
 *
 * Computes geometric properties for nesting: bounding boxes, rotated bounding boxes,
 * area, perimeter, centroid, and convex hulls.
 */

import type { NestableShape, CompoundShape, BoundingBox, Point2D } from './types'
import {
  computeBoundingBox,
  computeRotatedBoundingBox,
  computeConvexHull,
  computeArea,
  computePerimeter,
  computeCentroid,
  rotatePolygon,
} from './polygonUtils'

// ─────────────────────────────────────────────
// Bounding Box Analysis
// ─────────────────────────────────────────────

/**
 * Compute bounding boxes for all allowed rotation angles.
 * Returns the smallest bounding box among all rotations.
 */
export function computeBestRotatedBbox(
  shape: NestableShape
): { bbox: BoundingBox; bestRotation: number } {
  let bestBbox: BoundingBox | null = null
  let bestRotation = 0
  let bestPerimeter = Infinity

  for (const angle of shape.allowedRotations) {
    const bbox = computeRotatedBoundingBox(
      shape.vertices,
      shape.centroid,
      angle
    )

    // Prefer the rotation with smallest bounding box perimeter
    const perimeter = 2 * (bbox.width + bbox.height)
    if (perimeter < bestPerimeter) {
      bestPerimeter = perimeter
      bestBbox = bbox
      bestRotation = angle
    }
  }

  return {
    bbox: bestBbox ?? shape.bbox,
    bestRotation,
  }
}

/**
 * Enlarge a bounding box by a margin (kerf/2 on each side).
 */
export function enlargeBbox(bbox: BoundingBox, margin: number): BoundingBox {
  return {
    minX: bbox.minX - margin,
    minY: bbox.minY - margin,
    maxX: bbox.maxX + margin,
    maxY: bbox.maxY + margin,
    width: bbox.width + 2 * margin,
    height: bbox.height + 2 * margin,
  }
}

// ─────────────────────────────────────────────
// Shape Analysis
// ─────────────────────────────────────────────

/**
 * Analyze a shape and compute all necessary geometric properties.
 * Returns an enriched shape with convex hull (if requested) and
 * best rotation for packing.
 */
export function analyzeShape(
  shape: NestableShape,
  computeHull: boolean = false
): NestableShape & { bestRotation: number; enlargedBbox: BoundingBox } {
  const { bestRotation, bbox } = computeBestRotatedBbox(shape)

  const result = {
    ...shape,
    bestRotation,
    enlargedBbox: enlargeBbox(bbox, shape.kerf / 2),
  }

  if (computeHull && !shape.convexHull) {
    result.convexHull = computeConvexHull(shape.vertices)
  }

  return result
}

/**
 * Analyze all shapes for nesting.
 */
export function analyzeShapes(
  shapes: NestableShape[],
  computeHull: boolean = false
): Array<NestableShape & { bestRotation: number; enlargedBbox: BoundingBox }> {
  return shapes.map((shape) => analyzeShape(shape, computeHull))
}

// ─────────────────────────────────────────────
// Compound Shape Analysis
// ─────────────────────────────────────────────

/**
 * Analyze a compound shape (outer + holes).
 * Computes combined bounding box and net area.
 */
export function analyzeCompoundShape(
  compound: CompoundShape,
  computeHull: boolean = false
): CompoundShape & { bestRotation: number; enlargedBbox: BoundingBox } {
  const outerAnalysis = analyzeShape(compound.outer, computeHull)

  // Compute combined bounding box
  let combinedBbox = compound.outer.bbox
  for (const hole of compound.holes) {
    const minX = Math.min(combinedBbox.minX, hole.bbox.minX)
    const minY = Math.min(combinedBbox.minY, hole.bbox.minY)
    const maxX = Math.max(combinedBbox.maxX, hole.bbox.maxX)
    const maxY = Math.max(combinedBbox.maxY, hole.bbox.maxY)
    combinedBbox = {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }

  return {
    ...compound,
    bestRotation: outerAnalysis.bestRotation,
    enlargedBbox: enlargeBbox(combinedBbox, compound.kerf / 2),
  }
}

// ─────────────────────────────────────────────
// Sorting
// ─────────────────────────────────────────────

/**
 * Sort shapes by the given strategy.
 */
export function sortShapes(
  shapes: NestableShape[],
  strategy: 'area-desc' | 'area-asc' | 'perimeter-desc' | 'none'
): NestableShape[] {
  if (strategy === 'none') return [...shapes]

  const sorted = [...shapes]

  switch (strategy) {
    case 'area-desc':
      sorted.sort((a, b) => b.area - a.area)
      break
    case 'area-asc':
      sorted.sort((a, b) => a.area - b.area)
      break
    case 'perimeter-desc':
      sorted.sort((a, b) => b.perimeter - a.perimeter)
      break
  }

  return sorted
}
