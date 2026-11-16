import { EPSILON } from '../config'
import { angleDistanceMod180 } from '../trueShape/rotations'
import type { CandidateEdit, EditState, PartConstraint, Violation, WorkingPart } from './types'
import { violation } from './violation'

const FULL_TURN = 360

const sameAngle = (a: number, b: number): boolean => {
  const diff = (((a - b) % FULL_TURN) + FULL_TURN) % FULL_TURN
  return Math.min(diff, FULL_TURN - diff) < EPSILON
}

const grainViolation = (rule: PartConstraint | undefined, next: number, partKey: string): Violation[] =>
  rule?.grainLocked && rule.grainAngle !== undefined && angleDistanceMod180(next, rule.grainAngle) >= EPSILON
    ? [violation('GRAIN_LOCKED', { partKey, limit: rule.grainAngle })]
    : []

const rotationViolations = (state: EditState, host: WorkingPart, degrees: number): Violation[] => {
  const rules = state.input.constraints
  const rule = rules?.parts?.[host.shapeId]
  const allowed = rule?.allowedRotations ?? rules?.allowedRotations
  const partKey = host.key
  if (!allowed) return [violation('CONSTRAINTS_UNKNOWN', { partKey, detail: 'rotação' })]
  const next = (((host.placement.rotation + degrees) % FULL_TURN) + FULL_TURN) % FULL_TURN
  if (!allowed.some((angle) => sameAngle(angle, next))) return [violation('ROTATION_NOT_ALLOWED', { partKey, value: next })]
  return grainViolation(rule, next, partKey)
}

const mirrorViolations = (state: EditState, host: WorkingPart): Violation[] => {
  const rules = state.input.constraints
  if (!rules) return [violation('CONSTRAINTS_UNKNOWN', { partKey: host.key, detail: 'espelhamento' })]
  return rules.parts?.[host.shapeId]?.mirrorable ? [] : [violation('MIRROR_NOT_ALLOWED', { partKey: host.key })]
}

/**
 * Judges the orientation rules of a candidate edit: allowed rotations, grain direction and
 * mirroring. A move has none; a part whose outline is only a box can only move.
 *
 * @param state - Session state, carrying the constraints.
 * @param host - The part being edited.
 * @param edit - Candidate edit.
 * @returns The orientation violations, empty when the edit is allowed.
 */
export function orientationViolations(state: EditState, host: WorkingPart, edit: CandidateEdit): Violation[] {
  if (edit.kind === 'move') return []
  if (host.approximate) return [violation('OUTLINE_UNAVAILABLE', { partKey: host.key })]
  return edit.kind === 'rotate' ? rotationViolations(state, host, edit.delta.degrees) : mirrorViolations(state, host)
}
