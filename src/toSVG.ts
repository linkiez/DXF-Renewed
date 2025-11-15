import { Box2 } from 'vecks'

import denormalise from './denormalise'
import entityToPolyline from './entityToPolyline'
import getRGBForEntity from './getRGBForEntity'
import logger from './util/logger'
import rgbToColorAttribute from './util/rgbToColorAttribute'
import rotate from './util/rotate'
import toPiecewiseBezier, { multiplicity } from './util/toPiecewiseBezier'
import transformBoundingBoxAndElement from './util/transformBoundingBoxAndElement'

import type {
  ArcEntity,
  CircleEntity,
  DimensionEntity,
  EllipseEntity,
  Entity,
  LineEntity,
  MTextEntity,
  ParsedDXF,
  PolylineEntity,
  SplineEntity,
  TextEntity,
} from './types'

interface BoundsAndElement {
  bbox: Box2
  element: string
}

const addFlipXIfApplicable = (
  entity: Entity,
  { bbox, element }: BoundsAndElement,
): BoundsAndElement => {
  if (entity.extrusionZ === -1) {
    return {
      bbox: new Box2()
        .expandByPoint({ x: -bbox.min.x, y: bbox.min.y })
        .expandByPoint({ x: -bbox.max.x, y: bbox.max.y }),
      element: `<g transform="matrix(-1 0 0 1 0 0)">
        ${element}
      </g>`,
    }
  } else {
    return { bbox, element }
  }
}

/**
 * Create a <path /> element. Interpolates curved entities.
 */
const polyline = (entity: Entity): BoundsAndElement => {
  const vertices = entityToPolyline(entity as LineEntity | PolylineEntity | CircleEntity | EllipseEntity | ArcEntity | SplineEntity)
  const bbox = vertices.reduce(
    (acc, [x, y]) => acc.expandByPoint({ x, y }),
    new Box2(),
  )
  const d = vertices.reduce((acc, point, i) => {
    acc += i === 0 ? 'M' : 'L'
    acc += point[0] + ',' + point[1]
    return acc
  }, '')
  // Empirically it appears that flipping horizontally does not apply to polyline
  return transformBoundingBoxAndElement(
    bbox,
    `<path d="${d}" />`,
    entity.transforms ?? [],
  )
}

/**
 * Create a <path /> element. Interpolates curved entities.
 * lwpolyline is the same as polyline but addFlipXIfApplicable does apply
 */
const lwpolyline = (entity: Entity): BoundsAndElement => {
  const vertices = entityToPolyline(entity as PolylineEntity)
  const bbox0 = vertices.reduce(
    (acc, [x, y]) => acc.expandByPoint({ x, y }),
    new Box2(),
  )
  const d = vertices.reduce((acc, point, i) => {
    acc += i === 0 ? 'M' : 'L'
    acc += point[0] + ',' + point[1]
    return acc
  }, '')
  const element0 = `<path d="${d}" />`
  const { bbox, element } = addFlipXIfApplicable(entity, {
    bbox: bbox0,
    element: element0,
  })
  return transformBoundingBoxAndElement(
    bbox,
    element,
    entity.transforms ?? [],
  )
}


/**
 * Create a <circle /> element for the CIRCLE entity.
 */
const circle = (entity: CircleEntity): BoundsAndElement => {
  const bbox0 = new Box2()
    .expandByPoint({
      x: entity.x + entity.r,
      y: entity.y + entity.r,
    })
    .expandByPoint({
      x: entity.x - entity.r,
      y: entity.y - entity.r,
    })
  const element0 = `<circle cx="${entity.x}" cy="${entity.y}" r="${entity.r}" />`
  const { bbox, element } = addFlipXIfApplicable(entity, {
    bbox: bbox0,
    element: element0,
  })
  return transformBoundingBoxAndElement(bbox, element, entity.transforms ?? [])
}

