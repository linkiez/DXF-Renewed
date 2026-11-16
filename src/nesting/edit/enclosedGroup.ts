import { computeBoundingBox, pointInPolygon } from '../polygonUtils'
import type { WorkingLayout, WorkingPart } from './types'

/** The parts that lie inside the holes of a part and move with it. */
export interface EnclosedGroup {
  keys: string[]
  /** False when the holes of the part cannot be determined, so the group may be incomplete. */
  known: boolean
}

/**
 * Finds the parts enclosed in the holes of a part.
 *
 * The holes come from the inner contours of the cut layout or from the hole placements of a
 * compound part. Without either the group is empty and `known` is false.
 *
 * @param part - Part whose holes are examined.
 * @param working - Layout the part belongs to.
 * @returns Keys of the enclosed parts in artifact order and whether the holes were known.
 */
export function enclosedGroup(part: WorkingPart, working: WorkingLayout): EnclosedGroup {
  if (!part.holesKnown) return { keys: [], known: false }
  const holes = part.outlines.slice(1)
  if (holes.length === 0) return { keys: [], known: true }
  const index = working.index.get(part.sheetId)
  const near = index ? index.query(computeBoundingBox(part.outlines[0]), 0) : []
  const keys = near.filter((key) => {
    const other = working.parts.get(key)
    return key !== part.key && other !== undefined && other.outlines[0].every((vertex) => holes.some((hole) => pointInPolygon(vertex, hole)))
  })
  return { keys, known: true }
}
