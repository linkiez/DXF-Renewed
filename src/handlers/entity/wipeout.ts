import type { DXFTuple, PartialPoint3D } from '../../types'

import common from './common'

const TYPE = 'WIPEOUT'

interface WipeoutEntity {
  type: typeof TYPE

  insertionPoint: PartialPoint3D
  uVector: PartialPoint3D
  vVector: PartialPoint3D

  clipBoundaryType?: 1 | 2
  clipBoundaryVertices?: Array<{ x: number; y: number }>

  displayProperties?: number
  clippingState?: 0 | 1
  classVersion?: number
  imageSizePixels?: { u: number; v: number }

  [key: string]: unknown
}

const process = (tuples: DXFTuple[]): WipeoutEntity => {
  let pendingBoundaryX: number | null = null

  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]

      switch (type) {
        case 90:
          entity.classVersion = value as number
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

        case 11:
          entity.uVector.x = value as number
          break
        case 21:
          entity.uVector.y = value as number
          break
        case 31:
          entity.uVector.z = value as number
          break

        case 12:
          entity.vVector.x = value as number
          break
        case 22:
          entity.vVector.y = value as number
          break
        case 32:
          entity.vVector.z = value as number
          break

        case 13:
          entity.imageSizePixels ??= { u: 0, v: 0 }
          entity.imageSizePixels.u = value as number
          break
        case 23:
          entity.imageSizePixels ??= { u: 0, v: 0 }
          entity.imageSizePixels.v = value as number
          break

        case 70:
          entity.displayProperties = value as number
          break
        case 280:
          entity.clippingState = value as 0 | 1
          break

        case 71:
          entity.clipBoundaryType = value as 1 | 2
          break

        case 14:
          pendingBoundaryX = value as number
          break
        case 24:
          if (pendingBoundaryX !== null) {
            entity.clipBoundaryVertices ??= []
            entity.clipBoundaryVertices.push({ x: pendingBoundaryX, y: value as number })
            pendingBoundaryX = null
          }
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
    } as WipeoutEntity,
  )
}

export default { TYPE, process }
