import type { BaseEntity } from './base-entity'

export interface TextContentEntity extends BaseEntity {
  string: string
  x?: number
  y?: number
  z?: number
  textHeight?: number
  styleName?: string
}