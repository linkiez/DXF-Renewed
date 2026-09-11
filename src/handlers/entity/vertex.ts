import type { DXFTuple } from '../../types/dxf'

import type { Vertex } from '../../types'
import { assignPointCoordinate } from './point-fields'

const TYPE = 'VERTEX'


const ensureFaces = (entity: Vertex): void => {
  entity.faces = entity.faces || []
  if ('x' in entity && !entity.x) delete entity.x
  if ('y' in entity && !entity.y) delete entity.y
  if ('z' in entity && !entity.z) delete entity.z
}

const process = (tuples: DXFTuple[]): Vertex => {
  return tuples.reduce((entity, tuple) => {
    const type = tuple[0]
    const value = tuple[1]
    if (assignPointCoordinate(entity, type, value)) return entity
    switch (type) {
      case 42:
        entity.bulge = value as number
        break
      case 71:
        ensureFaces(entity)
        entity.faces![0] = value as number
        break
      case 72:
        ensureFaces(entity)
        entity.faces![1] = value as number
        break
      case 73:
        ensureFaces(entity)
        entity.faces![2] = value as number
        break
      case 74:
        ensureFaces(entity)
        entity.faces![3] = value as number
        break
      default:
        break
    }
    return entity
  }, {} as Vertex)
}

export default { TYPE, process }
