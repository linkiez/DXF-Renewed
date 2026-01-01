// Helper class interface

import type { ParsedDXF } from './dxf'
import type { Entity } from './entity'
import type { ToJsonOptions, ToPolylinesOptions, ToSVGOptions } from './options'

export interface HelperInterface {
  parsed: ParsedDXF
  denormalised: Entity[]
  toSVG(options?: ToSVGOptions): string
  toJson(options?: ToJsonOptions): string
  toPolylines(options?: ToPolylinesOptions): any[]
}
