// Options types for various operations

export interface ToPolylinesOptions {
  interpolationsPerSplineSegment?: number
}

export interface ToSVGOptions {
  width?: number
  height?: number
}

export interface Config {
  verbose?: boolean
  interpolationsPerSplineSegment: number
  layers: string[]
}

