import type { DXFTuple } from '../../types'

import common from './common'

const TYPE = 'DWFUNDERLAY'

interface UnderlayEntity {
  type: typeof TYPE

  insertionPoint: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  normal: { x: number; y: number; z: number }

  underlayDefinitionHandle?: string
  rotation?: number
  flags?: number
  contrast?: number
  fade?: number

  [key: string]: unknown
}

const process = (tuples: DXFTuple[]): UnderlayEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]

      switch (type) {
        case 340:
          entity.underlayDefinitionHandle = String(value)
          break

        case 10:
          entity.insertionPoint.x = value as number
          break
        case 20:
          entity.insertionPoint.y = value as number
          break
        case 30:
          entity.insertionPoint.z = value as number
          break

        case 41:
          entity.scale.x = value as number
          break
        case 42:
          entity.scale.y = value as number
          break
        case 43:
          entity.scale.z = value as number
          break

        case 50:
          entity.rotation = value as number
          break

        case 210:
          entity.normal.x = value as number
          break
        case 220:
          entity.normal.y = value as number
          break
        case 230:
          entity.normal.z = value as number
          break

        case 280:
          entity.flags = value as number
          break
        case 281:
          entity.contrast = value as number
          break
        case 282:
          entity.fade = value as number
          break

        default:
          Object.assign(entity, common(type, value))
          break
      }

      return entity
    },
    {
      type: TYPE,
      insertionPoint: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      normal: { x: 0, y: 0, z: 1 },
    } as UnderlayEntity,
  )
}

export default { TYPE, process }
