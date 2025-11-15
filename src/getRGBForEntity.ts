import colors from './util/colors'
import logger from './util/logger'

import type { ColorRGB, Entity, LayerTable } from './types'

export default function getRGBForEntity(
  layers: { [layerName: string]: LayerTable },
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
