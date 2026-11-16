import type { NestResponse } from '../types'
import type { CanonicalInput } from './canonical'
import type { ErpUnplacedItem } from './types'

/**
 * Builds the canonical projection whose SHA-256 is the `outputDigest` of an artifact.
 *
 * @param contractVersion - Contract version of the artifact.
 * @param plan - Layout of the artifact.
 * @param unplaced - Unplaced items of the artifact.
 * @returns Canonical input of the output digest.
 * @example
 * ```typescript
 * const digest = await digestCanonical(outputProjection(1, artifact.layout, artifact.unplaced))
 * ```
 */
export function outputProjection(
  contractVersion: number,
  plan: NestResponse,
  unplaced: readonly ErpUnplacedItem[],
): CanonicalInput {
  return {
    contractVersion,
    layout: plan as CanonicalInput,
    selectedSheets: plan.sheets as CanonicalInput,
    plan: {
      placements: plan.placements as CanonicalInput,
      compoundPlacements: (plan.compoundPlacements ?? []) as CanonicalInput,
      unplaced: unplaced as CanonicalInput,
    },
    metrics: {
      utilization: plan.utilization,
      wasteArea: plan.wasteArea,
      totalArea: plan.totalArea,
    },
    unplaced: unplaced as CanonicalInput,
  }
}
