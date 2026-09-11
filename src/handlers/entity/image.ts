import type { DXFTuple, PartialPoint3D } from '../../types'

import common from './common'
import { parse3DPoint } from './entityHandlerUtils'

const TYPE = 'IMAGE'

interface ImageEntity {
  type: typeof TYPE

  insertionPoint: PartialPoint3D
  uVector: PartialPoint3D
  vVector: PartialPoint3D

  pixelSizeX: number
  pixelSizeY: number

  imageDefHandle?: string
  imageDefReactorHandle?: string

  displayProperties?: number
  clippingState?: number
  brightness?: number
  contrast?: number
  fade?: number
  classVersion?: number

  [key: string]: unknown
}

const process = (tuples: DXFTuple[]): ImageEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]

      // Try 3D point parsing first
      if (
        parse3DPoint(type, value, entity, 'insertionPoint') ||
        parse3DPoint(type, value, entity, 'uVector') ||
        parse3DPoint(type, value, entity, 'vVector')
      ) {
        return entity
      }

      switch (type) {
        case 90:
          entity.classVersion = value as number
          break

        case 13:
          entity.pixelSizeX = value as number
          break
        case 23:
          entity.pixelSizeY = value as number
          break

        case 340:
          entity.imageDefHandle = String(value)
          break
        case 360:
          entity.imageDefReactorHandle = String(value)
          break

        case 70:
          entity.displayProperties = value as number
          break
        case 280:
          entity.clippingState = value as number
          break
        case 281:
          entity.brightness = value as number
          break
        case 282:
          entity.contrast = value as number
          break
        case 283:
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
      insertionPoint: {},
      uVector: {},
      vVector: {},
      pixelSizeX: 0,
      pixelSizeY: 0,
    } as ImageEntity,
  )
}

export default { TYPE, process }
