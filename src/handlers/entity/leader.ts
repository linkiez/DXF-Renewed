import type { DXFTuple } from '../../types'

import common from './common'

const TYPE = 'LEADER'

interface LeaderEntity {
  type: typeof TYPE
  vertices: Array<{ x: number; y: number; z: number }>

  dimensionStyleName?: string
  arrowheadFlag?: number
  pathType?: number
  creationFlag?: number
  hooklineDirectionFlag?: number
  hooklineFlag?: number
  textHeight?: number
  textWidth?: number
  color?: number
  annotationHandle?: string

  normal?: { x: number; y: number; z: number }
  horizontalDirection?: { x: number; y: number; z: number }
  blockOffset?: { x: number; y: number; z: number }
  annotationOffset?: { x: number; y: number; z: number }

  [key: string]: unknown
}

function ensureVector3(
  entity: LeaderEntity,
  key: 'normal' | 'horizontalDirection' | 'blockOffset' | 'annotationOffset',
): { x: number; y: number; z: number } {
  if (!entity[key]) entity[key] = { x: 0, y: 0, z: 0 }
  return entity[key] as { x: number; y: number; z: number }
}

const process = (tuples: DXFTuple[]): LeaderEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]

      switch (type) {
        case 3:
          entity.dimensionStyleName = String(value)
          break

        case 71:
          entity.arrowheadFlag = value as number
          break
        case 72:
          entity.pathType = value as number
          break
        case 73:
          entity.creationFlag = value as number
          break
        case 74:
          entity.hooklineDirectionFlag = value as number
          break
        case 75:
          entity.hooklineFlag = value as number
          break

        case 40:
          entity.textHeight = value as number
          break
        case 41:
          entity.textWidth = value as number
          break

        case 76:
          // Number of vertices in leader. Keep as metadata only.
          entity.vertexCount = value as number
          break

        case 10:
          entity.vertices.push({ x: value as number, y: 0, z: 0 })
          break
        case 20: {
          const current = entity.vertices.slice(-1)[0]
          if (current) current.y = value as number
          break
        }
        case 30: {
          const current = entity.vertices.slice(-1)[0]
          if (current) current.z = value as number
          break
        }

        case 77:
          entity.color = value as number
          break

        case 340:
          entity.annotationHandle = String(value)
          break

        case 210:
          ensureVector3(entity, 'normal').x = value as number
          break
        case 220:
          ensureVector3(entity, 'normal').y = value as number
          break
        case 230:
          ensureVector3(entity, 'normal').z = value as number
          break

        case 211:
          ensureVector3(entity, 'horizontalDirection').x = value as number
          break
        case 221:
          ensureVector3(entity, 'horizontalDirection').y = value as number
          break
        case 231:
          ensureVector3(entity, 'horizontalDirection').z = value as number
          break

        case 212:
          ensureVector3(entity, 'blockOffset').x = value as number
          break
        case 222:
          ensureVector3(entity, 'blockOffset').y = value as number
          break
        case 232:
          ensureVector3(entity, 'blockOffset').z = value as number
          break

        case 213:
          ensureVector3(entity, 'annotationOffset').x = value as number
          break
        case 223:
          ensureVector3(entity, 'annotationOffset').y = value as number
          break
        case 233:
          ensureVector3(entity, 'annotationOffset').z = value as number
          break

        default:
          Object.assign(entity, common(type, value))
          break
      }

      return entity
    },
    {
      type: TYPE,
      vertices: [],
    } as LeaderEntity,
  )
}

export default { TYPE, process }
