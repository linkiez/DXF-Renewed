import { geometryViolations } from './geometryViolations'
import type { GeometryViolations } from './geometryViolations'
import { orientationViolations } from './orientationViolations'
import { transformMembers } from './transformMembers'
import type { CandidateEdit, EditState, PlacementVerdict, Violation, WorkingPart } from './types'
import { violation } from './violation'

const flatten = (found: GeometryViolations): Violation[] => [...found.overlap, ...found.area, ...found.zone, ...found.spacing]

const groupViolations = (hostKey: string, memberKeys: readonly string[], found: readonly GeometryViolations[]): Violation[] =>
  memberKeys.filter((_, index) => flatten(found[index]).length > 0).map((key) => violation('GROUP_INVALID', { partKey: hostKey, otherPartKey: key }))

/**
 * Judges a candidate move, rotation or mirror of one placed part.
 *
 * The part and the parts enclosed in its holes are judged together against overlap, the usable
 * area, forbidden zones, the minimum spacing and the orientation rules. Every violation is reported
 * in the fixed order overlap, area, forbidden zone, spacing, orientation. The state is never mutated.
 *
 * @param state - Session state.
 * @param edit - Candidate edit.
 * @returns The verdict with the violations, whether it is approximate and the enclosed group.
 * @throws {RangeError} When the part key is not in the session.
 * @example
 * ```typescript
 * const verdict = judgePlacement(state, { partKey: 'part-1#0', kind: 'move', delta: { dx: 5, dy: 0 } })
 * ```
 */
export function judgePlacement(state: EditState, edit: CandidateEdit): PlacementVerdict {
  const { parts, group, known } = transformMembers(state.working, edit)
  const exclude = new Set(parts.map((part) => part.key))
  const found = parts.map((part) => geometryViolations(state, part, exclude))
  const violations = [
    ...found[0].overlap,
    ...found[0].area,
    ...found[0].zone,
    ...found[0].spacing,
    ...orientationViolations(state, state.working.parts.get(edit.partKey) as WorkingPart, edit),
    ...groupViolations(parts[0].key, group, found.slice(1)),
  ]
  const approximate = !known || parts.some((part) => part.approximate) || found.some((item) => item.approximateNeighbour)
  return { valid: violations.length === 0, violations, approximate, group }
}
