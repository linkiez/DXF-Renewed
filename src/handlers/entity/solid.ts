import type { Point3D } from '../../types'
import common from './common'

type DXFTuple = [number, string | number]

interface SolidEntity {
  type: string
  corners: Point3D[]
  thickness?: number
}

export const TYPE = 'SOLID'

export const process = (tuples: DXFTuple[]): SolidEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 10:
          entity.corners[0].x = value as number
          break
        case 20:
          entity.corners[0].y = value as number
          break
        case 30:
          entity.corners[0].z = value as number
          break
        case 11:
          entity.corners[1].x = value as number
          break
        case 21:
          entity.corners[1].y = value as number
          break
        case 31:
          entity.corners[1].z = value as number
          break
        case 12:
          entity.corners[2].x = value as number
          break
        case 22:
          entity.corners[2].y = value as number
          break
        case 32:
          entity.corners[2].z = value as number
          break
        case 13:
          entity.corners[3].x = value as number
          break
        case 23:
          entity.corners[3].y = value as number
          break
        case 33:
          entity.corners[3].z = value as number
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
      corners: [{} as Point3D, {} as Point3D, {} as Point3D, {} as Point3D],
    } as SolidEntity,
  )
}

export default { TYPE, process }
