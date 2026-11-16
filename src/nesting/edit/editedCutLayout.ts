import { computeBoundingBox } from '../polygonUtils'
import type { CutContour, CutLayout } from '../cutPath/types'
import type { EditState, WorkingPart } from './types'

const retarget = (contour: CutContour, part: WorkingPart, ring: WorkingPart['outlines'][number]): CutContour => {
  const bbox = computeBoundingBox(ring)
  return {
    ...contour,
    placement: { ...contour.placement, x: bbox.minX, y: bbox.minY, rotation: part.placement.rotation, bbox, transformedVertices: ring },
  }
}

const moved = (state: EditState): Map<string, { part: WorkingPart; ring: WorkingPart['outlines'][number] }> => {
  const found = new Map<string, { part: WorkingPart; ring: WorkingPart['outlines'][number] }>()
  for (const part of state.working.parts.values()) {
    if (part === state.baseWorking.parts.get(part.key)) continue
    part.contourIds.forEach((id, position) => {
      if (id && part.outlines[position]) found.set(id, { part, ring: part.outlines[position] })
    })
  }
  return found
}

/**
 * Produces the cut layout at the cursor of a session: every contour of an edited part, outer and
 * inner, carries the edited placement; other contours, sheets and the start point are unchanged.
 *
 * @param state - Session state.
 * @returns The edited layout, or `null` when the session had no cut layout.
 */
export function editedCutLayout(state: EditState): CutLayout | null {
  const base = state.input.layout
  if (!base) return null
  const changes = moved(state)
  if (changes.size === 0) return base
  return {
    ...base,
    contours: base.contours.map((contour) => {
      const change = changes.get(contour.id)
      return change ? retarget(contour, change.part, change.ring) : contour
    }),
  }
}
