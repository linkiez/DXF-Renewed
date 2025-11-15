import { assign } from './attdef'

export const TYPE = 'ATTRIB'

type DXFTuple = [number, string | number]

export const process = (tuples: DXFTuple[]): any => {
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
