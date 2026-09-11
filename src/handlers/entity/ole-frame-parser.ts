import type { DXFTuple, OleFrameData } from '../../types'

import common from './common'

export function parseOleFrame(typeName: string, tuples: DXFTuple[]): OleFrameData & { type: string } {
  return tuples.reduce(
    (entity, tuple) => {
      const code = tuple[0]
      const value = tuple[1]

      switch (code) {
        case 70:
          entity.version = value
          break
        case 3:
          entity.name = value
          break
        case 10:
          entity.upperLeftX = value
          break
        case 20:
          entity.upperLeftY = value
          break
        case 30:
          entity.upperLeftZ = value
          break
        case 11:
          entity.lowerRightX = value
          break
        case 21:
          entity.lowerRightY = value
          break
        case 31:
          entity.lowerRightZ = value
          break
        case 71:
          entity.objectType = value
          break
        case 72:
          entity.tile = value
          break
        case 90:
          entity.length = value
          break
        case 310:
          entity.data += String(value)
          break
        default:
          Object.assign(entity, common(code, value))
      }

      return entity
    },
    { type: typeName, data: '' } as OleFrameData & { type: string },
  )
}