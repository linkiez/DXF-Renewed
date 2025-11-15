// Helper class interface

import type { ParsedDXF } from './dxf'
import type { Entity } from './entity'
import type { ToPolylinesOptions, ToSVGOptions } from './options'

export interface HelperInterface {
  parsed: ParsedDXF
  denormalised: Entity[]
  toSVG(options?: ToSVGOptions): string
  toPolylines(options?: ToPolylinesOptions): any[]
}
