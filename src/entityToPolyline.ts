import bSpline from './util/bSpline'
import createArcForLWPolyine from './util/createArcForLWPolyline'
import logger from './util/logger'

import type {
  ArcEntity,
  CircleEntity,
  ControlPoint,
  EllipseEntity,
  EntityToPolylineOptions,
  HandlerVertex,
  LeaderEntity,
  LineEntity,
  RayEntity,
  ShapeEntity,
  SplineEntity,
  WipeoutEntity,
  XLineEntity,
} from './types'
import type { PointTuple } from './types/common'

// Re-export types for backward compatibility
export type { ControlPoint, EntityToPolylineOptions } from './types'

type Point = PointTuple

// Local vertex type with required coordinates for runtime processing
interface LocalVertex extends HandlerVertex {
  faces?: number[]
}

// Local polyline type that uses our vertex with required coordinates
interface LocalPolylineEntity {
  type: string
  vertices: LocalVertex[]
  closed?: boolean
  polyfaceMesh?: boolean
  polygonMesh?: boolean
}

type Entity =
  | LineEntity
  | LeaderEntity
  | RayEntity
  | XLineEntity
  | ShapeEntity
  | WipeoutEntity
  | (LocalPolylineEntity & { type: 'LWPOLYLINE' | 'POLYLINE' })
  | {
      type: 'SOLID' | 'TRACE'
      corners?: Array<{ x: number; y: number }>
      points?: Array<{ x: number; y: number }>
    }
  | CircleEntity
  | EllipseEntity
  | ArcEntity
  | SplineEntity

/**
 * Rotate a set of points.
 *
 * @param points the points
 * @param angle the rotation angle
 */
const rotate = (points: Point[], angle: number): Point[] => {
  return points.map(function (p) {
    return [
      p[0] * Math.cos(angle) - p[1] * Math.sin(angle),
      p[1] * Math.cos(angle) + p[0] * Math.sin(angle),
    ]
  })
}

/**
 * Interpolate an ellipse
 * @param cx center X
 * @param cy center Y
 * @param rx radius X
 * @param ry radius Y
 * @param start start angle in radians
 * @param start end angle in radians
 */
const interpolateEllipse = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  start: number,
  end: number,
  rotationAngle?: number,
): Point[] => {
  if (end < start) {
    end += Math.PI * 2
  }

  // ----- Relative points -----

  // Start point
  let points: Point[] = []
  const dTheta = (Math.PI * 2) / 72
  const EPS = 1e-6
  for (let theta = start; theta < end - EPS; theta += dTheta) {
    points.push([Math.cos(theta) * rx, Math.sin(theta) * ry])
  }
  points.push([Math.cos(end) * rx, Math.sin(end) * ry])

  // ----- Rotate -----
  if (rotationAngle) {
    points = rotate(points, rotationAngle)
  }

  // ----- Offset center -----
  points = points.map(function (p): Point {
    return [cx + p[0], cy + p[1]]
  })

  return points
}

/**
 * Interpolate a b-spline. The algorithm examins the knot vector
 * to create segments for interpolation. The parameterisation value
 * is re-normalised back to [0,1] as that is what the lib expects (
 * and t i de-normalised in the b-spline library)
 *
 * @param controlPoints the control points
 * @param degree the b-spline degree
 * @param knots the knot vector
 * @returns the polyline
 */
export const interpolateBSpline = (
  controlPoints: ControlPoint[],
  degree: number,
  knots: number[],
  interpolationsPerSplineSegment?: number,
  weights?: number[],
): Point[] => {
  const polyline: Point[] = []
  const controlPointsForLib = controlPoints.map(function (p): Point {
    return [p.x, p.y]
  })

  const segmentTs = [knots[degree]]
  const domain: Point = [knots[degree], knots[knots.length - 1 - degree]]

  for (let k = degree + 1; k < knots.length - degree; ++k) {
    if (segmentTs[segmentTs.length - 1] !== knots[k]) {
      segmentTs.push(knots[k])
    }
  }

  interpolationsPerSplineSegment = interpolationsPerSplineSegment || 25
  for (let i = 1; i < segmentTs.length; ++i) {
    const uMin = segmentTs[i - 1]
    const uMax = segmentTs[i]
    for (let k = 0; k <= interpolationsPerSplineSegment; ++k) {
      const u = (k / interpolationsPerSplineSegment) * (uMax - uMin) + uMin
      // Clamp t to 0, 1 to handle numerical precision issues
      let t = (u - domain[0]) / (domain[1] - domain[0])
      t = Math.max(t, 0)
      t = Math.min(t, 1)
      const p = bSpline(t, degree, controlPointsForLib, knots, weights)
      polyline.push([p[0], p[1]])
    }
  }
  return polyline
}

