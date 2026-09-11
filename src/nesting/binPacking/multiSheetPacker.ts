/**
 * Shared multi-sheet packing logic
 * Reduces duplication across maxrects, guillotine, shelf algorithms
 */

import type { NestableShape, Placement } from '../types'

export interface SingleSheetResult {
  placements: Placement[]
  unplaced: NestableShape[]
}

/**
 * Pack shapes across multiple sheets using provided single-sheet packer
 * ponytail: extracted common loop from maxrects/guillotine/shelf, upgrade when adding new bin-packing algorithm
 */
export function packMultiSheet(
  shapes: NestableShape[],
  maxSheets: number,
  packSingleSheet: (shapes: NestableShape[]) => SingleSheetResult,
): {
  sheetPlacements: Placement[][]
  unplaced: NestableShape[]
} {
  const allPlacements: Placement[][] = []
  let remaining = shapes

  const maxIterations = maxSheets > 0 ? maxSheets : 100

  for (let i = 0; i < maxIterations; i++) {
    if (remaining.length === 0) break

    const startCount = remaining.length
    const result = packSingleSheet(remaining)
    allPlacements.push(result.placements)

    remaining = result.unplaced

    if (remaining.length === 0) break
    if (remaining.length >= startCount) break
  }

  return {
    sheetPlacements: allPlacements,
    unplaced: remaining,
  }
}
