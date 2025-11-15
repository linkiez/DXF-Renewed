import type { Point3D } from '../../types'
import common from './common'

type DXFTuple = [number, string | number]

interface ThreeDFaceEntity {
  type: string
  vertices: Point3D[]
}

export const TYPE = '3DFACE'

export const process = (tuples: DXFTuple[]): ThreeDFaceEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 10:
          entity.vertices[0].x = value as number
          break
        case 20:
          entity.vertices[0].y = value as number
          break
        case 30:
          entity.vertices[0].z = value as number
          break
        case 11:
          entity.vertices[1].x = value as number
          break
        case 21:
          entity.vertices[1].y = value as number
          break
        case 31:
          entity.vertices[1].z = value as number
          break
        case 12:
          entity.vertices[2].x = value as number
          break
        case 22:
          entity.vertices[2].y = value as number
          break
        case 32:
          entity.vertices[2].z = value as number
          break
        case 13:
          entity.vertices[3].x = value as number
          break
        case 23:
          entity.vertices[3].y = value as number
          break
        case 33:
          entity.vertices[3].z = value as number
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
      vertices: [{} as Point3D, {} as Point3D, {} as Point3D, {} as Point3D],
    } as ThreeDFaceEntity,
  )
}

export default { TYPE, process }
