import { transformMembers } from './transformMembers'
import type { CandidateEdit, PartEdit, PlacementTransform, WorkingLayout, WorkingPart } from './types'

const transformOf = (part: WorkingPart): PlacementTransform => ({
  x: part.placement.x,
  y: part.placement.y,
  rotation: part.placement.rotation,
  mirrored: part.mirrored,
})

/**
 * Applies an edit to a layout without mutating it: the part and its enclosed group are transformed
 * and the neighbour index of the sheet is updated.
 *
 * @param working - Layout before the edit.
 * @param edit - Candidate edit, already judged valid.
 * @returns The layout after the edit and the log entry with the transform before and after.
 * @throws {RangeError} When the part key is not in the layout.
 */
export function applyEdit(working: WorkingLayout, edit: CandidateEdit): { working: WorkingLayout; edit: PartEdit } {
  const before = working.parts.get(edit.partKey)
  const { parts } = transformMembers(working, edit)
  const nextParts = new Map(working.parts)
  const nextIndex = new Map(working.index)
  for (const part of parts) {
    nextParts.set(part.key, part)
    const index = nextIndex.get(part.sheetId)
    if (index) nextIndex.set(part.sheetId, index.with(part.key, part.placement.bbox))
  }
  const logged = { ...edit, before: transformOf(before as WorkingPart), after: transformOf(parts[0]) } as PartEdit
  return { working: { ...working, parts: nextParts, index: nextIndex }, edit: logged }
}
