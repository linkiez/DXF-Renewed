import common from './common'

export const TYPE = 'CIRCLE'

type Tuple = [number, string | number]

interface CircleEntity {
  type: typeof TYPE
  x?: number
  y?: number
  z?: number
  r?: number
  [key: string]: unknown
}

export const process = (tuples: Tuple[]): CircleEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 10:
          entity.x = value as number
          break
        case 20:
          entity.y = value as number
          break
        case 30:
          entity.z = value as number
          break
        case 40:
          entity.r = value as number
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
    } as CircleEntity,
  )
}

export default { TYPE, process }
