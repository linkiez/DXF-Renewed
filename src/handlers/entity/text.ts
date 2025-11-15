import type { DXFTuple } from '../../types/dxf'

import common from './common'

export const TYPE = 'TEXT'


interface SimpleCodes {
  [key: number]: string
}

interface TextEntity {
  type: typeof TYPE
  string: string
  x?: number
  y?: number
  z?: number
  x2?: number
  y2?: number
  z2?: number
  thickness?: number
  textHeight?: number
  relScaleX?: number
  rotation?: number
  obliqueAngle?: number
  styleName?: string
  mirror?: number
  hAlign?: number
  vAlign?: number
  [key: string]: unknown
}

const simpleCodes: SimpleCodes = {
  1: 'string',
  10: 'x',
  20: 'y',
  30: 'z',
  11: 'x2',
  21: 'y2',
  31: 'z2',
  39: 'thickness',
  40: 'textHeight',
  41: 'relScaleX',
  50: 'rotation',
  51: 'obliqueAngle',
  7: 'styleName',
  71: 'mirror',
  72: 'hAlign',
  73: 'vAlign',
}

// const EXCEPTION_STRINGS = ['\\A1;', '%%u']

export const process = (tuples: DXFTuple[]): TextEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]

      assign(entity, type, value)

      return entity
    },
    {
      type: TYPE,
      string: '',
    } as TextEntity,
  )
}

export const assign = (
  entity: TextEntity,
  type: number,
  value: string | number
): void => {
  if (type in simpleCodes) {
    entity[simpleCodes[type]] = value
  } else {
    Object.assign(entity, common(type, value))
  }
}

export default { TYPE, process, assign }
