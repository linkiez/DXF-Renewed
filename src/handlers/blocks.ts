import type { BlockInternal, DXFTuple } from '../types'

import entitiesHandler from './entities'

export default function parseBlocks(tuples: DXFTuple[]): any[] {
  let state: 'block' | 'entities' | undefined
  const blocks: BlockInternal[] = []
  let block: BlockInternal | undefined
  let entitiesTuples: DXFTuple[] | undefined = []

  for (const tuple of tuples) {
    const type = tuple[0]
    const value = tuple[1]

    if (value === 'BLOCK') {
      state = 'block'
      block = {}
      entitiesTuples = []
      blocks.push(block)
    } else if (value === 'ENDBLK') {
      if (block) {
        if (state === 'entities' && entitiesTuples) {
          block.entities = entitiesHandler(entitiesTuples)
        } else {
          block.entities = []
        }
      }
      entitiesTuples = undefined
      state = undefined
    } else if (state === 'block' && type !== 0 && block) {
      switch (type) {
        case 1:
          block.xref = value
          break
        case 2:
          block.name = value
          break
        case 10:
          block.x = value
          break
        case 20:
          block.y = value
          break
        case 30:
          block.z = value
          break
        case 67:
          if (value !== 0) block.paperSpace = value
          break
        case 410:
          block.layout = value
          break
        default:
          break
      }
    } else if (state === 'block' && type === 0) {
      state = 'entities'
      if (entitiesTuples) entitiesTuples.push(tuple)
    } else if (state === 'entities') {
      if (entitiesTuples) entitiesTuples.push(tuple)
    }
  }

  return blocks
}