export const polyfaceOutline = (entity: LocalPolylineEntity): Point[][] => {
  // NOSONAR
  const vertices: Array<{ x: number; y: number }> = []
  const faces: Array<{ indices: number[]; hiddens: boolean[] }> = []

  for (const v of entity.vertices) {
    if (v.faces) {
      const face: { indices: number[]; hiddens: boolean[] } = {
        indices: [],
        hiddens: [],
      }
      for (const i of v.faces) {
        if (i === 0) {
          break
        }
        // Negative indices signify hidden edges
        face.indices.push(i < 0 ? -i - 1 : i - 1)
        face.hiddens.push(i < 0)
      }
      if ([3, 4].includes(face.indices.length)) faces.push(face)
    } else {
      vertices.push({ x: v.x, y: v.y })
    }
  }

  // If a segment starts at the end of a previous line, continue it
  const polylines: number[][] = []
  const segment = (a: number, b: number): void => {
    for (const prev of polylines) {
      if (prev.slice(-1)[0] === a) {
        prev.push(b)
        return
      }
    }
    polylines.push([a, b])
  }

  for (const face of faces) {
    for (let beg = 0; beg < face.indices.length; beg++) {
      if (face.hiddens[beg]) {
        continue
      }
      const end = (beg + 1) % face.indices.length
      segment(face.indices[beg], face.indices[end])
    }
  }

  // Sometimes segments are not sequential, in that case
  // we need to find if they can mend gaps between others
  for (const a of polylines) {
    for (const b of polylines) {
      if (a !== b && a[0] === b.slice(-1)[0]) {
        b.push(...a.slice(1))
        a.splice(0, a.length)
        break
      }
    }
  }

  return polylines
    .filter((l) => l.length)
    .map((l) => l.map((i) => vertices[i]).map((v) => [v.x, v.y]))
}

/**
 * Convert a parsed DXF entity to a polyline. These can be used to render the
 * the DXF in SVG, Canvas, WebGL etc., without depending on native support
 * of primitive objects (ellispe, spline etc.)
 */
