import common from './common'

export const TYPE = 'POLYLINE'

type Tuple = [number, string | number]

interface Vertex {
  [key: string]: unknown
}

interface PolylineEntity {
  type: typeof TYPE
  vertices: Vertex[]
  closed?: boolean
  polygonMesh?: boolean
  polyfaceMesh?: boolean
  thickness?: number
  [key: string]: unknown
}

export const process = (tuples: Tuple[]): PolylineEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 70:
          entity.closed = ((value as number) & 1) === 1
          entity.polygonMesh = ((value as number) & 16) === 16
          entity.polyfaceMesh = ((value as number) & 64) === 64
          break
        case 39:
          entity.thickness = value as number
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
    } as PolylineEntity,
  )
}

export default { TYPE, process }
