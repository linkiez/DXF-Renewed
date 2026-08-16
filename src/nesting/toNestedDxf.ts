/**
 * Nested DXF Output
 *
 * Generates a new DXF file with repositioned entities
 * based on nesting results.
 */

import type { Entity, ParsedDXF, Point3D } from '../types'
import type { NestingResult, NestableShape, Placement, Point2D } from './types'
import { rotatePoint, degToRad } from './polygonUtils'
import cloneDeep from 'lodash/cloneDeep'

// ─────────────────────────────────────────────
// Entity Transformation
// ─────────────────────────────────────────────

/**
 * Apply nesting transform to an entity.
 * Translates and rotates the entity to its placement position.
 */
function applyNestingTransform(
  entity: Entity,
  placement: Placement,
  shape: NestableShape
): Entity {
  const cloned = cloneDeep(entity)
  const centroid = shape.centroid
  const angleRad = degToRad(placement.rotation)

  // Compute offset from centroid to placement position
  const offsetX = placement.x - centroid.x
  const offsetY = placement.y - centroid.y

  // Apply transform based on entity type
  switch (entity.type) {
    case 'LINE': {
      const line = entity as any
      if (line.start) {
        const rotated = rotatePoint(
          { x: line.start.x, y: line.start.y },
          centroid,
          placement.rotation
        )
        line.start.x = rotated.x + offsetX
        line.start.y = rotated.y + offsetY
      }
      if (line.end) {
        const rotated = rotatePoint(
          { x: line.end.x, y: line.end.y },
          centroid,
          placement.rotation
        )
        line.end.x = rotated.x + offsetX
        line.end.y = rotated.y + offsetY
      }
      break
    }

    case 'LWPOLYLINE':
    case 'POLYLINE': {
      const poly = entity as any
      if (poly.vertices) {
        for (const vertex of poly.vertices) {
          if (vertex.x !== undefined && vertex.y !== undefined) {
            const rotated = rotatePoint(
              { x: vertex.x, y: vertex.y },
              centroid,
              placement.rotation
            )
            vertex.x = rotated.x + offsetX
            vertex.y = rotated.y + offsetY
          }
        }
      }
      break
    }

    case 'CIRCLE': {
      const circle = entity as any
      const rotated = rotatePoint(
        { x: circle.x, y: circle.y },
        centroid,
        placement.rotation
      )
      circle.x = rotated.x + offsetX
      circle.y = rotated.y + offsetY
      break
    }

    case 'ELLIPSE': {
      const ellipse = entity as any
      const rotated = rotatePoint(
        { x: ellipse.x, y: ellipse.y },
        centroid,
        placement.rotation
      )
      ellipse.x = rotated.x + offsetX
      ellipse.y = rotated.y + offsetY

      // Rotate major axis
      if (ellipse.majorX !== undefined && ellipse.majorY !== undefined) {
        const cos = Math.cos(angleRad)
        const sin = Math.sin(angleRad)
        const mx = ellipse.majorX
        const my = ellipse.majorY
        ellipse.majorX = mx * cos - my * sin
        ellipse.majorY = mx * sin + my * cos
      }
      break
    }

    case 'ARC': {
      const arc = entity as any
      const rotated = rotatePoint(
        { x: arc.x, y: arc.y },
        centroid,
        placement.rotation
      )
      arc.x = rotated.x + offsetX
      arc.y = rotated.y + offsetY
      if (arc.startAngle !== undefined) arc.startAngle += placement.rotation
      if (arc.endAngle !== undefined) arc.endAngle += placement.rotation
      break
    }

    case 'SOLID':
    case '3DFACE': {
      const solid = entity as any
      if (solid.points) {
        for (const point of solid.points) {
          const rotated = rotatePoint(
            { x: point.x, y: point.y },
            centroid,
            placement.rotation
          )
          point.x = rotated.x + offsetX
          point.y = rotated.y + offsetY
        }
      }
      break
    }

    case 'TRACE': {
      const trace = entity as any
      if (trace.corners) {
        for (const corner of trace.corners) {
          const rotated = rotatePoint(
            { x: corner.x, y: corner.y },
            centroid,
            placement.rotation
          )
          corner.x = rotated.x + offsetX
          corner.y = rotated.y + offsetY
        }
      }
      break
    }

    case 'SPLINE': {
      const spline = entity as any
      if (spline.controlPoints) {
        for (const cp of spline.controlPoints) {
          const rotated = rotatePoint(
            { x: cp.x, y: cp.y },
            centroid,
            placement.rotation
          )
          cp.x = rotated.x + offsetX
          cp.y = rotated.y + offsetY
        }
      }
      break
    }

    case 'TEXT':
    case 'MTEXT': {
      const text = entity as any
      if (text.x !== undefined && text.y !== undefined) {
        const rotated = rotatePoint(
          { x: text.x, y: text.y },
          centroid,
          placement.rotation
        )
        text.x = rotated.x + offsetX
        text.y = rotated.y + offsetY
      }
      break
    }

    default:
      // For unknown types, try to rotate/translate x, y if present
      if ('x' in entity && 'y' in entity) {
        const pos = entity as any
        const rotated = rotatePoint(
          { x: pos.x, y: pos.y },
          centroid,
          placement.rotation
        )
        pos.x = rotated.x + offsetX
        pos.y = rotated.y + offsetY
      }
      break
  }

  return cloned
}

