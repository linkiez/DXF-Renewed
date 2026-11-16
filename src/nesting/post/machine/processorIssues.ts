import type { CutPlan } from '../../cutPath'
import type { MachineProfile, ValidationIssue } from '../types'
import { envelopeIssues } from './envelopeIssues'
import { message } from './messages'
import { releaseIssues } from './releaseIssues'
import { validateMachineConfiguration } from './validateMachineConfiguration'

/**
 * Issues common to every dialect processor: the configuration, the release gate and the work envelope.
 *
 * A profile without a configuration gives `CONFIG_FIELD_MISSING` and nothing else.
 *
 * @param processorId - Processor whose critical values gate the release.
 * @param plan - Cut plan in nesting coordinates.
 * @param profile - Machine profile carrying the configuration.
 * @returns The issues.
 */
export function processorIssues(processorId: string, plan: CutPlan, profile: MachineProfile): readonly ValidationIssue[] {
  const { configuration } = profile
  if (!configuration) {
    return [{ severity: 'error', code: 'CONFIG_FIELD_MISSING', message: message('CONFIG_FIELD_MISSING', { path: 'configuration' }) }]
  }
  return [
    ...validateMachineConfiguration(configuration),
    ...releaseIssues(processorId, configuration),
    ...envelopeIssues(plan, configuration, profile.sheet),
  ]
}
