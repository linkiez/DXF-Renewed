import type { DXFTuple, ParsedHeader } from '../types'

export default function parseHeader(tuples: DXFTuple[]): ParsedHeader {
  let state: 'measurement' | 'insUnits' | 'extMin' | 'extMax' | 'dimArrowSize' | undefined
  const header: ParsedHeader = {}

  for (const tuple of tuples) {
    const type = tuple[0]
    const value = tuple[1]

    switch (value) {
      case '$MEASUREMENT': {
        state = 'measurement'
        break
      }
      case '$INSUNITS': {
        state = 'insUnits'
        break
      }
      case '$EXTMIN':
        header.extMin = {}
        state = 'extMin'
        break
      case '$EXTMAX':
        header.extMax = {}
        state = 'extMax'
        break
      case '$DIMASZ':
        header.dimArrowSize = {}
        state = 'dimArrowSize'
        break
      default:
        switch (state) {
          case 'extMin':
          case 'extMax': {
            const target = header[state]
            if (target) {
              switch (type) {
                case 10:
                  target.x = value as number
                  break
                case 20:
                  target.y = value as number
                  break
                case 30:
                  target.z = value as number
                  state = undefined
                  break
              }
            }
            break
          }
          case 'measurement':
          case 'insUnits': {
            if (type === 70) {
              header[state] = value
              state = undefined
            }
            break
          }
          case 'dimArrowSize': {
            if (type === 40) {
              header[state] = value
              state = undefined
            }
            break
          }
        }
    }
  }

  return header
}
