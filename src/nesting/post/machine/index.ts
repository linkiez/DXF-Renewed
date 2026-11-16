/**
 * Machine configuration API of the modular post-processing.
 *
 * A configuration holds the physical and dialect facts of one machine, each critical value with its evidence.
 * Internal helpers (messages, schemas, release gate, envelope check) are not exported.
 *
 * @module nesting/post/machine
 */

export type {
  ConfigurationIssue,
  ControllerPrecondition,
  DialectValue,
  Envelope,
  ExternalDependency,
  FrameOrigin,
  MachineConfiguration,
  MachineConfigurationSummary,
  MachineFrame,
  ProcessMapping,
  ProcessMappingEntry,
  ProfileRequest,
  Sourced,
  ValueClassification,
  ValueSource,
} from './types'
export { getMachineConfiguration } from './getMachineConfiguration'
export { listMachineConfigurations } from './listMachineConfigurations'
export { mapToMachineFrame } from './mapToMachineFrame'
export { toMachineProfile } from './toMachineProfile'
export { validateMachineConfiguration } from './validateMachineConfiguration'
