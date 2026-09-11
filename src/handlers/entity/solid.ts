import type { DXFTuple } from '../../types/dxf'

import type { Point3D } from '../../types'
import common from './common'
import { assignCornerCoordinate } from './corner-fields'


interface SolidEntity {
  type: string
  corners: Point3D[]
  thickness?: number
}

const TYPE = 'SOLID'

const process = (tuples: DXFTuple[]): SolidEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      if (assignCornerCoordinate(entity.corners, type, value)) return entity
      if (type === 39) {
          entity.thickness = value as number
      } else {
        Object.assign(entity, common(type, value))
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
