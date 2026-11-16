import type { DialectValue, MachineConfiguration } from './types'

/**
 * Read a dialect parameter of a configuration.
 *
 * @param configuration - Machine configuration.
 * @param key - Parameter name.
 * @returns The value, or `undefined` when the parameter is absent (never a default from another machine).
 */
export function dialectValue(configuration: MachineConfiguration, key: string): DialectValue | undefined {
  return configuration.dialect[key]?.value
}
