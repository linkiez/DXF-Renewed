import common from './common'

export const TYPE = 'ARC'

type Tuple = [number, string | number]

interface ArcEntity {
  type: typeof TYPE
  x?: number
  y?: number
  z?: number
  thickness?: number
  r?: number
  startAngle?: number
  endAngle?: number
  [key: string]: unknown
}

export const process = (tuples: Tuple[]): ArcEntity => {
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
        case 39:
          entity.thickness = value as number
          break
        case 40:
          entity.r = value as number
          break
        case 50:
          // *Someone* decided that ELLIPSE angles are in radians but
          // ARC angles are in degrees
          entity.startAngle = ((value as number) / 180) * Math.PI
          break
        case 51:
          entity.endAngle = ((value as number) / 180) * Math.PI
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
    } as ArcEntity,
  )
}

export default { TYPE, process }
