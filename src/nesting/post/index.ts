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
import { gloryStarGs3015 } from './processors/glorystar-gs3015'
import { hyperthermEdgeProHpr400xda } from './processors/hypertherm-edge-pro-hpr400xda'
import { talvi6000w } from './processors/talvi-6000w'
import { registerPostProcessor } from './registry'

export * from './types'
export * from './canonicalize'
export * from './linearize'
export * from './validate'
export * from './registry'
export * from './process'
export { GcodeWriter } from './gcode/writer'
export * from './machine'
export { genericLaser } from './processors/generic-laser'
export { genericPlasma } from './processors/generic-plasma'
export { edgeConnect809550Rev6 } from './processors/edge-connect'
export { gloryStarGs3015 } from './processors/glorystar-gs3015'
export { hyperthermEdgeProHpr400xda } from './processors/hypertherm-edge-pro-hpr400xda'
export { talvi6000w } from './processors/talvi-6000w'

for (const processor of [genericLaser, genericPlasma, edgeConnect809550Rev6, talvi6000w, hyperthermEdgeProHpr400xda, gloryStarGs3015]) {
  registerPostProcessor(processor)
}
