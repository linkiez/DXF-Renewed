import type { NestRequest } from '../types'
import type { ErpNestingRequest } from './types'

/**
 * Maps a validated ERP request to the existing true-shape nesting request.
 *
 * @param request - Validated ERP request.
 * @param signal - Cooperative cancellation signal for the delegated flow.
 * @returns Existing nesting-engine request model.
 */
export function toNestRequest(
  request: ErpNestingRequest,
  signal: AbortSignal,
): NestRequest {
  return {
    parts: request.job.parts,
    stock: request.job.stock,
    edgeClearance: request.job.nesting.edgeClearance,
    partToPartClearance: request.job.nesting.partToPartClearance,
    seed: request.seed,
    objective: request.job.nesting.objective,
    acceleration: request.job.nesting.acceleration,
    signal,
    options: {
      algorithm: request.job.nesting.algorithm,
      allowedRotations: request.job.nesting.allowedRotations,
    },
  }
}
