// DXF parsing and structure types

import type { Entity } from './entity'

export interface LayerTable {
  name: string
  frozen?: boolean
  colorNumber?: number
  [key: string]: unknown
}

export interface Tables {
  layers: {
    [name: string]: LayerTable
  }
  [key: string]: any
}

export interface Block {
  name: string
  entities: Entity[]
  x: number
  y: number
  z?: number
}

export interface Blocks {
  [name: string]: Block
}

export type BlockArray = Block[]

export interface ParsedDXF {
  header?: any
  tables: Tables
  blocks: BlockArray
  entities: Entity[]
  objects?: {
    layouts?: unknown[]
    [key: string]: unknown
  }
}

export type DXFTuple = [number, string | number]
