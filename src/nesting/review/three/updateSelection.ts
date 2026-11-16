import { sampleActionPath } from '../../linking/actionPath'
import type { ReviewSelection, ReviewSheet } from '../types'
import type { SheetObjects } from './sheetObjects'

type Ring = readonly { x: number; y: number }[]

const ringsOf = (sheet: ReviewSheet, selection: ReviewSelection | null): readonly Ring[] => {
  if (!selection || selection.sheetId !== sheet.id) return []
  if (selection.kind === 'part') return sheet.parts.find((part) => part.key === selection.partKey)?.outlines ?? []
  const action = sheet.timeline?.actions[selection.actionIndex]
  return action ? [sampleActionPath(action.points, action.curve)] : []
}

/**
 * Redraws the selection highlight when the selection changed.
 *
 * @param objects - Objects of the current sheet.
 * @param sheet - Sheet being shown.
 * @param selection - Current selection.
 */
export function updateSelection(objects: SheetObjects, sheet: ReviewSheet, selection: ReviewSelection | null): void {
  const key = JSON.stringify(selection)
  if (key === objects.selectionKey) return
  objects.selectionKey = key
  const array = objects.selectionAttribute.array as Float32Array
  let used = 0
  for (const ring of ringsOf(sheet, selection)) {
    for (let step = 1; step < ring.length && (used + 1) * 6 <= array.length; step += 1) {
      array.set([ring[step - 1].x, ring[step - 1].y, 0.2, ring[step].x, ring[step].y, 0.2], used * 6)
      used += 1
    }
  }
  objects.selectionAttribute.needsUpdate = true
  objects.selection.geometry.setDrawRange(0, used * 2)
}
