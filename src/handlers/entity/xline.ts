import type { DXFTuple, PartialPoint3D } from '../../types'

import common from './common'

const TYPE = 'XLINE'

interface XLineEntity {
  type: typeof TYPE
  basePoint: PartialPoint3D
  direction: PartialPoint3D
  [key: string]: unknown
}

const process = (tuples: DXFTuple[]): XLineEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 10:
          entity.basePoint.x = value as number
          break
        case 20:
          entity.basePoint.y = value as number
          break
        case 30:
          entity.basePoint.z = value as number
          break
        case 11:
          entity.direction.x = value as number
          break
        case 21:
          entity.direction.y = value as number
          break
        case 31:
          entity.direction.z = value as number
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
      basePoint: {},
      direction: {},
    } as XLineEntity,
  )
}

export default { TYPE, process }
