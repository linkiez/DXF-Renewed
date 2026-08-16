/**
 * Guillotine Bin Packing Algorithm
 *
 * Splits free space into rectangles after each placement.
 * Supports rotation and multiple heuristics.
 */

import type {
  NestableShape,
  Placement,
  FreeRect,
  BoundingBox,
} from '../types'

interface ShapeInfo {
  shape: NestableShape
  width: number
  height: number
  rotation: number
}

// ─────────────────────────────────────────────
// Free Rectangle List (simpler than tree)
// ─────────────────────────────────────────────

/**
 * Pack shapes onto a single sheet using free rectangle list.
 */
function packSingleSheet(
  shapes: ShapeInfo[],
  sheetWidth: number,
  sheetHeight: number,
  margin: number,
  kerf: number
): { placements: Placement[]; unplaced: ShapeInfo[] } {
  const placements: Placement[] = []
  const unplaced: ShapeInfo[] = []

  // Free rectangles list
  const freeRects: FreeRect[] = [
    {
      x: margin,
      y: margin,
      width: sheetWidth - 2 * margin,
      height: sheetHeight - 2 * margin,
    },
  ]

  // Sort shapes by area (largest first)
  const sorted = [...shapes].sort((a, b) => b.width * b.height - a.width * a.height)

  for (const shape of sorted) {
    let placed = false

    // Try normal orientation
    const result = tryPlace(shape, freeRects, sheetWidth, sheetHeight, kerf)
    if (result) {
      placements.push(result)
      placed = true
    }

    // Try rotated orientation
    if (!placed && shape.shape.allowedRotations.includes(90)) {
      const rotatedShape: ShapeInfo = {
        ...shape,
        width: shape.height,
        height: shape.width,
        rotation: 90,
      }
      const rotatedResult = tryPlace(rotatedShape, freeRects, sheetWidth, sheetHeight, kerf)
      if (rotatedResult) {
        placements.push(rotatedResult)
        placed = true
      }
    }

    if (!placed) {
      unplaced.push(shape)
    }
  }

  return { placements, unplaced }
}

/**
 * Try to place a shape in the best free rectangle.
 */
function tryPlace(
  shape: ShapeInfo,
  freeRects: FreeRect[],
  sheetWidth: number,
  sheetHeight: number,
  kerf: number
): Placement | null {
  const neededWidth = shape.width + kerf
  const neededHeight = shape.height + kerf

  let bestIdx = -1
  let bestScore = Infinity

  for (let i = 0; i < freeRects.length; i++) {
    const rect = freeRects[i]

    if (rect.width >= neededWidth && rect.height >= neededHeight) {
      // Best Area Fit (BAF) heuristic
      const waste = rect.width * rect.height - neededWidth * neededHeight
      const score = waste / (rect.width * rect.height)

      if (score < bestScore) {
        bestScore = score
        bestIdx = i
      }
    }
  }

  if (bestIdx === -1) return null

  const rect = freeRects[bestIdx]
  freeRects.splice(bestIdx, 1)

  // Split remaining space
  splitFreeRect(freeRects, rect, neededWidth, neededHeight)

  const bbox: BoundingBox = {
    minX: rect.x,
    minY: rect.y,
    maxX: rect.x + neededWidth,
    maxY: rect.y + neededHeight,
    width: neededWidth,
    height: neededHeight,
  }

  return {
    shapeId: shape.shape.id,
    x: rect.x + kerf / 2,
    y: rect.y + kerf / 2,
    rotation: shape.rotation,
    bbox,
  }
}

/**
 * Split a free rectangle after placing a shape.
 */
function splitFreeRect(
  freeRects: FreeRect[],
  rect: FreeRect,
  placedWidth: number,
  placedHeight: number
): void {
  // Right rectangle
  if (rect.width - placedWidth > 0) {
    freeRects.push({
      x: rect.x + placedWidth,
      y: rect.y,
      width: rect.width - placedWidth,
      height: rect.height, // Full height of original rect
    })
  }

  // Bottom rectangle
  if (rect.height - placedHeight > 0) {
    freeRects.push({
      x: rect.x,
      y: rect.y + placedHeight,
      width: placedWidth, // Only the width of placed shape
      height: rect.height - placedHeight,
    })
  }
}

// ─────────────────────────────────────────────
// Multi-Sheet Packing
// ─────────────────────────────────────────────

export function guillotinePack(
  shapes: NestableShape[],
  sheetWidth: number,
  sheetHeight: number,
  margin: number,
  kerf: number,
  maxSheets: number = 0
): {
  sheetPlacements: Placement[][]
  unplaced: NestableShape[]
} {
  const shapeInfos: ShapeInfo[] = shapes.map((shape) => ({
    shape,
    width: shape.bbox.width,
    height: shape.bbox.height,
    rotation: 0,
  }))

  const allPlacements: Placement[][] = []
  let remaining = shapeInfos

  const maxIterations = maxSheets > 0 ? maxSheets : 100

  for (let i = 0; i < maxIterations; i++) {
    if (remaining.length === 0) break

    const startCount = remaining.length
    const result = packSingleSheet(remaining, sheetWidth, sheetHeight, margin, kerf)
    allPlacements.push(result.placements)

    // Update remaining BEFORE break checks
    remaining = result.unplaced

    if (remaining.length === 0) break
    if (remaining.length >= startCount) {
      // No progress on this sheet
      break
    }
  }

  return {
    sheetPlacements: allPlacements,
    unplaced: remaining.map((s) => s.shape),
  }
}
