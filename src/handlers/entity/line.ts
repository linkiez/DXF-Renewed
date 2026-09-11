import type { DXFTuple, PartialPoint3D } from '../../types'

import common from './common'
import { assignSegmentCoordinate } from './segment-fields'

const TYPE = 'LINE'

interface LineEntity {
  type: typeof TYPE
  start: PartialPoint3D
  end: PartialPoint3D
  thickness?: number
  [key: string]: unknown
}

const process = (tuples: DXFTuple[]): LineEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      if (assignSegmentCoordinate(entity.start, entity.end, type, value)) return entity
      if (type === 39) {
          entity.thickness = value as number
      } else {
        Object.assign(entity, common(type, value))
      }
      return entity
    },
    {
      type: TYPE,
      start: {},
      end: {},
    } as LineEntity,
  )
}

export default { TYPE, process }
