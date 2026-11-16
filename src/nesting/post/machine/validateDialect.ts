import type { CutPlan } from '../../cutPath'
import type { MachineProfile, ValidationIssue } from '../types'
import { processorIssues } from './processorIssues'
import type { MachineConfiguration } from './types'

/**
 * Validate a plan for a dialect processor: the common issues plus the dialect's own.
 *
 * The dialect callback runs only when the profile carries a configuration.
 *
 * @param processorId - Processor whose critical values gate the release.
 * @param plan - Cut plan in nesting coordinates.
 * @param profile - Machine profile.
 * @param dialect - Dialect-specific checks, given the configuration.
 * @returns All issues.
 */
export function validateDialect(
  processorId: string,
  plan: CutPlan,
  profile: MachineProfile,
  dialect: (configuration: MachineConfiguration) => readonly ValidationIssue[],
): readonly ValidationIssue[] {
  const base = processorIssues(processorId, plan, profile)
  const { configuration } = profile
  return configuration ? [...base, ...dialect(configuration)] : base
}
