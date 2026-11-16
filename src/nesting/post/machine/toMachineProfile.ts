import type { MachineProfile } from '../types'
import type { MachineConfiguration, ProfileRequest } from './types'

/**
 * Build a machine profile from a configuration and the data of one request.
 *
 * The configuration is attached to the profile and never copied or changed. The feed limit defaults to the
 * rapid feed of the configuration and can be lowered or raised by the request.
 *
 * @param configuration - Machine configuration.
 * @param request - Sheet, optional revision, feed limit, process settings and reviewed output.
 * @returns Profile for `generateMachineProgram`.
 */
export function toMachineProfile(configuration: MachineConfiguration, request: ProfileRequest): MachineProfile {
  const capabilities: Record<string, boolean> = {}
  for (const kind of configuration.operations.value) capabilities[kind] = true
  return {
    machineId: configuration.configurationId,
    machineKind: configuration.machineKind,
    processorId: configuration.processorId,
    processorRevision: configuration.processorRevision,
    profileRevision: request.profileRevision ?? configuration.revision,
    units: configuration.units.value,
    sheet: request.sheet,
    maxFeed: request.maxFeed ?? configuration.rapidFeed.value,
    arcSupport: true,
    capabilities,
    ...(request.processSettings ? { processSettings: request.processSettings } : {}),
    ...(request.expectedOutput !== undefined ? { expectedOutput: request.expectedOutput } : {}),
    configuration,
  }
}