export default function entityToPolyline( // NOSONAR
  entity: Entity,
  options?: EntityToPolylineOptions,
): Point[] {
  options = options || {}
  let polyline: Point[] | undefined

  const INFINITE_LINE_LENGTH = 1000

  const normalize2 = (
    x: number,
    y: number,
  ): { x: number; y: number } | null => {
    const len = Math.hypot(x, y)
    if (len === 0) return null
    return { x: x / len, y: y / len }
  }

  if (entity.type === 'LINE') {
    polyline = [
      [entity.start.x, entity.start.y],
      [entity.end.x, entity.end.y],
    ]
  }

  if (entity.type === 'LEADER') {
    if (entity.vertices.length >= 2) {
      polyline = entity.vertices.map((v) => [v.x, v.y])
    } else {
      logger.warn('LEADER entity with insufficient vertices')
      polyline = []
    }
  }

  if (entity.type === 'RAY') {
    const dir = normalize2(entity.direction.x, entity.direction.y)
    if (dir === null) {
      logger.warn('RAY entity with zero direction vector')
      polyline = []
    } else {
      polyline = [
        [entity.start.x, entity.start.y],
        [
          entity.start.x + dir.x * INFINITE_LINE_LENGTH,
          entity.start.y + dir.y * INFINITE_LINE_LENGTH,
        ],
      ]
    }
  }

  if (entity.type === 'XLINE') {
    const dir = normalize2(entity.direction.x, entity.direction.y)
    if (dir === null) {
      logger.warn('XLINE entity with zero direction vector')
      polyline = []
    } else {
      polyline = [
        [
          entity.basePoint.x - dir.x * INFINITE_LINE_LENGTH,
          entity.basePoint.y - dir.y * INFINITE_LINE_LENGTH,
        ],
        [
          entity.basePoint.x + dir.x * INFINITE_LINE_LENGTH,
          entity.basePoint.y + dir.y * INFINITE_LINE_LENGTH,
        ],
      ]
    }
  }

  if (entity.type === 'SHAPE') {
    const x = entity.insertionPoint?.x ?? 0
    const y = entity.insertionPoint?.y ?? 0
    const size = entity.size ?? 0
    const scaleX = entity.relativeXScale ?? 1
    const length = size * scaleX
    polyline = [
      [x, y],
      [x + length, y],
    ]
  }

  if (entity.type === 'WIPEOUT') {
    const verts = entity.clipBoundaryVertices
    if (!verts || verts.length < 2) {
      logger.warn('WIPEOUT entity with missing clip boundary vertices')
      polyline = []
    } else {
      const insX = entity.insertionPoint?.x ?? 0
      const insY = entity.insertionPoint?.y ?? 0

      const ux = entity.uVector?.x ?? 1
      const uy = entity.uVector?.y ?? 0

      const vx = entity.vVector?.x ?? 0
      const vy = entity.vVector?.y ?? 1

      polyline = verts.map((p) => [
        insX + ux * p.x + vx * p.y,
        insY + uy * p.x + vy * p.y,
      ])

      if (polyline.length > 0) {
        const first = polyline[0]
        const last = polyline[polyline.length - 1]
        if (first[0] !== last[0] || first[1] !== last[1]) {
          polyline.push(first)
        }
      }
    }
  }

  if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
    polyline = []
    if (entity.polyfaceMesh) {
      // Only return the first polyline because we can't return many
      polyline.push(...polyfaceOutline(entity)[0])
    } else if (entity.polygonMesh) {
      // Do not attempt to render polygon meshes
    } else if (entity.vertices.length) {
      const vertices = entity.closed
        ? entity.vertices.concat(entity.vertices[0])
        : entity.vertices

      for (let i = 0, il = vertices.length; i < il - 1; ++i) {
        const from: Point = [vertices[i].x, vertices[i].y]
        const to: Point = [vertices[i + 1].x, vertices[i + 1].y]
        polyline.push(from)
        if (vertices[i].bulge) {
          polyline = polyline.concat(
            createArcForLWPolyine(from, to, vertices[i].bulge!),
          )
        }
        // The last iteration of the for loop
        if (i === il - 2) {
          polyline.push(to)
        }
      }
    } else {
      logger.warn('Polyline entity with no vertices')
    }
  }

  if (entity.type === 'CIRCLE') {
    polyline = interpolateEllipse(
      entity.x,
      entity.y,
      entity.r,
      entity.r,
      0,
      Math.PI * 2,
    )
    if (entity.extrusionZ === -1) {
      polyline = polyline.map(function (p): Point {
        return [-p[0], p[1]]
      })
    }
  }

  if (entity.type === 'ELLIPSE') {
    const rx = Math.hypot(entity.majorX, entity.majorY)
    const ry = entity.axisRatio * rx
    const majorAxisRotation = -Math.atan2(-entity.majorY, entity.majorX)
    polyline = interpolateEllipse(
      entity.x,
      entity.y,
      rx,
      ry,
      entity.startAngle,
      entity.endAngle,
      majorAxisRotation,
    )
    if (entity.extrusionZ === -1) {
      polyline = polyline.map(function (p): Point {
        return [-p[0], p[1]]
      })
    }
  }

  if (entity.type === 'ARC') {
    // Why on earth DXF has degree start & end angles for arc,
    // and radian start & end angles for ellipses is a mystery
    polyline = interpolateEllipse(
      entity.x,
      entity.y,
      entity.r,
      entity.r,
      entity.startAngle,
      entity.endAngle,
    )

    // I kid you not, ARCs and ELLIPSEs handle this differently,
    // as evidenced by how AutoCAD actually renders these entities
    if (entity.extrusionZ === -1) {
      polyline = polyline.map(function (p): Point {
        return [-p[0], p[1]]
      })
    }
  }

  if (entity.type === 'SPLINE') {
    polyline = interpolateBSpline(
      entity.controlPoints,
      entity.degree,
      entity.knots,
      options.interpolationsPerSplineSegment,
      entity.weights,
    )
  }

  if (entity.type === 'SOLID' || entity.type === 'TRACE') {
    const corners = entity.corners ?? entity.points
    if (corners && corners.length >= 4) {
      polyline = [
        [corners[0].x, corners[0].y],
        [corners[1].x, corners[1].y],
        [corners[2].x, corners[2].y],
        [corners[3].x, corners[3].y],
        [corners[0].x, corners[0].y],
      ]
    }
  }

  if (!polyline) {
    logger.warn('unsupported entity for converting to polyline:', entity.type)
    return []
  }
  return polyline
}
