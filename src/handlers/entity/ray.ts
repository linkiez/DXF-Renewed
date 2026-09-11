import type { DXFTuple, PartialPoint3D } from '../../types'

import common from './common'
import { assignSegmentCoordinate } from './segment-fields'

const TYPE = 'RAY'

interface RayEntity {
  type: typeof TYPE
  start: PartialPoint3D
  direction: PartialPoint3D
  [key: string]: unknown
}

const process = (tuples: DXFTuple[]): RayEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      if (!assignSegmentCoordinate(entity.start, entity.direction, type, value)) {
        Object.assign(entity, common(type, value))
      }
      return entity
    },
    {
      type: TYPE,
      start: {},
      direction: {},
    } as RayEntity,
  )
}

export default { TYPE, process }
