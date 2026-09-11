import type { DXFTuple } from '../../types'

import common from './common'

const TYPE = 'TABLE'

interface TableEntity {
  type: typeof TYPE

  rows?: number
  columns?: number
  cellText?: string[]

  [key: string]: unknown
}

const process = (tuples: DXFTuple[]): TableEntity => {
  return tuples.reduce(
    (entity, tuple) => {
      const code = tuple[0]
      const value = tuple[1]

      switch (code) {
        case 90:
          entity.rows = value as number
          break
        case 91:
          entity.columns = value as number
          break

        case 1:
          entity.cellText ??= []
          entity.cellText.push(String(value))
          break

        default:
          Object.assign(entity, common(code, value))
          break
      }

      return entity
    },
    {
      type: TYPE,
    } as TableEntity,
  )
}

export default { TYPE, process }
