import { EPSILON } from '../config'
import type { CutPlan } from '../cutPath'
import type { MachineProfile, PostProcessor, ValidationIssue } from './types'

const error = (code: string, message: string, actionIndex?: number): ValidationIssue => ({
  severity: 'error',
  code,
  message,
  ...(actionIndex === undefined ? {} : { actionIndex }),
})

/**
 * Validate machine profile values before selecting a processor.
 *
 * @param profile - Profile to validate.
 * @returns Structured profile issues.
 */
export function validateMachineProfile(profile: MachineProfile): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (!profile.machineId) issues.push(error('PROFILE_MACHINE_ID', 'machineId is required.'))
  if (!profile.processorId) issues.push(error('PROFILE_PROCESSOR_ID', 'processorId is required.'))
  if (!profile.processorRevision) issues.push(error('PROFILE_PROCESSOR_REVISION', 'processorRevision is required.'))
  if (!profile.profileRevision) issues.push(error('PROFILE_REVISION', 'profileRevision is required.'))
  if (!(profile.sheet.width > 0 && profile.sheet.height > 0 && profile.sheet.margin >= 0)) {
    issues.push(error('PROFILE_BOUNDS', 'Sheet dimensions must be positive and margin non-negative.'))
  }
  if (!(profile.maxFeed > 0 && Number.isFinite(profile.maxFeed))) {
    issues.push(error('FEED_INVALID', 'maxFeed must be finite and positive.'))
  }
  if (!profile.arcSupport && profile.curveLinearizationTolerance !== undefined &&
      !(profile.curveLinearizationTolerance > EPSILON && Number.isFinite(profile.curveLinearizationTolerance))) {
    issues.push(error('CURVE_TOLERANCE_INVALID', 'Curve linearization tolerance must be finite and positive.'))
  }
  return issues
}

/** Validate generic action constraints shared by all processors. */
export function validateEmittedPlan(plan: CutPlan, profile: MachineProfile): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = []
  let pierced = false
  plan.actions.forEach((action, actionIndex) => {
    if (action.curve) {
      const curve = action.curve as {
        type?: string
        center?: { x: number; y: number }
        controlPoints?: readonly { x: number; y: number }[]
      }
      const supportedType = curve.type === 'arc' || curve.type === 'bezier'
      if (!supportedType) {
        issues.push(error('CURVE_UNSUPPORTED', `Curve type "${curve.type ?? 'unknown'}" is not supported.`, actionIndex))
      } else if (curve.type === 'arc' && (
        !curve.center ||
        !Number.isFinite(curve.center.x) ||
        !Number.isFinite(curve.center.y) ||
        action.points.length < 2
      )) {
        issues.push(error('CURVE_MALFORMED', 'Arc movement requires finite center and endpoints.', actionIndex))
      } else if (curve.type === 'bezier' && (
        !curve.controlPoints ||
        curve.controlPoints.length === 0 ||
        action.points.length < 2 ||
        curve.controlPoints.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))
      )) {
        issues.push(error('CURVE_MALFORMED', 'Bezier movement requires finite endpoints and control points.', actionIndex))
      } else if (!profile.arcSupport && profile.curveLinearizationTolerance === undefined) {
        issues.push(error('CURVE_TOLERANCE_REQUIRED', 'Curved movement requires an approved linearization tolerance.', actionIndex))
      } else if (!profile.arcSupport) {
        issues.push(error('CURVE_UNSUPPORTED', 'Curved movement was not linearized for this processor.', actionIndex))
      } else if (curve.type !== 'arc') {
        issues.push(error('CURVE_UNSUPPORTED', 'Bezier movement is not supported by this processor.', actionIndex))
      }
    }
    for (const point of action.points) {
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        issues.push(error('GEOMETRY_INVALID', 'Action contains a non-finite coordinate.', actionIndex))
      }
      const maxX = profile.sheet.width - profile.sheet.margin
      const maxY = profile.sheet.height - profile.sheet.margin
      if (point.x < profile.sheet.margin - EPSILON || point.y < profile.sheet.margin - EPSILON ||
          point.x > maxX + EPSILON || point.y > maxY + EPSILON) {
        issues.push(error('OUT_OF_BOUNDS', 'Action point is outside the machine sheet bounds.', actionIndex))
      }
    }
    if (action.kind === 'pierce') pierced = true
    if (action.kind === 'cut' && !pierced) issues.push(error('MISSING_PIERCE', 'Cut action requires a preceding pierce.', actionIndex))
    if (action.kind === 'rapid' && action.metadata?.thc === true) issues.push(error('THC_ON_RAPID', 'THC cannot be enabled during rapid motion.', actionIndex))
    const feed = action.metadata?.feed
    if (typeof feed === 'number' && (!(feed > 0) || feed > profile.maxFeed)) {
      issues.push(error('FEED_INVALID', 'Action feed must be positive and not exceed maxFeed.', actionIndex))
    }
  })
  return issues
}

/** Validate processor-specific and shared constraints. */
export function validateProcessor(
  processor: PostProcessor,
  plan: CutPlan,
  profile: MachineProfile,
): readonly ValidationIssue[] {
  const context = { profile, linearizedPlan: plan }
  return [...validateEmittedPlan(plan, profile), ...processor.validate(plan, context)]
}
