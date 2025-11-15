import common from './common'

import type { InsertEntity } from '../../types'

export const TYPE = 'INSERT'

type DXFTuple = [number, string | number]

export const process = (tuples: DXFTuple[]): InsertEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 2:
          entity.block = value as string
          break
        case 10:
          entity.x = value as number
          break
        case 20:
          entity.y = value as number
          break
        case 30:
          entity.z = value as number
          break
        case 41:
          entity.scaleX = value as number
          break
        case 42:
          entity.scaleY = value as number
          break
        case 43:
          entity.scaleZ = value as number
          break
        case 44:
          entity.columnSpacing = value as number
          break
        case 45:
          entity.rowSpacing = value as number
          break
        case 50:
          entity.rotation = value as number
          break
        case 70:
          entity.columnCount = value as number
          break
        case 71:
          entity.rowCount = value as number
          break
        case 210:
          entity.extrusionX = value as number
          break
        case 220:
          entity.extrusionY = value as number
          break
        case 230:
          entity.extrusionZ = value as number
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
    } as InsertEntity,
  )
}

export default { TYPE, process }
