/**
 * Browser-compatible modular post-processing API.
 *
 * Public generation accepts immutable cut plans and explicit reviewed output;
 * fixture and persistence adapters remain outside this package boundary.
 *
 * @module nesting/post
 */

import { edgeConnect809550Rev6 } from './processors/edge-connect'
import { genericLaser } from './processors/generic-laser'
import { genericPlasma } from './processors/generic-plasma'
import { registerPostProcessor } from './registry'

export * from './types'
export * from './canonicalize'
export * from './linearize'
export * from './validate'
export * from './registry'
export * from './process'
export { GcodeWriter } from './gcode/writer'
export { genericLaser } from './processors/generic-laser'
export { genericPlasma } from './processors/generic-plasma'
export { edgeConnect809550Rev6 } from './processors/edge-connect'

for (const processor of [genericLaser, genericPlasma, edgeConnect809550Rev6]) {
  registerPostProcessor(processor)
}
