import { Box2 } from 'vecks'

import applyTransforms from './applyTransforms'
import denormalise from './denormalise'
import entityToPolyline from './entityToPolyline'
import colors from './util/colors'
import logger from './util/logger'

import type { Entity, ParsedDXF } from './types'
import type { Polyline, PolylineResult } from './types/polylines'

export default function toPolylines(parsed: ParsedDXF): PolylineResult {
  const entities = denormalise(parsed)
  const polylines: Polyline[] = entities.map((entity: Entity) => {
    const layer = entity.layer ?? '0'
    const layerTable = parsed.tables.layers[layer]
    let colorNumber = 0
    if ('colorNumber' in entity && typeof entity.colorNumber === 'number') {
      colorNumber = entity.colorNumber
    } else if (
      layerTable &&
      typeof layerTable.colorNumber === 'number'
    ) {
      colorNumber = layerTable.colorNumber
    }

    if (colors[colorNumber] === undefined) {
      logger.warn('Color index', colorNumber, 'invalid, defaulting to black')
      colorNumber = 0
    }

    return {
      rgb: colors[colorNumber],
      layer: layerTable,
      vertices: applyTransforms(entityToPolyline(entity), entity.transforms),
    }
  })

  const bbox = new Box2()
  for (const polyline of polylines) {
    for (const vertex of polyline.vertices) {
      bbox.expandByPoint({ x: vertex[0], y: vertex[1] })
    }
  }

  return { bbox, polylines }
}
