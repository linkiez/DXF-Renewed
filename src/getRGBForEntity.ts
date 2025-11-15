import colors from './util/colors'
import logger from './util/logger'

import type { Entity } from './types'
import type { ColorRGB } from './util/colors'

interface Layer {
  colorNumber?: number
  [key: string]: unknown
}

interface LayerTable {
  [layerName: string]: Layer
}

export default function getRGBForEntity(
  layers: LayerTable,
  entity: Entity,
): ColorRGB {
  const layerTable = layers[entity.layer ?? '0']
  if (layerTable) {
    const colorDefinedInEntity =
      'colorNumber' in entity && entity.colorNumber !== 256
    const colorNumber = colorDefinedInEntity
      ? entity.colorNumber
      : layerTable.colorNumber
    const rgb = colors[colorNumber ?? 0]
    if (rgb) {
      return rgb
    } else {
      logger.warn('Color index', colorNumber, 'invalid, defaulting to black')
      return [0, 0, 0]
    }
  } else {
    logger.warn('no layer table for layer:' + entity.layer)
    return [0, 0, 0]
  }
}
