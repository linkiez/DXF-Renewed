/**
 * Shared multi-sheet packing logic
 * Reduces duplication across maxrects, guillotine, shelf algorithms
 */

import type { Placement } from '../types'

export interface SingleSheetResult<T> {
  placements: Placement[]
  unplaced: T[]
}

/**
 * Pack shapes across multiple sheets using provided single-sheet packer
 * ponytail: extracted common loop from maxrects/guillotine/shelf, upgrade when adding new bin-packing algorithm
 */
export function packMultiSheet<T>(
  shapes: T[],
  maxSheets: number,
  packSingleSheet: (shapes: T[]) => SingleSheetResult<T>,
): {
  sheetPlacements: Placement[][]
  unplaced: T[]
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
