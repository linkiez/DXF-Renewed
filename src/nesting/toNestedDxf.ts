/**
 * Nested DXF Output
 *
 * Generates a new DXF file with repositioned entities
 * based on nesting results.
 */

import cloneDeep from 'lodash/cloneDeep'

import type { Entity, ParsedDXF } from '../types'
import type { NestingResult } from './types'

/** Generate DXF tuple pairs for an entity */
function entityToDxfTuples(entity: Entity): string[] {
  const tuples: string[] = []

  tuples.push('0', entity.type)

  if (entity.handle) {
    tuples.push('5', entity.handle)
  }

  if (entity.layer) {
    tuples.push('8', entity.layer)
  }

  if (entity.colorNumber !== undefined) {
    tuples.push('62', String(entity.colorNumber))
  }

  switch (entity.type) {
    case 'LINE': {
      const line = entity as Entity & {
        start?: { x?: number; y?: number }
        end?: { x?: number; y?: number }
      }
      tuples.push(
        '10',
        String(line.start?.x ?? 0),
        '20',
        String(line.start?.y ?? 0),
        '11',
        String(line.end?.x ?? 0),
        '21',
        String(line.end?.y ?? 0),
      )
      break
    }

    case 'CIRCLE': {
      const circle = entity as Entity & { x?: number; y?: number; r?: number }
      tuples.push(
        '10',
        String(circle.x ?? 0),
        '20',
        String(circle.y ?? 0),
        '40',
        String(circle.r ?? 0),
      )
      break
    }

    case 'LWPOLYLINE':
    case 'POLYLINE': {
      const poly = entity as Entity & {
        vertices?: Array<{ x?: number; y?: number; z?: number }>
        closed?: boolean
      }
      tuples.push('90', String(poly.vertices?.length ?? 0))
      if (poly.closed) {
        tuples.push('70', '1')
      }
      for (const vertex of poly.vertices ?? []) {
        tuples.push('10', String(vertex.x ?? 0), '20', String(vertex.y ?? 0))
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

/**
 * Generate a new DXF with repositioned entities based on nesting results.
 */
export function toNestedDxf(
  _originalParsed: ParsedDXF,
  result: NestingResult,
  shapeEntityMap: Map<string, Entity>,
): string {
  const nestedEntities: Entity[] = []

  for (const placement of result.placements) {
    const originalEntity = shapeEntityMap.get(placement.shapeId)
    if (!originalEntity) continue
    nestedEntities.push(cloneDeep(originalEntity))
  }

  for (const sheet of result.sheets) {
    nestedEntities.push({
      type: 'LWPOLYLINE',
      layer: 'NESTING_SHEET',
      colorNumber: 256,
      vertices: [
        { x: 0, y: 0 },
        { x: sheet.width, y: 0 },
        { x: sheet.width, y: sheet.height },
        { x: 0, y: sheet.height },
      ],
      closed: true,
    } as Entity)
  }

  return entitiesToDxfString(nestedEntities)
}
