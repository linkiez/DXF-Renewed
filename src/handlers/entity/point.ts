import type { DXFTuple } from '../../types/dxf'

import common from './common'

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
      switch (type) {
        case 10:
          entity.x = value as number
          break
        case 20:
          entity.y = value as number
          break
        case 30:
          entity.z = value as number
          break
        case 39:
          entity.thickness = value as number
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
    } as PointEntity,
  )
}

export default { TYPE, process }
