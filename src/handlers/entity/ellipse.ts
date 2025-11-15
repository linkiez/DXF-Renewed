import common from './common'

import type { EllipseEntity } from '../../types'

export const TYPE = 'ELLIPSE'

type DXFTuple = [number, string | number]

export const process = (tuples: DXFTuple[]): EllipseEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 10:
          entity.x = value as number
          break
        case 11:
          entity.majorX = value as number
          break
        case 20:
          entity.y = value as number
          break
        case 21:
          entity.majorY = value as number
          break
        case 30:
          entity.z = value as number
          break
        case 31:
          entity.majorZ = value as number
          break
        case 40:
          entity.axisRatio = value as number
          break
        case 41:
          entity.startAngle = value as number
          break
        case 42:
          entity.endAngle = value as number
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
    } as EllipseEntity,
  )
}

export default { TYPE, process }
