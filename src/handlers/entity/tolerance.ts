import type { DXFTuple } from '../../types'

import common from './common'

const TYPE = 'TOLERANCE'

interface ToleranceEntity {
  type: typeof TYPE

  insertionPoint: { x: number; y: number; z: number }
  text?: string
  dimensionStyleName?: string
  xAxisDirection?: { x: number; y: number; z: number }

  [key: string]: unknown
}

function ensureVector3(
  entity: ToleranceEntity,
  key: 'insertionPoint' | 'xAxisDirection',
): { x: number; y: number; z: number } {
  entity[key] ??= { x: 0, y: 0, z: 0 }
  return entity[key] as { x: number; y: number; z: number }
}

const process = (tuples: DXFTuple[]): ToleranceEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const code = tuple[0]
      const value = tuple[1]

      switch (code) {
        case 3:
          entity.dimensionStyleName = String(value)
          break

        case 10:
          ensureVector3(entity, 'insertionPoint').x = value as number
          break
        case 20:
          ensureVector3(entity, 'insertionPoint').y = value as number
          break
        case 30:
          ensureVector3(entity, 'insertionPoint').z = value as number
          break

        case 1:
          entity.text = String(value)
          break

        case 11:
          ensureVector3(entity, 'xAxisDirection').x = value as number
          break
        case 21:
          ensureVector3(entity, 'xAxisDirection').y = value as number
          break
        case 31:
          ensureVector3(entity, 'xAxisDirection').z = value as number
          break

        default:
          Object.assign(entity, common(code, value))
          break
      }

      return entity
    },
    {
      type: TYPE,
      insertionPoint: { x: 0, y: 0, z: 0 },
    } as ToleranceEntity,
  )
}

export default { TYPE, process }
