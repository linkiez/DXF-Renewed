import { enclosedGroup } from './enclosedGroup'
import { pivotOf } from './pivotOf'
import { transformPart } from './transformPlacement'
import type { CandidateEdit, WorkingLayout, WorkingPart } from './types'

/** A part and its enclosed group after a candidate edit. */
export interface TransformedMembers {
  /** The edited part first, then the parts enclosed in its holes, all transformed. */
  parts: WorkingPart[]
  /** Keys of the enclosed parts. */
  group: string[]
  /** False when the holes of the part could not be determined. */
  known: boolean
}

/**
 * Transforms the edited part together with the parts enclosed in its holes, about the same pivot.
 *
 * @param working - Layout the edit applies to.
 * @param edit - Candidate edit.
 * @returns The transformed parts, the group keys and whether the group is known.
 * @throws {RangeError} When the part key is not in the layout.
 */
export function transformMembers(working: WorkingLayout, edit: CandidateEdit): TransformedMembers {
  const host = working.parts.get(edit.partKey)
  if (!host) throw new RangeError(`unknown part: ${edit.partKey}`)
  const { keys, known } = enclosedGroup(host, working)
  const pivot = pivotOf(host)
  const members = [host, ...keys.flatMap((key) => working.parts.get(key) ?? [])]
  return { parts: members.map((member) => transformPart(member, edit, pivot)), group: keys, known }
}
