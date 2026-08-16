// Geometry utilities for nesting

/** Calculate polygon area using the shoelace formula */
export function polygonArea(vertices: [number, number][]): number {
  if (vertices.length < 3) return 0

  let area = 0
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length
    area += vertices[i][0] * vertices[j][1]
    area -= vertices[j][0] * vertices[i][1]
  }
  return Math.abs(area) / 2
}

/** Calculate polygon centroid */
export function centroid(vertices: [number, number][]): { x: number; y: number } {
  if (vertices.length === 0) return { x: 0, y: 0 }

  let cx = 0, cy = 0
  for (const v of vertices) {
    cx += v[0]
    cy += v[1]
  }
  return { x: cx / vertices.length, y: cy / vertices.length }
}

/** Rotate a point around origin by degrees */
export function rotatePoint(
  x: number,
  y: number,
  degrees: number
): { x: number; y: number } {
  const angle = (degrees * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  }
}

/** Rotate a polygon around its centroid by degrees */
export function rotatePolygon(
  vertices: [number, number][],
  degrees: number
): [number, number][] {
  if (degrees === 0 || degrees % 360 === 0) return vertices

  const c = centroid(vertices)
  return vertices.map((v) => {
    const dx = v[0] - c.x
    const dy = v[1] - c.y
    const rotated = rotatePoint(dx, dy, degrees)
    return [rotated.x + c.x, rotated.y + c.y] as [number, number]
  })
}

/** Get bounding box of a polygon */
export function getBBox(vertices: [number, number][]): {
  x: number
  y: number
  w: number
  h: number
} {
  if (vertices.length === 0) return { x: 0, y: 0, w: 0, h: 0 }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const v of vertices) {
    if (v[0] < minX) minX = v[0]
    if (v[0] > maxX) maxX = v[0]
    if (v[1] < minY) minY = v[1]
    if (v[1] > maxY) maxY = v[1]
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
}

/** Get bounding box of multiple polygons */
export function getCombinedBBox(polygons: [number, number][][]): {
  x: number
  y: number
  w: number
  h: number
} {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const poly of polygons) {
    const bbox = getBBox(poly)
    if (bbox.x < minX) minX = bbox.x
    if (bbox.y < minY) minY = bbox.y
    if (bbox.x + bbox.w > maxX) maxX = bbox.x + bbox.w
    if (bbox.y + bbox.h > maxY) maxY = bbox.y + bbox.h
  }
  if (minX === Infinity) return { x: 0, y: 0, w: 0, h: 0 }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
}

/** Translate all vertices by (dx, dy) */
export function translatePolygon(
  vertices: [number, number][],
  dx: number,
  dy: number
): [number, number][] {
  return vertices.map((v) => [v[0] + dx, v[1] + dy] as [number, number])
}

/** Check if two points are approximately equal */
export function pointsEqual(
  a: [number, number],
  b: [number, number],
  tolerance = 0.001
): boolean {
  return Math.abs(a[0] - b[0]) < tolerance && Math.abs(a[1] - b[1]) < tolerance
}

/** Remove duplicate consecutive vertices from a polygon */
export function simplifyPolygon(
  vertices: [number, number][],
  tolerance = 0.01
): [number, number][] {
  if (vertices.length < 3) return vertices

  const result: [number, number][] = [vertices[0]]

  for (let i = 1; i < vertices.length; i++) {
    const prev = result[result.length - 1]
    if (!pointsEqual(prev, vertices[i], tolerance)) {
      result.push(vertices[i])
    }
  }

  // Ensure closed polygon
  if (result.length > 2 && !pointsEqual(result[0], result[result.length - 1], tolerance)) {
    result.push(result[0])
  }

  return result
}

/** Offset a polygon outward by a distance (simplified — uses vertex normals) */
export function offsetPolygon(
  vertices: [number, number][],
  distance: number
): [number, number][] {
  if (distance === 0) return vertices

  const n = vertices.length
  const result: [number, number][] = []

  for (let i = 0; i < n - 1; i++) {
    const curr = vertices[i]
    const next = vertices[(i + 1) % (n - 1)]

    // Edge vector
    const dx = next[0] - curr[0]
    const dy = next[1] - curr[1]
    const len = Math.sqrt(dx * dx + dy * dy)

    if (len < 0.0001) {
      result.push(curr)
      continue
    }

    // Outward normal
    const nx = -dy / len
    const ny = dx / len

    result.push([curr[0] + nx * distance, curr[1] + ny * distance] as [number, number])
  }

  return result
}
