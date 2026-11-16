import { criticalPaths } from './criticalPaths'
import { message } from './messages'
import type { ConfigurationIssue, MachineConfiguration } from './types'

function nodeAt(configuration: MachineConfiguration, path: string): { source?: { classification?: string } } | undefined {
  let node: unknown = configuration
  for (const part of path.split('.')) {
    if (node === null || typeof node !== 'object') return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return node as { source?: { classification?: string } } | undefined
}

/**
 * List the critical values of a configuration that block the release of a program.
 *
 * Each critical value that is absent gives `CONFIG_FIELD_MISSING`; each one that is not `approved` gives
 * `UNAPPROVED_VALUE`. Non-critical values never produce an issue.
 *
 * @param processorId - Processor whose critical values are checked.
 * @param configuration - Configuration to check.
 * @returns The blocking issues.
 */
export function releaseIssues(processorId: string, configuration: MachineConfiguration): readonly ConfigurationIssue[] {
  const issues: ConfigurationIssue[] = []
  for (const path of criticalPaths(processorId)) {
    const node = nodeAt(configuration, path)
    const classification = node?.source?.classification
    if (node === undefined) {
      issues.push({ severity: 'error', code: 'CONFIG_FIELD_MISSING', path, message: message('CONFIG_FIELD_MISSING', { path }) })
    } else if (classification !== 'approved') {
      issues.push({ severity: 'error', code: 'UNAPPROVED_VALUE', path, message: message('UNAPPROVED_VALUE', { path, classification: classification ?? 'sem classificação' }) })
    }
  }
  return issues
}
