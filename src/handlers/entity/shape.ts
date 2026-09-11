import type { DXFTuple, PartialPoint3D } from '../../types'

import common from './common'

const TYPE = 'SHAPE'

interface ShapeEntity {
  type: typeof TYPE
  insertionPoint: PartialPoint3D
  name?: string
  size?: number
  rotation?: number
  relativeXScale?: number
  oblique?: number
  thickness?: number
  extrusionX?: number
  extrusionY?: number
  [key: string]: unknown
}

const process = (tuples: DXFTuple[]): ShapeEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 10:
          entity.insertionPoint.x = value as number
          break
        case 20:
          entity.insertionPoint.y = value as number
          break
        case 30:
          entity.insertionPoint.z = value as number
          break
        case 2:
          entity.name = String(value)
          break
        case 39:
          entity.thickness = value as number
          break
        case 40:
          entity.size = value as number
          break
        case 41:
          entity.relativeXScale = value as number
          break
        case 50:
          entity.rotation = value as number
          break
        case 51:
          entity.oblique = value as number
          break
        case 210:
          entity.extrusionX = value as number
          break
        case 220:
          entity.extrusionY = value as number
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
      insertionPoint: {},
    } as ShapeEntity,
  )
}

export default { TYPE, process }
