import type { MachineProfile } from '../types'
import type { MachineConfiguration } from './types'
import { validateMachineConfiguration } from './validateMachineConfiguration'

/**
 * The configuration of a profile when it can safely drive an emitter.
 *
 * The orchestrator emits before the processor validates, so emitters call this to avoid throwing on a
 * missing or invalid configuration; the issues are reported by the processor validation.
 *
 * @param profile - Machine profile.
 * @returns The configuration, or `undefined` when it is absent or invalid.
 */
export function usableConfiguration(profile: MachineProfile): MachineConfiguration | undefined {
  const { configuration } = profile
  return configuration && validateMachineConfiguration(configuration).length === 0 ? configuration : undefined
}
