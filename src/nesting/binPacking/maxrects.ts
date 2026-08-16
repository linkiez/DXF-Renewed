/**
 * MaxRects Bin Packing Algorithm
 *
 * Maintains a list of maximum free rectangles.
 */

import type { NestableShape, Placement, FreeRect, BoundingBox } from '../types'

// ─────────────────────────────────────────────
// Score & Place
// ─────────────────────────────────────────────

function scoreRect(
  freeRects: FreeRect[],
  width: number,
  height: number,
): { score: number; bestRectIndex: number } {
  let bestScore = Infinity
  let bestRectIndex = -1

  for (let i = 0; i < freeRects.length; i++) {
    const rect = freeRects[i]

    if (rect.width >= width && rect.height >= height) {
      // Best Area Fit: smallest waste
      const score = rect.width * rect.height - width * height
      if (score < bestScore) {
        bestScore = score
        bestRectIndex = i
      }
    }
  }

  return { score: bestScore, bestRectIndex }
}

function placeShape(
  shape: NestableShape,
  freeRects: FreeRect[],
  kerf: number,
): Placement | null {
  const w = shape.bbox.width + kerf
  const h = shape.bbox.height + kerf

  let bestIdx = -1
  let bestScore = Infinity
  let bestRotation = 0
  let bestW = w
  let bestH = h

  // Try normal
  const normal = scoreRect(freeRects, w, h)
  if (normal.bestRectIndex >= 0) {
    bestIdx = normal.bestRectIndex
    bestScore = normal.score
    bestW = w
    bestH = h
  }

  // Try rotated
  if (shape.allowedRotations.includes(90)) {
    const rotated = scoreRect(freeRects, h, w)
    if (rotated.bestRectIndex >= 0 && rotated.score < bestScore) {
      bestIdx = rotated.bestRectIndex
      bestW = h
      bestH = w
      bestRotation = 90
    }
  }

  if (bestIdx === -1) return null

  const rect = freeRects[bestIdx]
  freeRects.splice(bestIdx, 1)

  // Split: right and bottom
  if (rect.width - bestW > 0) {
    freeRects.push({
      x: rect.x + bestW,
      y: rect.y,
      width: rect.width - bestW,
      height: rect.height,
    })
  }
  if (rect.height - bestH > 0) {
    freeRects.push({
      x: rect.x,
      y: rect.y + bestH,
      width: bestW,
      height: rect.height - bestH,
    })
  }

  const bbox: BoundingBox = {
    minX: rect.x,
    minY: rect.y,
    maxX: rect.x + bestW,
    maxY: rect.y + bestH,
    width: bestW,
    height: bestH,
  }

  return {
    shapeId: shape.id,
    x: rect.x + kerf / 2,
    y: rect.y + kerf / 2,
    rotation: bestRotation,
    bbox,
  }
}

// ─────────────────────────────────────────────
// Single Sheet
// ─────────────────────────────────────────────

function packSingleSheet(
  shapes: NestableShape[],
  sheetWidth: number,
  sheetHeight: number,
  margin: number,
  kerf: number,
): { placements: Placement[]; unplaced: NestableShape[] } {
  const placements: Placement[] = []
  const unplaced: NestableShape[] = []

  const freeRects: FreeRect[] = [
    {
      x: margin,
      y: margin,
      width: sheetWidth - 2 * margin,
      height: sheetHeight - 2 * margin,
    },
  ]

  // Sort by area descending
  const sorted = [...shapes].sort((a, b) => b.area - a.area)

  for (const shape of sorted) {
    const placement = placeShape(shape, freeRects, kerf)
    if (placement) {
      placements.push(placement)
    } else {
      unplaced.push(shape)
    }
  }

  return { placements, unplaced }
}

// ─────────────────────────────────────────────
// Multi-Sheet
// ─────────────────────────────────────────────

export function maxRectsPack(
  shapes: NestableShape[],
  sheetWidth: number,
  sheetHeight: number,
  margin: number,
  kerf: number,
  maxSheets: number = 0,
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
    const result = packSingleSheet(
      remaining,
      sheetWidth,
      sheetHeight,
      margin,
      kerf,
    )
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
