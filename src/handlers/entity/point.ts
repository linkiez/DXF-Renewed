import type { DXFTuple } from '../../types/dxf'

import common from './common'
import { assignPointCoordinate } from './point-fields'

const TYPE = 'POINT'


interface PointEntity {
  type: typeof TYPE
  x?: number
  y?: number
  z?: number
  thickness?: number
  [key: string]: unknown
}

const process = (tuples: DXFTuple[]): PointEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      if (assignPointCoordinate(entity, type, value)) return entity
      if (type === 39) {
        entity.thickness = value as number
      } else {
        Object.assign(entity, common(type, value))
      }
      return entity
    },
    {
      type: TYPE,
    } as PointEntity,
  )
}

export default { TYPE, process }