/**
 * Create a a <path d="A..." /> or <ellipse /> element for the ARC or ELLIPSE
 * DXF entity (<ellipse /> if start and end point are the same).
 */
const ellipseOrArc = (
  cx: number,
  cy: number,
  majorX: number,
  majorY: number,
  axisRatio: number,
  startAngle: number,
  endAngle: number,
  flipX?: boolean,
): BoundsAndElement => {
  const rx = Math.hypot(majorX, majorY)
  const ry = axisRatio * rx
  const rotationAngle = -Math.atan2(-majorY, majorX)

  const bbox = bboxEllipseOrArc({
    cx,
    cy,
    majorX,
    majorY,
    axisRatio,
    startAngle,
    endAngle,
    flipX,
  })

  if (
    Math.abs(startAngle - endAngle) < 1e-9 ||
    Math.abs(startAngle - endAngle + Math.PI * 2) < 1e-9
  ) {
    // Use a native <ellipse> when start and end angles are the same, and
    // arc paths with same start and end points don't render (at least on Safari)
    const element = `<g transform="rotate(${
      (rotationAngle / Math.PI) * 180
    } ${cx}, ${cy})">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" />
    </g>`
    return { bbox, element }
  } else {
    const startOffset = rotate(
      {
        x: Math.cos(startAngle) * rx,
        y: Math.sin(startAngle) * ry,
      },
      rotationAngle,
    )
    const startPoint = {
      x: cx + startOffset.x,
      y: cy + startOffset.y,
    }
    const endOffset = rotate(
      {
        x: Math.cos(endAngle) * rx,
        y: Math.sin(endAngle) * ry,
      },
      rotationAngle,
    )
    const endPoint = {
      x: cx + endOffset.x,
      y: cy + endOffset.y,
    }
    const adjustedEndAngle =
      endAngle < startAngle ? endAngle + Math.PI * 2 : endAngle
    const largeArcFlag = adjustedEndAngle - startAngle < Math.PI ? 0 : 1
    const d = `M ${startPoint.x} ${startPoint.y} A ${rx} ${ry} ${
      (rotationAngle / Math.PI) * 180
    } ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`
    const element = `<path d="${d}" />`
    return { bbox, element }
  }
}

/**
 * Compute the bounding box of an elliptical arc, given the DXF entity parameters
 */
interface EllipseParams {
  cx: number
  cy: number
  majorX: number
  majorY: number
  axisRatio: number
  startAngle: number
  endAngle: number
  flipX?: boolean
}

const bboxEllipseOrArc = (params: EllipseParams): Box2 => {
  const { cx, cy, majorX, majorY, axisRatio } = params
  let { startAngle, endAngle } = params

  // The bounding box will be defined by the starting point of the ellipse, and ending point,
  // and any extrema on the ellipse that are between startAngle and endAngle.
  // The extrema are found by setting either the x or y component of the ellipse's
  // tangent vector to zero and solving for the angle.

  // Ensure start and end angles are > 0 and well-ordered
  while (startAngle < 0) startAngle += Math.PI * 2
  while (endAngle <= startAngle) endAngle += Math.PI * 2

  // When rotated, the extrema of the ellipse will be found at these angles
  const angles = []

  if (Math.abs(majorX) < 1e-12 || Math.abs(majorY) < 1e-12) {
    // Special case for majorX or majorY = 0
    for (let i = 0; i < 4; i++) {
      angles.push((i / 2) * Math.PI)
    }
  } else {
    // reference https://github.com/bjnortier/dxf/issues/47#issuecomment-545915042
    angles[0] = Math.atan((-majorY * axisRatio) / majorX) - Math.PI // Ensure angles < 0
    angles[1] = Math.atan((majorX * axisRatio) / majorY) - Math.PI
    angles[2] = angles[0] - Math.PI
    angles[3] = angles[1] - Math.PI
  }

  // Remove angles not falling between start and end
  for (let i = 4; i >= 0; i--) {
    while (angles[i] < startAngle) angles[i] += Math.PI * 2
    if (angles[i] > endAngle) {
      angles.splice(i, 1)
    }
  }

  // Also to consider are the starting and ending points:
  angles.push(startAngle)
  angles.push(endAngle)

  // Compute points lying on the unit circle at these angles
  const pts = angles.map((a) => ({
    x: Math.cos(a),
    y: Math.sin(a),
  }))

  // Transformation matrix, formed by the major and minor axes
  const M = [
    [majorX, -majorY * axisRatio],
    [majorY, majorX * axisRatio],
  ]

  // Rotate, scale, and translate points
  const rotatedPts = pts.map((p) => ({
    x: p.x * M[0][0] + p.y * M[0][1] + cx,
    y: p.x * M[1][0] + p.y * M[1][1] + cy,
  }))

  // Compute extents of bounding box
  const bbox = rotatedPts.reduce((acc, p) => {
    acc.expandByPoint(p)
    return acc
  }, new Box2())

  return bbox
}

