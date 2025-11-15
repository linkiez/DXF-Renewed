// DXF parsing and structure types

import type { Entity } from './entity'
import type { ParsedObjects } from './tables'

export interface LayerTable {
  name: string
  frozen?: boolean
  colorNumber?: number
  [key: string]: unknown
}

export interface DimStyleTable {
  name: string
  dimAsz?: number
  dimTxt?: number
  dimScale?: number
  dimGap?: number
  dimExo?: number
  dimExe?: number
  [key: string]: unknown
}

export interface Tables {
  layers: {
    [name: string]: LayerTable
  }
  dimStyles?: {
    [name: string]: DimStyleTable
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
  objects?: ParsedObjects
}

export type DXFTuple = [number, string | number]
