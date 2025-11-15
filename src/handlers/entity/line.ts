import common from './common'

export const TYPE = 'LINE'

type Tuple = [number, string | number]

interface Point {
  x?: number
  y?: number
  z?: number
}

interface LineEntity {
  type: typeof TYPE
  start: Point
  end: Point
  thickness?: number
  [key: string]: unknown
}

export const process = (tuples: Tuple[]): LineEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 10:
          entity.start.x = value as number
          break
        case 20:
          entity.start.y = value as number
          break
        case 30:
          entity.start.z = value as number
          break
        case 39:
          entity.thickness = value as number
          break
        case 11:
          entity.end.x = value as number
          break
        case 21:
          entity.end.y = value as number
          break
        case 31:
          entity.end.z = value as number
          break
        default:
          Object.assign(entity, common(type, value))
          break
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
