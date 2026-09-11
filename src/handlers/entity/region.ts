import type { DXFTuple } from '../../types'

import common from './common'

const TYPE = 'REGION'

interface RegionEntity {
  type: typeof TYPE

  acisData?: string[]

  [key: string]: unknown
}

const process = (tuples: DXFTuple[]): RegionEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const code = tuple[0]
      const value = tuple[1]

      switch (code) {
        // ACIS data text (first line: 1, additional lines: 3)
        case 1:
        case 3:
          entity.acisData ??= []
          entity.acisData.push(String(value))
          break

        default:
          Object.assign(entity, common(code, value))
          break
      }

      return entity
    },
    {
      type: TYPE,
    } as RegionEntity,
  )
}

export default { TYPE, process }
