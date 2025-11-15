// Handler types for entity processing

import type { DXFTuple } from './dxf'
import type { Entity } from './entity'

export interface EntityHandler {
  TYPE: string
  process: (tuples: DXFTuple[]) => Entity
  assign?: (entity: any, type: number, value: any) => any
}
