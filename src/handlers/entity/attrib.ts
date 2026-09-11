import type { DXFTuple } from '../../types/dxf'

import { assign } from './attdef'

const TYPE = 'ATTRIB'


const process = (tuples: DXFTuple[]): any => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]

      assign(entity, type, value)

      return entity
    },
    {
      type: TYPE,
      subclassMarker: 'AcDbText',
      thickness: 0,
      scaleX: 1,
      mtext: {},
      text: {},
    },
  )
}

export default { TYPE, process }
