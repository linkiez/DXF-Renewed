import type { BoundingBox } from '../types'

/** Spatial grid of part boxes of one sheet. */
export interface NeighbourIndex {
  /** Keys of the parts whose box meets `bbox` expanded by `margin`, in insertion order. */
  query(bbox: BoundingBox, margin: number): string[]
  /** A new index where `key` has the given box; the original is unchanged. */
  with(key: string, bbox: BoundingBox): NeighbourIndex
}

interface Entry {
  key: string
  bbox: BoundingBox
}

const cellsOf = (bbox: BoundingBox, size: number): string[] => {
  const cells: string[] = []
  const x0 = Math.floor(bbox.minX / size)
  const x1 = Math.floor(bbox.maxX / size)
  const y0 = Math.floor(bbox.minY / size)
  const y1 = Math.floor(bbox.maxY / size)
  for (let x = x0; x <= x1; x += 1) for (let y = y0; y <= y1; y += 1) cells.push(`${x},${y}`)
  return cells
}

const overlaps = (a: BoundingBox, b: BoundingBox, margin: number): boolean =>
  a.minX <= b.maxX + margin && a.maxX >= b.minX - margin && a.minY <= b.maxY + margin && a.maxY >= b.minY - margin

const make = (
  size: number,
  boxes: ReadonlyMap<string, BoundingBox>,
  cells: ReadonlyMap<string, readonly string[]>,
  rank: ReadonlyMap<string, number>,
): NeighbourIndex => ({
  query(bbox, margin) {
    const grown = { ...bbox, minX: bbox.minX - margin, minY: bbox.minY - margin, maxX: bbox.maxX + margin, maxY: bbox.maxY + margin }
    const found = new Set<string>()
    for (const cell of cellsOf(grown, size)) {
      for (const key of cells.get(cell) ?? []) {
        const box = boxes.get(key)
        if (box && overlaps(box, bbox, margin)) found.add(key)
      }
    }
    return [...found].sort((a, b) => (rank.get(a) ?? 0) - (rank.get(b) ?? 0))
  },
  with(key, bbox) {
    const nextBoxes = new Map(boxes).set(key, bbox)
    const nextCells = new Map(cells)
    const previous = boxes.get(key)
    if (previous) {
      for (const cell of cellsOf(previous, size)) nextCells.set(cell, (nextCells.get(cell) ?? []).filter((k) => k !== key))
    }
    for (const cell of cellsOf(bbox, size)) nextCells.set(cell, [...(nextCells.get(cell) ?? []), key])
    return make(size, nextBoxes, nextCells, rank)
  },
})

/**
 * Builds a uniform grid of part boxes so a verdict only looks at the neighbours of a candidate.
 *
 * @param entries - Part keys and boxes in artifact order; that order is the order of query results.
 * @param cellSize - Side of a grid cell, greater than zero.
 * @returns An immutable index.
 * @example
 * ```typescript
 * const index = createNeighbourIndex(entries, 24)
 * const near = index.query(candidateBox, spacing)
 * ```
 */
export function createNeighbourIndex(entries: readonly Entry[], cellSize: number): NeighbourIndex {
  const boxes = new Map<string, BoundingBox>()
  const cells = new Map<string, string[]>()
  const rank = new Map<string, number>()
  entries.forEach((entry, position) => {
    boxes.set(entry.key, entry.bbox)
    rank.set(entry.key, position)
    for (const cell of cellsOf(entry.bbox, cellSize)) cells.set(cell, [...(cells.get(cell) ?? []), entry.key])
  })
  return make(cellSize, boxes, cells, rank)
}