// ─────────────────────────────────────────────
// DXF String Generation
// ─────────────────────

/** Generate DXF tuple pairs for an entity */
function entityToDxfTuples(entity: Entity): string[] {
  const tuples: string[] = []

  // Entity type
  tuples.push('0', entity.type)

  // Handle (if present)
  if (entity.handle) {
    tuples.push('5', entity.handle)
  }

  // Layer
  if (entity.layer) {
    tuples.push('8', entity.layer)
  }

  // Color
  if (entity.colorNumber !== undefined) {
    tuples.push('62', String(entity.colorNumber))
  }

  // Type-specific tuples
  switch (entity.type) {
    case 'LINE': {
      const line = entity as any
      tuples.push('10', String(line.start?.x ?? 0))
      tuples.push('20', String(line.start?.y ?? 0))
      tuples.push('11', String(line.end?.x ?? 0))
      tuples.push('21', String(line.end?.y ?? 0))
      break
    }

    case 'CIRCLE': {
      const circle = entity as any
      tuples.push('10', String(circle.x ?? 0))
      tuples.push('20', String(circle.y ?? 0))
      tuples.push('40', String(circle.r ?? 0))
      break
    }

    case 'LWPOLYLINE':
    case 'POLYLINE': {
      const poly = entity as any
      tuples.push('90', String(poly.vertices?.length ?? 0))
      if (poly.closed) {
        tuples.push('70', '1')
      }
      for (const vertex of poly.vertices ?? []) {
        tuples.push('10', String(vertex.x ?? 0))
        tuples.push('20', String(vertex.y ?? 0))
        if (vertex.z !== undefined) {
          tuples.push('30', String(vertex.z))
        }
      }
      break
    }
  }

  return tuples
}

/** Generate DXF string from entities */
function entitiesToDxfString(entities: Entity[]): string {
  let dxf = '0\nSECTION\n2\nENTITIES\n'

  for (const entity of entities) {
    const tuples = entityToDxfTuples(entity)
    for (const tuple of tuples) {
      dxf += tuple + '\n'
    }
  }

  dxf += '0\nENDSEC\n0\nEOF\n'
  return dxf
}

// ─────────────────────────────────────────────
// Main DXF Generation
// ─────────────────────────────────────────────

/**
 * Generate a new DXF with repositioned entities based on nesting results.
 *
 * @param originalParsed - Original parsed DXF
 * @param result - Nesting result
 * @param shapeMap - Map of shape IDs to original entities
 * @returns New DXF string
 */
export function toNestedDxf(
  originalParsed: ParsedDXF,
  result: NestingResult,
  shapeEntityMap: Map<string, Entity>
): string {
  const nestedEntities: Entity[] = []

  // Transform placed entities
  for (const placement of result.placements) {
    const originalEntity = shapeEntityMap.get(placement.shapeId)
    if (!originalEntity) continue

    // We need the shape data for centroid - approximate from entity
    // In a full implementation, this would come from the shape extraction
    const transformed = cloneDeep(originalEntity)
    nestedEntities.push(transformed)
  }

  // Add sheet outline as a POLYLINE
  for (const sheet of result.sheets) {
    const outlineEntity: Entity = {
      type: 'LWPOLYLINE',
      layer: 'NESTING_SHEET',
      colorNumber: 256, // By layer
      vertices: [
        { x: 0, y: 0 },
        { x: sheet.width, y: 0 },
        { x: sheet.width, y: sheet.height },
        { x: 0, y: sheet.height },
      ],
      closed: true,
    } as any
    nestedEntities.push(outlineEntity)
  }

  return entitiesToDxfString(nestedEntities)
}
