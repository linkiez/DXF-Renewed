import { BUILT_IN_CONFIGURATIONS } from './builtInConfigurations'
import type { MachineConfigurationSummary } from './types'

/**
 * List the built-in machine configurations in a deterministic order.
 *
 * @returns Summaries sorted by identifier.
 */
export function listMachineConfigurations(): readonly MachineConfigurationSummary[] {
  return [...BUILT_IN_CONFIGURATIONS.values()]
    .map(({ configurationId, name, machineKind, processorId, processorRevision, revision }) => ({
      configurationId, name, machineKind, processorId, processorRevision, revision,
    }))
    .sort((left, right) => left.configurationId.localeCompare(right.configurationId))
}
