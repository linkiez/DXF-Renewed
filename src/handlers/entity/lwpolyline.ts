import common from './common'

import type { Point3D, PolylineEntity } from '../../types'

export const TYPE = 'LWPOLYLINE'

type DXFTuple = [number, string | number]

interface PolylineVertex extends Point3D {
  bulge?: number
}

export const process = (tuples: DXFTuple[]): PolylineEntity => {
  let vertex: PolylineVertex | undefined
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 70:
          entity.closed = ((value as number) & 1) === 1
          break
        case 10:
          vertex = {
            x: value as number,
            y: 0,
          } as PolylineVertex
          entity.vertices.push(vertex)
          break
        case 20:
          if (vertex) vertex.y = value as number
          break
        case 39:
          entity.thickness = value as number
          break
        case 42:
          // Bulge (multiple entries; one entry for each vertex)  (optional; default = 0).
          if (vertex) vertex.bulge = value as number
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