/**
 * An ELLIPSE is defined by the major axis, convert to X and Y radius with
 * a rotation angle
 */
const ellipse = (entity: EllipseEntity): BoundsAndElement => {
  const { bbox: bbox0, element: element0 } = ellipseOrArc(
    entity.x,
    entity.y,
    entity.majorX,
    entity.majorY,
    entity.axisRatio,
    entity.startAngle,
    entity.endAngle,
  )
  const { bbox, element } = addFlipXIfApplicable(entity, {
    bbox: bbox0,
    element: element0,
  })
  return transformBoundingBoxAndElement(bbox, element, entity.transforms ?? [])
}

/**
 * An ARC is an ellipse with equal radii
 */
const arc = (entity: ArcEntity): BoundsAndElement => {
  const { bbox: bbox0, element: element0 } = ellipseOrArc(
    entity.x,
    entity.y,
    entity.r,
    0,
    1,
    entity.startAngle,
    entity.endAngle,
    entity.extrusionZ === -1,
  )
  const { bbox, element } = addFlipXIfApplicable(entity, {
    bbox: bbox0,
    element: element0,
  })
  return transformBoundingBoxAndElement(bbox, element, entity.transforms ?? [])
}

/**
 * Create a <text /> element for TEXT entity
 */
const text = (entity: TextEntity): BoundsAndElement => {
  const x = entity.x ?? 0
  const y = entity.y ?? 0
  const height = entity.textHeight ?? 1
  const rotation = entity.rotation ?? 0
  const content = entity.string ?? ''

  // Estimate text bounding box (approximate)
  const textWidth = content.length * height * 0.6
  const bbox0 = new Box2()
    .expandByPoint({ x, y })
    .expandByPoint({ x: x + textWidth, y: y + height })

  const rotationDegrees = (rotation * 180) / Math.PI
  const element0 = `<text x="${x}" y="${y}" font-size="${height}" transform="rotate(${-rotationDegrees} ${x} ${y}) scale(1,-1) translate(0 ${-2 * y})">${content}</text>`

  const { bbox, element } = addFlipXIfApplicable(entity, {
    bbox: bbox0,
    element: element0,
  })
  return transformBoundingBoxAndElement(bbox, element, entity.transforms ?? [])
}

/**
 * Create a <text /> element for MTEXT entity
 */
