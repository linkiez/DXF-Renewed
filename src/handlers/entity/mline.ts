import type { DXFTuple, PartialPoint3D } from '../../types'

import common from './common'

const TYPE = 'MLINE'

interface MLineEntity {
  type: typeof TYPE

  startPoint?: PartialPoint3D
  endPoint?: PartialPoint3D

  vertexCount?: number
  styleName?: string

  [key: string]: unknown
}

function ensurePoint3(entity: MLineEntity, key: 'startPoint' | 'endPoint'): PartialPoint3D {
  entity[key] ??= {}
  return entity[key]
}

const process = (tuples: DXFTuple[]): MLineEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const code = tuple[0]
      const value = tuple[1]

      switch (code) {
        // Start point
        case 10:
          ensurePoint3(entity, 'startPoint').x = value as number
          break
        case 20:
          ensurePoint3(entity, 'startPoint').y = value as number
          break
        case 30:
          ensurePoint3(entity, 'startPoint').z = value as number
          break

        // End point
        case 11:
          ensurePoint3(entity, 'endPoint').x = value as number
          break
        case 21:
          ensurePoint3(entity, 'endPoint').y = value as number
          break
        case 31:
          ensurePoint3(entity, 'endPoint').z = value as number
          break

        case 71:
          entity.vertexCount = value as number
          break

        case 2:
          entity.styleName = String(value)
          break

        default:
          Object.assign(entity, common(code, value))
          break
      }

      return entity
    },
    {
      type: TYPE,
    } as MLineEntity,
  )
}

export default { TYPE, process }
