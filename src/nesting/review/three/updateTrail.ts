import { LINE_KINDS } from './lineKinds'
import type { SheetObjects } from './sheetObjects'

/**
 * Sets the draw ranges and marker counts for the number of completed actions.
 *
 * @param objects - Objects of the current sheet.
 * @param completed - Number of fully completed actions.
 */
export function updateTrail(objects: SheetObjects, completed: number): void {
  for (const kind of LINE_KINDS) {
    const batch = objects.buffers?.lines.get(kind)
    const total = batch?.segments ?? 0
    const before = batch ? batch.segmentsBefore[Math.min(completed, batch.segmentsBefore.length - 1)] : 0
    objects.trail.get(kind)?.geometry.setDrawRange(0, before * 2)
    objects.ghost.get(kind)?.geometry.setDrawRange(before * 2, (total - before) * 2)
  }
  const pierces = objects.buffers?.pierces.before
  const tabs = objects.buffers?.tabs.before
  objects.pierceTrail.count = pierces ? pierces[Math.min(completed, pierces.length - 1)] : 0
  objects.tabTrail.count = tabs ? tabs[Math.min(completed, tabs.length - 1)] : 0
}
