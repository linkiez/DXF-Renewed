import { dialectValue } from './dialectValue'
import type { MachineConfiguration } from './types'

/**
 * Read several numeric dialect parameters at once.
 *
 * @param configuration - Machine configuration.
 * @param keys - Parameter names.
 * @returns The values by name, or `undefined` when any of them is absent or not a number.
 */
export function numericDialect<K extends string>(
  configuration: MachineConfiguration,
  keys: readonly K[],
): Record<K, number> | undefined {
  const out = {} as Record<K, number>
  for (const key of keys) {
    const value = dialectValue(configuration, key)
    if (typeof value !== 'number') return undefined
    out[key] = value
  }
  return out
}
