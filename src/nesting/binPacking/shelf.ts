/**
 * Shelf Bin Packing Algorithm
 *
 * Organizes shapes into horizontal "shelves" (rows).
 */

import type {
  NestableShape,
  Placement,
  BoundingBox,
} from '../types'

interface ShelfItem {
  x: number
  width: number
}

interface Shelf {
  y: number
  height: number
  currentX: number
  remainingWidth: number
  items: ShelfItem[]
}

// ─────────────────────────────────────────────
// Single Sheet Shelf Packing
// ─────────────────────────────────────────────

function packSingleSheet(
  shapes: NestableShape[],
  sheetWidth: number,
  sheetHeight: number,
  margin: number,
  kerf: number
): { placements: Placement[]; unplaced: NestableShape[] } {
  const placements: Placement[] = []
  const unplaced: NestableShape[] = []
  const shelves: Shelf[] = []

  const availableWidth = sheetWidth - 2 * margin
  const availableHeight = sheetHeight - 2 * margin

  // Sort by height descending
  const sorted = [...shapes].sort((a, b) => b.bbox.height - a.bbox.height)

  for (const shape of sorted) {
    const shapeWidth = shape.bbox.width + kerf
    const shapeHeight = shape.bbox.height + kerf

    // Find a shelf that fits this shape
    let shelf = shelves.find(
      (s) => s.remainingWidth >= shapeWidth && s.height >= shapeHeight
    )

    // Create new shelf if needed
    if (!shelf) {
      const shelfY = shelves.length > 0
        ? shelves[shelves.length - 1].y + shelves[shelves.length - 1].height
        : margin

      if (shelfY + shapeHeight > margin + availableHeight) {
        unplaced.push(shape)
        continue
      }

      shelf = {
        y: shelfY,
        height: shapeHeight,
        currentX: margin,
        remainingWidth: availableWidth,
        items: [],
      }
      shelves.push(shelf)
    }

    // Check if shape fits in current shelf width
    if (shelf.currentX + shapeWidth > margin + availableWidth) {
      // Try next shelf or create new one
      const newShelfY = shelf.y + shelf.height
      if (newShelfY + shapeHeight <= margin + availableHeight) {
        shelf = {
          y: newShelfY,
          height: shapeHeight,
          currentX: margin,
          remainingWidth: availableWidth,
          items: [],
        }
        shelves.push(shelf)
      } else {
        unplaced.push(shape)
        continue
      }
    }

    const bbox: BoundingBox = {
      minX: shelf.currentX,
      minY: shelf.y,
      maxX: shelf.currentX + shapeWidth,
      maxY: shelf.y + shapeHeight,
      width: shapeWidth,
      height: shapeHeight,
    }

    placements.push({
      shapeId: shape.id,
      x: shelf.currentX + kerf / 2,
      y: shelf.y + kerf / 2,
      rotation: 0,
      bbox,
    })

    shelf.items.push({ x: shelf.currentX, width: shapeWidth })
    shelf.currentX += shapeWidth
    shelf.remainingWidth -= shapeWidth
  }

  return { placements, unplaced }
}

// ─────────────────────────────────────────────
// Multi-Sheet Packing
// ─────────────────────────────────────────────

export function shelfPack(
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
  const allPlacements: Placement[][] = []
  let remaining = shapes

  const maxIterations = maxSheets > 0 ? maxSheets : 100

  for (let i = 0; i < maxIterations; i++) {
    if (remaining.length === 0) break

    const startCount = remaining.length
    const result = packSingleSheet(remaining, sheetWidth, sheetHeight, margin, kerf)
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
