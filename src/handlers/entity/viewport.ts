import type { DXFTuple, ViewportEntity } from '../../types'

import common from './common'

export const TYPE = 'VIEWPORT'

export const process = (tuples: DXFTuple[]): ViewportEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]

      // Map coordinate cases to their properties
      const coordMap: Record<number, { obj: keyof ViewportEntity; prop: string }> = {
        10: { obj: 'center', prop: 'x' },
        20: { obj: 'center', prop: 'y' },
        30: { obj: 'center', prop: 'z' },
        12: { obj: 'centerDCS', prop: 'x' },
        22: { obj: 'centerDCS', prop: 'y' },
        13: { obj: 'snap', prop: 'x' },
        23: { obj: 'snap', prop: 'y' },
        14: { obj: 'snapSpacing', prop: 'x' },
        24: { obj: 'snapSpacing', prop: 'y' },
        15: { obj: 'gridSpacing', prop: 'x' },
        25: { obj: 'gridSpacing', prop: 'y' },
        16: { obj: 'direction', prop: 'x' },
        26: { obj: 'direction', prop: 'y' },
        36: { obj: 'direction', prop: 'z' },
        17: { obj: 'target', prop: 'x' },
        27: { obj: 'target', prop: 'y' },
        37: { obj: 'target', prop: 'z' },
      }

      if (coordMap[type]) {
        const { obj, prop } = coordMap[type]
        const target = entity[obj]
        if (target && typeof target === 'object') {
          ;(target as any)[prop] = Number.parseFloat(String(value))
        }
      } else {
        switch (type) {
          case 1:
            entity.layout = Number.parseFloat(String(value))
            break
          case 40:
            entity.width = Number.parseFloat(String(value))
            break
          case 41:
            entity.height = Number.parseFloat(String(value))
            break
          case 50:
            entity.snapAngle = Number.parseFloat(String(value))
            break
          case 51:
            entity.angle = Number.parseFloat(String(value))
            break
          case 68:
            entity.status = value
            break
          case 69:
            entity.id = value
            break
          case 90:
            entity.flags = value
            break
          case 110:
            entity.x = Number.parseFloat(String(value))
            break
          case 120:
            entity.y = Number.parseFloat(String(value))
            break
          case 130:
            entity.z = Number.parseFloat(String(value))
            break
          case 111:
            entity.xAxisX = Number.parseFloat(String(value))
            break
          case 121:
            entity.xAxisY = Number.parseFloat(String(value))
            break
          case 131:
            entity.xAxisZ = Number.parseFloat(String(value))
            break
          case 112:
            entity.xAxisX = Number.parseFloat(String(value))
            break
          case 122:
            entity.xAxisY = Number.parseFloat(String(value))
            break
          case 132:
            entity.xAxisZ = Number.parseFloat(String(value))
            break
          case 146:
            entity.elevation = Number.parseFloat(String(value))
            break
          case 281:
            entity.render = value
            break
          default:
            Object.assign(entity, common(type, value))
            break
        }
      }
      return entity
    },
    {
      type: TYPE,
      center: {},
      centerDCS: {},
      snap: {},
      snapSpacing: {},
      gridSpacing: {},
      direction: {},
      target: {},
    } as ViewportEntity,
  )
}

export default { TYPE, process }
