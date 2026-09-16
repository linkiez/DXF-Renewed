import { canonicalizeGcode } from './canonicalize'
import { linearizeCutPlan } from './linearize'
import { resolvePostProcessor } from './registry'
import { validateEmittedPlan, validateMachineProfile } from './validate'
import type { CutPlan } from '../cutPath'
import type { MachineProfile, MachineProgram, ValidationIssue } from './types'

function issue(code: string, message: string): ValidationIssue {
  return { severity: 'error', code, message }
}

/**
 * Generate a machine program and block release on every error or mismatch.
 *
 * Reviewed output is an explicit input boundary. File or network adapters belong
 * to the host application so this public module remains browser-compatible.
 */
export function generateMachineProgram(plan: CutPlan, profile: MachineProfile): MachineProgram {
  const profileIssues = [...validateMachineProfile(profile)]
  const processor = resolvePostProcessor(profile.processorId, profile.processorRevision)
  const processorName = processor?.name ?? profile.processorId
  if (!processor) profileIssues.push(issue('UNKNOWN_PROCESSOR', `Unknown post-processor ${profile.processorId}@${profile.processorRevision}.`))
  if (processor && processor.machineKind !== profile.machineKind) {
    profileIssues.push(issue('PROCESSOR_KIND_MISMATCH', 'Processor machine kind does not match profile.'))
  }
  const linearizedPlan = linearizeCutPlan(plan, profile)
  const preEmissionIssues = processor ? [...validateEmittedPlan(linearizedPlan, profile)] : []
  const canEmit = ![...profileIssues, ...preEmissionIssues].some((item) => item.severity === 'error')
  const gcode = processor && canEmit ? processor.emit(linearizedPlan, { profile, linearizedPlan }) : ''
  const validationIssues = processor
    ? [...profileIssues, ...preEmissionIssues, ...processor.validate(linearizedPlan, { profile, linearizedPlan })]
    : profileIssues
  if (!profile.arcSupport && profile.curveLinearizationTolerance === undefined &&
      linearizedPlan.actions.some((action) => action.metadata?.curved === true)) {
    validationIssues.push(issue('CURVE_TOLERANCE_REQUIRED', 'Curved movement requires an approved linearization tolerance.'))
  }
  const expected = profile.expectedOutput
  const expectedOutputMatched = expected !== undefined &&
    canonicalizeGcode(gcode) === canonicalizeGcode(expected)
  if (expected === undefined) {
    validationIssues.push(issue('EXPECTED_OUTPUT_REQUIRED', 'A reviewed expected output is required before release.'))
  } else if (!expectedOutputMatched) {
    validationIssues.push(issue('EXPECTED_OUTPUT_MISMATCH', 'Generated G-code does not match the reviewed canonical output.'))
  }
  return {
    gcode: gcode ? canonicalizeGcode(gcode) : '',
    releasable: validationIssues.every((item) => item.severity !== 'error') && expectedOutputMatched,
    processorName,
    processorId: profile.processorId,
    processorRevision: profile.processorRevision,
    profileRevision: profile.profileRevision,
    validationIssues,
    expectedOutputMatched,
  }
}
