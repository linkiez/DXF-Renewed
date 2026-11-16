/**
 * Sums the windowed cut length of the cells whose center lies within `radius` of the center of a
 * cell, with half a cell of slack.
 *
 * @param totals - Cut length per cell, keyed `cx,cy`.
 * @param cx - Column of the cell.
 * @param cy - Row of the cell.
 * @param cellSize - Side of a cell in geometry units.
 * @param radius - Heat radius in geometry units.
 * @returns Length in geometry units.
 */
export function neighbourhoodLength(totals: ReadonlyMap<string, number>, cx: number, cy: number, cellSize: number, radius: number): number {
  const reach = Math.ceil(radius / cellSize) + 1
  const limit = radius + cellSize / 2
  let sum = 0
  for (let dx = -reach; dx <= reach; dx += 1) {
    for (let dy = -reach; dy <= reach; dy += 1) {
      if (Math.hypot(dx, dy) * cellSize > limit) continue
      sum += totals.get(`${cx + dx},${cy + dy}`) ?? 0
    }
  }
  return sum
}
