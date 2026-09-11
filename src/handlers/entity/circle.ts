import type { DXFTuple } from '../../types/dxf'

import common from './common'
import { assignPointCoordinate } from './point-fields'

const TYPE = 'CIRCLE'


interface CircleEntity {
  type: typeof TYPE
  x?: number
  y?: number
  z?: number
  r?: number
  [key: string]: unknown
}

const process = (tuples: DXFTuple[]): CircleEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      if (assignPointCoordinate(entity, type, value)) return entity
      if (type === 40) {
        entity.r = value as number
      } else {
        Object.assign(entity, common(type, value))
      }
      return entity
    },
    {
      type: TYPE,
    } as CircleEntity,
  )
}

export default { TYPE, process }