const mtext = (entity: MTextEntity): BoundsAndElement => {
  const x = entity.x ?? 0
  const y = entity.y ?? 0
  const height = entity.nominalTextHeight ?? entity.textHeight ?? 1
  const content = entity.string ?? ''

  // Estimate text bounding box (approximate)
  const textWidth = (entity.refRectangleWidth ?? content.length * height * 0.6)
  const bbox0 = new Box2()
    .expandByPoint({ x, y })
    .expandByPoint({ x: x + textWidth, y: y + height })

  // Calculate rotation from x-axis direction
  const rotation = entity.xAxisX !== undefined && entity.xAxisY !== undefined
    ? Math.atan2(entity.xAxisY, entity.xAxisX)
    : 0
  const rotationDegrees = (rotation * 180) / Math.PI

  const element0 = `<text x="${x}" y="${y}" font-size="${height}" transform="rotate(${-rotationDegrees} ${x} ${y}) scale(1,-1) translate(0 ${-2 * y})">${content}</text>`

  const { bbox, element } = addFlipXIfApplicable(entity, {
    bbox: bbox0,
    element: element0,
  })
  return transformBoundingBoxAndElement(bbox, element, entity.transforms ?? [])
}

/**
 * Create dimension lines based on dimension type
 */
const createDimensionPaths = (entity: DimensionEntity, bbox: Box2): string[] => {
  const paths = []

  if (entity.dimensionType === 0 || entity.dimensionType === 1) {
    // Rotated/Aligned dimension
    if (entity.measureStart && entity.measureEnd) {
      const x1 = entity.measureStart.x || 0
      const y1 = entity.measureStart.y || 0
      const x2 = entity.measureEnd.x || 0
      const y2 = entity.measureEnd.y || 0

      bbox.expandByPoint({ x: x1, y: y1 })
      bbox.expandByPoint({ x: x2, y: y2 })

      paths.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`)
    }

    // Add dimension line at text position
    if (entity.start) {
      const sx = entity.start.x || 0
      const sy = entity.start.y || 0
      bbox.expandByPoint({ x: sx, y: sy })
    }
  } else if (entity.dimensionType === 3 || entity.dimensionType === 4) {
    // Diameter or Radius dimension
    if (entity.measureStart && entity.measureEnd) {
      const x1 = entity.measureStart.x || 0
      const y1 = entity.measureStart.y || 0
      const x2 = entity.measureEnd.x || 0
      const y2 = entity.measureEnd.y || 0

      bbox.expandByPoint({ x: x1, y: y1 })
      bbox.expandByPoint({ x: x2, y: y2 })

      paths.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`)
    }
  } else if (entity.dimensionType === 6) {
    // Ordinate dimension
    if (entity.measureStart && entity.start) {
      const x1 = entity.measureStart.x || 0
      const y1 = entity.measureStart.y || 0
      const x2 = entity.start.x || 0
      const y2 = entity.start.y || 0

      bbox.expandByPoint({ x: x1, y: y1 })
      bbox.expandByPoint({ x: x2, y: y2 })

      paths.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`)
    }
  }

  return paths
}

/**
 * Create dimension visualization (lines and text)
 */
const dimension = (entity: DimensionEntity): BoundsAndElement => {
  const bbox = new Box2()

  // Add text at midpoint
  if (entity.textMidpoint) {
    const tx = entity.textMidpoint.x ?? 0
    const ty = entity.textMidpoint.y ?? 0
    bbox.expandByPoint({ x: tx, y: ty })
  }

  const paths = createDimensionPaths(entity, bbox)
  const element = `<g>${paths.join('')}</g>`
  return transformBoundingBoxAndElement(bbox, element, entity.transforms ?? [])
}

export const piecewiseToPaths = (
  k: number,
  knots: number[],
  controlPoints: Array<{ x: number; y: number }>,
): string[] => {
  const paths: string[] = []
  let controlPointIndex = 0
  let knotIndex = k
  while (knotIndex < knots.length - k + 1) {
    const m = multiplicity(knots, knotIndex)
    const cp = controlPoints.slice(controlPointIndex, controlPointIndex + k)
    if (k === 4) {
      paths.push(
        `<path d="M ${cp[0].x} ${cp[0].y} C ${cp[1].x} ${cp[1].y} ${cp[2].x} ${cp[2].y} ${cp[3].x} ${cp[3].y}" />`,
      )
    } else if (k === 3) {
      paths.push(
        `<path d="M ${cp[0].x} ${cp[0].y} Q ${cp[1].x} ${cp[1].y} ${cp[2].x} ${cp[2].y}" />`,
      )
    }
    controlPointIndex += m
    knotIndex += m
  }
  return paths
}

const bezier = (entity: SplineEntity): BoundsAndElement => {
  let bbox = new Box2()
  for (const p of entity.controlPoints) {
    bbox = bbox.expandByPoint(p)
  }
  const k = entity.degree + 1
  const piecewise = toPiecewiseBezier(k, entity.controlPoints, entity.knots)
  const paths = piecewiseToPaths(k, piecewise.knots, piecewise.controlPoints)
  const element = `<g>${paths.join('')}</g>`
  return transformBoundingBoxAndElement(bbox, element, entity.transforms ?? [])
}

/**
 * Switch the appropriate function on entity type. CIRCLE, ARC and ELLIPSE
 * produce native SVG elements, the rest produce interpolated polylines.
 */
const entityToBoundsAndElement = (entity: Entity): BoundsAndElement | null => {
  switch (entity.type) {
    case 'CIRCLE':
      return circle(entity as CircleEntity)
    case 'ELLIPSE':
      return ellipse(entity as EllipseEntity)
    case 'ARC':
      return arc(entity as ArcEntity)
    case 'TEXT':
      return text(entity as TextEntity)
    case 'MTEXT':
      return mtext(entity as MTextEntity)
    case 'DIMENSION':
      return dimension(entity as DimensionEntity)
    case 'SPLINE': {
      const splineEntity = entity as SplineEntity
      const hasWeights = splineEntity.weights?.some((w: number) => w !== 1)
      if ((splineEntity.degree === 2 || splineEntity.degree === 3) && !hasWeights) {
        try {
          return bezier(splineEntity)
        } catch (err) {
          const error = err as Error
          logger.warn('bezier conversion failed, using polyline:', error.message)
          return polyline(entity)
        }
      } else {
        return polyline(entity)
      }
    }
    case 'LINE':
    case 'POLYLINE': {
      return polyline(entity)
    }
    case 'LWPOLYLINE': {
      return lwpolyline(entity)
    }
    default:
      logger.warn('entity type not supported in SVG rendering:', entity.type)
      return null
  }
}

export default function toSVG(parsed: ParsedDXF): string {
  const entities = denormalise(parsed)
  const { bbox, elements } = entities.reduce(
    (
      acc: { bbox: Box2; elements: string[] },
      entity: Entity,
    ): { bbox: Box2; elements: string[] } => {
      const rgb = getRGBForEntity(parsed.tables.layers, entity)
      const boundsAndElement = entityToBoundsAndElement(entity)
      // Ignore entities that don't produce SVG elements or have unsupported types
      if (boundsAndElement) {
        const { bbox, element } = boundsAndElement
        // Ignore invalid bounding boxes
        if (bbox.valid) {
          acc.bbox.expandByPoint(bbox.min)
          acc.bbox.expandByPoint(bbox.max)
        }
        acc.elements.push(
          `<g stroke="${rgbToColorAttribute(rgb)}">${element}</g>`,
        )
      }
      return acc
    },
    {
      bbox: new Box2(),
      elements: [],
    },
  )

  const viewBox = bbox.valid
    ? {
        x: bbox.min.x,
        y: -bbox.max.y,
        width: bbox.max.x - bbox.min.x,
        height: bbox.max.y - bbox.min.y,
      }
    : {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      }
  return `<?xml version="1.0"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
  preserveAspectRatio="xMinYMin meet"
  viewBox="${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}"
  width="100%" height="100%"
>
  <g stroke="#000000" stroke-width="0.1%" fill="none" transform="matrix(1,0,0,-1,0,0)">
    ${elements.join('\n')}
  </g>
</svg>`
}
