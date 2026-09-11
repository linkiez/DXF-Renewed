import type { DXFTuple, MLeaderEntity as PublicMLeaderEntity } from '../../types'

import common from './common'

const TYPE = 'MLEADER'

interface MLeaderEntity extends PublicMLeaderEntity {
  type: typeof TYPE

  [key: string]: unknown
}

const process = (tuples: DXFTuple[]): MLeaderEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const code = tuple[0]
      const value = tuple[1]

      switch (code) {
        // Style name
        case 2:
          entity.styleName = String(value)
          break

        // Text string (simplified). MLEADER text can also be stored in more complex structures.
        case 1:
          entity.text = String(value)
          break

        case 10:
          entity.insertionPoint ??= { x: 0, y: 0, z: 0 }
          entity.insertionPoint.x = value as number
          break
        case 20:
          entity.insertionPoint ??= { x: 0, y: 0, z: 0 }
          entity.insertionPoint.y = value as number
          break
        case 30:
          entity.insertionPoint ??= { x: 0, y: 0, z: 0 }
          entity.insertionPoint.z = value as number
          break
        case 40:
          entity.textHeight = value as number
          break

        default:
          Object.assign(entity, common(code, value))
          break
      }

      return entity
    },
    {
      type: TYPE,
    } as MLeaderEntity,
  )
}

export default { TYPE, process }
