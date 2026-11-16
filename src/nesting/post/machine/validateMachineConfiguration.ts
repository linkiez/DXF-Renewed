import { resolvePostProcessor } from '../registry'
import { message } from './messages'
import { machineConfigurationSchema } from './schemas'
import type { ConfigurationIssue, MachineConfiguration } from './types'

const issue = (code: string, path: string, text: string): ConfigurationIssue => ({
  severity: 'error',
  code,
  message: text,
  path,
})

function valueAt(root: unknown, path: ReadonlyArray<string | number | symbol>): unknown {
  let node: unknown = root
  for (const part of path) {
    if (node === null || typeof node !== 'object') return undefined
    node = (node as Record<string | number | symbol, unknown>)[part]
  }
  return node
}

function structureIssues(configuration: unknown): ConfigurationIssue[] {
  const parsed = machineConfigurationSchema.safeParse(configuration)
  if (parsed.success) return []
  return parsed.error.issues.map((zodIssue) => {
    const path = zodIssue.path.map(String).join('.')
    const found = valueAt(configuration, zodIssue.path)
    if (zodIssue.path.includes('source')) return issue('CONFIG_SOURCE_MISSING', path, message('CONFIG_SOURCE_MISSING', { path }))
    if (found === undefined || found === '') return issue('CONFIG_FIELD_MISSING', path, message('CONFIG_FIELD_MISSING', { path }))
    return issue('CONFIG_FIELD_INVALID', path, message('CONFIG_FIELD_INVALID', { path, detail: zodIssue.message }))
  })
}

function envelopeIssues(configuration: MachineConfiguration): ConfigurationIssue[] {
  const envelope = configuration.envelope?.value
  if (!envelope) return []
  const bad = !(envelope.minX < envelope.maxX) || !(envelope.minY < envelope.maxY)
  return bad ? [issue('CONFIG_ENVELOPE_INVALID', 'envelope.value', message('CONFIG_ENVELOPE_INVALID', { path: 'envelope.value' }))] : []
}

function mappingIssues(configuration: MachineConfiguration): ConfigurationIssue[] {
  const mapping = configuration.processMapping?.value
  if (!mapping) return []
  const issues: ConfigurationIssue[] = []
  const entries = 'processMapping.value.entries'
  const values = mapping.entries.map((entry) => entry.value)
  if (new Set(values).size !== values.length) {
    issues.push(issue('CONFIG_MAPPING_INVALID', entries, message('CONFIG_MAPPING_INVALID', { path: entries, detail: 'valores repetidos' })))
  }
  if (mapping.entries.some((entry) => entry.p < 0 || (entry.q !== undefined && entry.q < 0))) {
    issues.push(issue('CONFIG_MAPPING_INVALID', entries, message('CONFIG_MAPPING_INVALID', { path: entries, detail: 'p e q não podem ser negativos' })))
  }
  if (mapping.omitQ !== 'never' && mapping.omitQ !== 'when-undefined') {
    const path = 'processMapping.value.omitQ'
    issues.push(issue('CONFIG_MAPPING_INVALID', path, message('CONFIG_MAPPING_INVALID', { path, detail: 'use "never" ou "when-undefined"' })))
  }
  return issues
}

function processorIssues(configuration: MachineConfiguration): ConfigurationIssue[] {
  const { processorId, processorRevision } = configuration
  if (!processorId || !processorRevision || resolvePostProcessor(processorId, processorRevision)) return []
  return [issue('CONFIG_UNKNOWN_PROCESSOR', 'processorId', message('CONFIG_UNKNOWN_PROCESSOR', { id: processorId, revision: processorRevision }))]
}

/**
 * Validate a machine configuration.
 *
 * Returns every issue with the dotted path of the failing value and never throws for invalid data.
 *
 * @param configuration - Configuration to validate.
 * @returns The issues; empty when the configuration is valid.
 */
export function validateMachineConfiguration(configuration: MachineConfiguration): readonly ConfigurationIssue[] {
  const structural = structureIssues(configuration)
  if (structural.length > 0 || configuration === null || typeof configuration !== 'object') return structural
  return [...envelopeIssues(configuration), ...mappingIssues(configuration), ...processorIssues(configuration)]
}
