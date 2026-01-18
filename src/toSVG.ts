import { Box2 } from 'vecks'

import denormalise from './denormalise'
import dimensionToSVG, { getDimensionGeometryBBox } from './dimensionToSVG'
import entityToPolyline from './entityToPolyline'
import getRGBForEntity from './getRGBForEntity'
import escapeXmlText from './util/escapeXmlText'
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
  LeaderEntity,
  MTextEntity,
  ParsedDXF,
  ShapeEntity,
  SplineEntity,
  TextEntity,
  ToleranceEntity,
  ToSVGOptions,
} from './types'
import type { BoundsAndElement } from './types/svg'

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
  const vertices = entityToPolyline(entity as any)
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
  const vertices = entityToPolyline(entity as any)
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

const leader = (entity: LeaderEntity): BoundsAndElement | null => {
  if (!entity.vertices || entity.vertices.length < 2) return null

  const bbox0 = entity.vertices.reduce(
    (acc, p) => acc.expandByPoint({ x: p.x, y: p.y }),
    new Box2(),
  )
  const d = entity.vertices.reduce((acc, p, i) => {
    acc += i === 0 ? 'M' : 'L'
    acc += p.x + ',' + p.y
    return acc
  }, '')

  return transformBoundingBoxAndElement(
    bbox0,
    `<path d="${d}" />`,
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

interface EllipticArcParams {
  cx: number
  cy: number
  majorX: number
  majorY: number
  axisRatio: number
  startAngle: number
  endAngle: number
  flipX?: boolean
}

/**
 * Create a a <path d="A..." /> or <ellipse /> element for the ARC or ELLIPSE
 * DXF entity (<ellipse /> if start and end point are the same).
 */
const ellipseOrArc = (params: EllipticArcParams): BoundsAndElement => {
  const { cx, cy, majorX, majorY, axisRatio, startAngle, endAngle } = params
  const rx = Math.hypot(majorX, majorY)
  const ry = axisRatio * rx
  const rotationAngle = -Math.atan2(-majorY, majorX)

  const bbox = bboxEllipseOrArc(params)

  if (
    Math.abs(startAngle - endAngle) < 1e-9 ||
    Math.abs(startAngle - endAngle + Math.PI * 2) < 1e-9
  ) {
    // Use a native <ellipse> when start and end angles are the same, and
    // arc paths with same start and end points don't render (at least on Safari)
    const element = `<g transform="rotate(${(rotationAngle / Math.PI) * 180
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
    const d = `M ${startPoint.x} ${startPoint.y} A ${rx} ${ry} ${(rotationAngle / Math.PI) * 180
      } ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`
    const element = `<path d="${d}" />`
    return { bbox, element }
  }
}

/**
 * Compute the bounding box of an elliptical arc, given the DXF entity parameters
 */

const bboxEllipseOrArc = (params: EllipticArcParams): Box2 => {
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
  angles.push(startAngle, endAngle)

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
  const { bbox: bbox0, element: element0 } = ellipseOrArc({
    cx: entity.x,
    cy: entity.y,
    majorX: entity.majorX,
    majorY: entity.majorY,
    axisRatio: entity.axisRatio,
    startAngle: entity.startAngle,
    endAngle: entity.endAngle,
  })
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
  const { bbox: bbox0, element: element0 } = ellipseOrArc({
    cx: entity.x,
    cy: entity.y,
    majorX: entity.r,
    majorY: 0,
    axisRatio: 1,
    startAngle: entity.startAngle,
    endAngle: entity.endAngle,
    flipX: entity.extrusionZ === -1,
  })
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
  const element0 = `<text x="${x}" y="${y}" font-size="${height}" transform="rotate(${-rotationDegrees} ${x} ${y}) scale(1,-1) translate(0 ${-2 * y})">${escapeXmlText(content)}</text>`

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
  const element0 = `<text x="${x}" y="${y}" font-size="${height}" transform="rotate(${-rotationDegrees} ${x} ${y}) scale(1,-1) translate(0 ${-2 * y})">${escapeXmlText(content)}</text>`

  const { bbox, element } = addFlipXIfApplicable(entity, {
    bbox: bbox0,
    element: element0,
  })
  return transformBoundingBoxAndElement(bbox, element, entity.transforms ?? [])
}

/**
 * Minimal <text /> fallback for TOLERANCE entities.
 * DXF uses special control codes; we preserve the raw string.
 */
const tolerance = (entity: ToleranceEntity): BoundsAndElement => {
  const x = entity.insertionPoint?.x ?? 0
  const y = entity.insertionPoint?.y ?? 0
  const height = 1
  const content = entity.text ?? ''

  const rotation = entity.xAxisDirection
    ? Math.atan2(entity.xAxisDirection.y, entity.xAxisDirection.x)
    : 0
  const rotationDegrees = (rotation * 180) / Math.PI

  const textWidth = content.length * height * 0.6
  const bbox0 = new Box2()
    .expandByPoint({ x, y })
    .expandByPoint({ x: x + textWidth, y: y + height })

  const element0 = `<text x="${x}" y="${y}" font-size="${height}" transform="rotate(${-rotationDegrees} ${x} ${y}) scale(1,-1) translate(0 ${-2 * y})">${escapeXmlText(content)}</text>`

  const { bbox, element } = addFlipXIfApplicable(entity, {
    bbox: bbox0,
    element: element0,
  })
  return transformBoundingBoxAndElement(bbox, element, entity.transforms ?? [])
}

/**
 * Minimal <text /> fallback for SHAPE entities.
 * Rendering SHX-based shapes is out of scope; we render the name as text.
 */
const shape = (entity: ShapeEntity): BoundsAndElement => {
  const x = entity.insertionPoint?.x ?? 0
  const y = entity.insertionPoint?.y ?? 0
  const height = entity.size ?? 1
  const rotation = entity.rotation ?? 0
  const content = entity.name ?? ''

  const textWidth = content.length * height * 0.6
  const bbox0 = new Box2()
    .expandByPoint({ x, y })
    .expandByPoint({ x: x + textWidth, y: y + height })

  const rotationDegrees = (rotation * 180) / Math.PI
  const element0 = `<text x="${x}" y="${y}" font-size="${height}" transform="rotate(${-rotationDegrees} ${x} ${y}) scale(1,-1) translate(0 ${-2 * y})">${escapeXmlText(content)}</text>`

  const { bbox, element } = addFlipXIfApplicable(entity, {
    bbox: bbox0,
    element: element0,
  })
  return transformBoundingBoxAndElement(bbox, element, entity.transforms ?? [])
}

/**
 * Create dimension visualization with DIMSTYLE support
 */
const dimension = (
  entity: DimensionEntity,
  dimStyle?: any,
  options?: ToSVGOptions,
  viewport?: { width: number; height: number },
): BoundsAndElement => {
  const result = dimensionToSVG(entity, dimStyle, options, viewport)
  return transformBoundingBoxAndElement(
    result.bbox,
    result.element,
    entity.transforms ?? [],
  )
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
const entityToBoundsAndElement = (
  entity: Entity,
  dimStyles?: { [name: string]: any },
  options?: ToSVGOptions,
  viewport?: { width: number; height: number },
): BoundsAndElement | null => {
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
    case 'DIMENSION': {
      const dimEntity = entity as DimensionEntity
      const styleName = typeof dimEntity.styleName === 'string'
        ? dimEntity.styleName
        : undefined
      const dimStyle = styleName && dimStyles
        ? dimStyles[styleName]
        : undefined
      return dimension(dimEntity, dimStyle, options, viewport)
    }
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
    case 'RAY':
    case 'XLINE':
    case 'POLYLINE': {
      return polyline(entity)
    }
    case 'SOLID':
    case 'TRACE': {
      return polyline(entity)
    }
    case 'LWPOLYLINE': {
      return lwpolyline(entity)
    }
    case 'WIPEOUT': {
      return polyline(entity)
    }
    case 'LEADER': {
      return leader(entity as LeaderEntity)
    }
    case 'TOLERANCE': {
      return tolerance(entity as ToleranceEntity)
    }
    case 'SHAPE': {
      return shape(entity as ShapeEntity)
    }
    default:
      logger.warn('entity type not supported in SVG rendering:', entity.type)
      return null
  }
}

export default function toSVG(parsed: ParsedDXF, options: ToSVGOptions = {}): string {
  const entities = denormalise(parsed)
  const dimStyles = parsed.tables.dimStyles

  const geometryBBox = entities.reduce((acc: Box2, entity: Entity): Box2 => {
    if (entity.type === 'DIMENSION') {
      const bbox = getDimensionGeometryBBox(entity as DimensionEntity)
      if (bbox.valid) {
        acc.expandByPoint(bbox.min)
        acc.expandByPoint(bbox.max)
      }
      return acc
    }

    const boundsAndElement = entityToBoundsAndElement(entity, dimStyles, options)
    if (boundsAndElement?.bbox.valid) {
      acc.expandByPoint(boundsAndElement.bbox.min)
      acc.expandByPoint(boundsAndElement.bbox.max)
    }
    return acc
  }, new Box2())

  const viewport = geometryBBox.valid
    ? {
      width: geometryBBox.max.x - geometryBBox.min.x,
      height: geometryBBox.max.y - geometryBBox.min.y,
    }
    : {
      width: 0,
      height: 0,
    }

  const { bbox, elements } = entities.reduce(
    (
      acc: { bbox: Box2; elements: string[] },
      entity: Entity,
    ): { bbox: Box2; elements: string[] } => {
      const rgb = getRGBForEntity(parsed.tables.layers, entity)
      const boundsAndElement = entityToBoundsAndElement(entity, dimStyles, options, viewport)
      // Ignore entities that don't produce SVG elements or have unsupported types
      if (boundsAndElement) {
        const { bbox, element } = boundsAndElement
        // Ignore invalid bounding boxes
        if (bbox.valid) {
          acc.bbox.expandByPoint(bbox.min)
          acc.bbox.expandByPoint(bbox.max)
        }
        const color = rgbToColorAttribute(rgb)
        const handleAttr = options?.includeHandles ? ` data-handle="${entity.handle}" data-entity-type="${entity.type}" data-entity-type="${entity.layer}" ` : ''
        if (entity.type === 'SOLID' || entity.type === 'TRACE') {
          acc.elements.push(`<g fill="${color}" stroke="none" ${handleAttr}>${element}</g>`)
        } else {
          acc.elements.push(`<g stroke="${color}" ${handleAttr}>${element}</g>`)
        }
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
