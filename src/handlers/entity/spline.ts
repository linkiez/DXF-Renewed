import common from './common'

export const TYPE = 'SPLINE'

type Tuple = [number, string | number]

interface ControlPoint {
  x: number
  y: number
  z?: number
}

interface SplineEntity {
  type: typeof TYPE
  controlPoints: ControlPoint[]
  knots: number[]
  weights?: number[]
  knotTolerance?: number
  controlPointTolerance?: number
  fitTolerance?: number
  flag?: number
  closed?: boolean
  degree?: number
  numberOfKnots?: number
  numberOfControlPoints?: number
  numberOfFitPoints?: number
  [key: string]: unknown
}

export const process = (tuples: Tuple[]): SplineEntity => {
  let controlPoint: ControlPoint
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 10:
          controlPoint = {
            x: value as number,
            y: 0,
          }
          entity.controlPoints.push(controlPoint)
          break
        case 20:
          controlPoint.y = value as number
          break
        case 30:
          controlPoint.z = value as number
          break
        case 40:
          entity.knots.push(value as number)
          break
        case 41:
          // Only create weights if needed
          entity.weights ??= []
          entity.weights.push(value as number)
          break
        case 42:
          entity.knotTolerance = value as number
          break
        case 43:
          entity.controlPointTolerance = value as number
          break
        case 44:
          entity.fitTolerance = value as number
          break
        case 70: // Spline flag (bit coded):
          // 1 = Closed spline
          // 2 = Periodic spline
          // 4 = Rational spline
          // 8 = Planar
          // 16 = Linear (planar bit is also set)
          entity.flag = value as number
          entity.closed = ((value as number) & 1) === 1
          break
        case 71:
          entity.degree = value as number
          break
        case 72:
          entity.numberOfKnots = value as number
          break
        case 73:
          entity.numberOfControlPoints = value as number
          break
        case 74:
          entity.numberOfFitPoints = value as number
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
      controlPoints: [],
      knots: [],
    } as SplineEntity,
  )
}

export default { TYPE, process }
