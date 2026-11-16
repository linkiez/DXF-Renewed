import { BUILT_IN_CONFIGURATIONS } from './builtInConfigurations'
import type { MachineConfiguration } from './types'

/**
 * Get a built-in machine configuration by identifier.
 *
 * The result is a deep copy: changing it never changes the built-in data. No other machine is used as a fallback.
 *
 * @param configurationId - Identifier such as `talvi-6000w`.
 * @returns The configuration, or `undefined` when the identifier is unknown.
 */
export function getMachineConfiguration(configurationId: string): MachineConfiguration | undefined {
  const found = BUILT_IN_CONFIGURATIONS.get(configurationId)
  return found ? structuredClone(found) : undefined
}
