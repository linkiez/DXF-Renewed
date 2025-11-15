// Common geometric types

export interface Point2D {
  x: number
  y: number
}

export interface Point3D extends Point2D {
  z: number
}

export interface RGB {
  r: number
  g: number
  b: number
}

export type ColorRGB = [number, number, number]

export interface Transform {
  x?: number
  y?: number
  scaleX?: number
  scaleY?: number
  scaleZ?: number
  rotation?: number
  extrusionX?: number
  extrusionY?: number
  extrusionZ?: number
}

export interface ZeroTransform {
  x: number
  y: number
  scaleX: number
  scaleY: number
  scaleZ: number
  rotation: number
  extrusionX: number
  extrusionY: number
  extrusionZ: number
}
