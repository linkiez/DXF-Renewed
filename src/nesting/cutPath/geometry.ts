import type { BoundingBox, Point2D, StockItem } from '../types'
import { checkCollision } from '../collision'
import { EPSILON } from '../config'
import {
  computeBoundingBox,
  distance,
  pointInPolygon,
  rotatePolygon,
} from '../polygonUtils'
import type { CutContour } from './types'

/** Return a defensive copy of a point. */
function copyPoint(point: Point2D): Point2D {
  return { x: point.x, y: point.y }
}

/** Return the placed vertices for a contour without mutating its source geometry. */
export function transformedContour(contour: CutContour): Point2D[] {
  const provided = contour.placement.transformedVertices
  if (provided && provided.length > 0) return provided.map(copyPoint)

  const rotated = rotatePolygon(
    contour.shape.vertices,
    contour.shape.centroid,
    contour.placement.rotation,
  )
  return rotated.map((point) => ({
    x: point.x + contour.placement.x,
    y: point.y + contour.placement.y,
  }))
}

/** Compute the bounds of a placed contour. */
export function contourBounds(contour: CutContour): BoundingBox {
  return computeBoundingBox(transformedContour(contour))
}

/** Measure the length of a route, including every consecutive segment. */
export function routeDistance(points: readonly Point2D[]): number {
  let total = 0
  for (let index = 1; index < points.length; index += 1) {
    total += distance(points[index - 1], points[index])
  }
  return total
}

/** Measure rapid travel between contour entry points in the supplied order. */
export function rapidRouteDistance(
  contours: readonly CutContour[],
  startPoint: Point2D = { x: 0, y: 0 },
): number {
  let total = 0
  let current = startPoint
  for (const contour of contours) {
    const vertices = transformedContour(contour)
    const entry = vertices[0]
    if (!entry) continue
    total += distance(current, entry)
    current = entry
  }
  return total
}

/** Return true when all contour vertices satisfy the sheet edge clearance. */
export function isContourWithinSheet(
  contour: CutContour,
  sheet: StockItem,
  clearance = 0,
): boolean {
  if (clearance < -EPSILON) return false
  return transformedContour(contour).every(
    (point) =>
      point.x >= clearance - EPSILON &&
      point.y >= clearance - EPSILON &&
      point.x <= sheet.width - clearance + EPSILON &&
      point.y <= sheet.height - clearance + EPSILON,
  )
}

/** Return true when a point is inside or on the boundary of a polygon. */
export function pointOnOrInsidePolygon(
  point: Point2D,
  polygon: readonly Point2D[],
): boolean {
  if (polygon.length < 3) return false
  if (pointInPolygon(point, [...polygon])) return true
  for (let index = 1; index < polygon.length; index += 1) {
    const start = polygon[index - 1]
    const end = polygon[index]
    const cross =
      (point.x - start.x) * (end.y - start.y) -
      (point.y - start.y) * (end.x - start.x)
    if (Math.abs(cross) > EPSILON) continue
    const dot =
      (point.x - start.x) * (point.x - end.x) +
      (point.y - start.y) * (point.y - end.y)
    if (dot <= EPSILON) return true
  }
  return false
}

/** Return true when a rapid segment intersects or enters a kept contour. */
export function rapidCrossesContour(
  start: Point2D,
  end: Point2D,
  contour: CutContour,
  clearance = 0,
): boolean {
  const vertices = transformedContour(contour)
  if (vertices.length < 3) return false
  const segmentBounds = computeBoundingBox([start, end])
  const contourBox = computeBoundingBox(vertices)
  if (
    !checkCollision(
      [start, end],
      segmentBounds,
      vertices,
      contourBox,
      Math.max(0, clearance),
    ).collides
  ) {
    return false
  }
  return (
    pointOnOrInsidePolygon(start, vertices) ||
    pointOnOrInsidePolygon(end, vertices) ||
    vertices.some((vertex, index) => {
      const next = vertices[(index + 1) % vertices.length]
      return segmentsIntersect(start, end, vertex, next, clearance)
    })
  )
}

/** Minimum distance between a point and a segment. */
export function pointToSegmentDistance(
  point: Point2D,
  start: Point2D,
  end: Point2D,
): number {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy
  if (lengthSquared <= EPSILON * EPSILON) return distance(point, start)
  const projection = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * dx + (point.y - start.y) * dy) /
        lengthSquared,
    ),
  )
  return distance(point, {
    x: start.x + projection * dx,
    y: start.y + projection * dy,
  })
}

/** Minimum distance between two polygon boundaries. */
export function contourClearance(
  first: readonly Point2D[],
  second: readonly Point2D[],
): number {
  let minimum = Infinity
  for (let firstIndex = 0; firstIndex < first.length; firstIndex += 1) {
    const firstStart = first[firstIndex]
    const firstEnd = first[(firstIndex + 1) % first.length]
    for (let secondIndex = 0; secondIndex < second.length; secondIndex += 1) {
      const secondStart = second[secondIndex]
      const secondEnd = second[(secondIndex + 1) % second.length]
      if (segmentsIntersect(firstStart, firstEnd, secondStart, secondEnd)) {
        return 0
      }
      minimum = Math.min(
        minimum,
        pointToSegmentDistance(firstStart, secondStart, secondEnd),
        pointToSegmentDistance(secondStart, firstStart, firstEnd),
      )
    }
  }
  return minimum
}

function segmentsIntersect(
  firstStart: Point2D,
  firstEnd: Point2D,
  secondStart: Point2D,
  secondEnd: Point2D,
  clearance = 0,
): boolean {
  if (
    pointToSegmentDistance(firstStart, secondStart, secondEnd) <=
      clearance + EPSILON ||
    pointToSegmentDistance(firstEnd, secondStart, secondEnd) <=
      clearance + EPSILON ||
    pointToSegmentDistance(secondStart, firstStart, firstEnd) <=
      clearance + EPSILON ||
    pointToSegmentDistance(secondEnd, firstStart, firstEnd) <=
      clearance + EPSILON
  ) {
    return true
  }
  const orientation = (a: Point2D, b: Point2D, c: Point2D): number =>
    (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  const first = orientation(firstStart, firstEnd, secondStart)
  const second = orientation(firstStart, firstEnd, secondEnd)
  const third = orientation(secondStart, secondEnd, firstStart)
  const fourth = orientation(secondStart, secondEnd, firstEnd)
  return (
    ((first > EPSILON && second < -EPSILON) ||
      (first < -EPSILON && second > EPSILON)) &&
    ((third > EPSILON && fourth < -EPSILON) ||
      (third < -EPSILON && fourth > EPSILON))
  )
}
