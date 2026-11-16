import type { CutActionKind } from '../../cutPath'
import type { MachineKind, Units, ValidationIssue } from '../types'

/** How well a configuration value is known. Only `approved` lets a critical value pass the release gate. */
export type ValueClassification =
  | 'observed'
  | 'user-confirmed'
  | 'vendor-confirmed'
  | 'approved'
  | 'inferred'

/** Evidence of one configuration value. */
export interface ValueSource {
  /** Evidence class of the value. */
  readonly classification: ValueClassification
  /** Document, file or confirmation that holds the evidence; never empty. */
  readonly reference: string
  /** Person or document that confirmed the value, for the confirmed and approved classes. */
  readonly confirmedBy?: string
  /** Free text, for example a known conflict between sources. */
  readonly note?: string
}

/** A configuration value together with its evidence. */
export interface Sourced<T> {
  readonly value: T
  readonly source: ValueSource
}

/** Table corner that is the machine zero. */
export type FrameOrigin = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'

/** Rotation of the sheet and zero corner that map nesting coordinates into the machine frame. */
export interface MachineFrame {
  /** Counter-clockwise rotation about the sheet's bottom-left corner, in degrees. */
  readonly rotationDegrees: 0 | 90 | 180 | 270
  /** Table corner that is the machine zero after the rotation. */
  readonly origin: FrameOrigin
}

/** Work envelope in machine coordinates. */
export interface Envelope {
  readonly minX: number
  readonly maxX: number
  readonly minY: number
  readonly maxY: number
}

/** One quality-to-selector association of a process mapping. */
export interface ProcessMappingEntry {
  /** Value of the action metadata key. */
  readonly value: string
  /** First selector value. */
  readonly p: number
  /** Second selector value, when the process has one. */
  readonly q?: number
}

/** Approved association from a process or quality to the selector values a dialect writes. */
export interface ProcessMapping {
  /** Name of the action metadata that selects the process. */
  readonly key: string
  readonly entries: readonly ProcessMappingEntry[]
  /** Whether the second selector value is omitted when an entry has none. */
  readonly omitQ: 'never' | 'when-undefined'
}

/** A controller setting the program relies on. */
export interface ControllerPrecondition {
  readonly id: string
  readonly text: string
  readonly source: ValueSource
}

/** A macro or subprogram the program calls and does not define. */
export interface ExternalDependency {
  readonly name: string
  readonly source: ValueSource
}

/** Scalar or list value of a dialect parameter. */
export type DialectValue = number | string | readonly string[]

/** Physical and dialect facts of one machine, with the evidence of each critical value. */
export interface MachineConfiguration {
  readonly configurationId: string
  readonly revision: string
  readonly name: string
  readonly machineKind: MachineKind
  readonly processorId: string
  readonly processorRevision: string
  readonly units: Sourced<Units>
  readonly envelope: Sourced<Envelope>
  readonly frame: Sourced<MachineFrame>
  readonly table: Sourced<{ readonly width: number; readonly height: number }>
  readonly deadZone?: Sourced<number>
  readonly rapidFeed: Sourced<number>
  readonly arcCenter: Sourced<'incremental' | 'absolute'>
  readonly decimals: Sourced<number>
  readonly trailingZeros: Sourced<boolean>
  readonly output: {
    readonly extension: Sourced<string>
    readonly lineEnding: Sourced<'lf' | 'crlf'>
  }
  readonly operations: Sourced<readonly CutActionKind[]>
  readonly dialect: Readonly<Record<string, Sourced<DialectValue>>>
  readonly processMapping?: Sourced<ProcessMapping>
  readonly externalDependencies: readonly ExternalDependency[]
  readonly controllerPreconditions: readonly ControllerPrecondition[]
}

/** Validation issue of a machine configuration, with the path of the failing value. */
export interface ConfigurationIssue extends ValidationIssue {
  /** Dotted path of the failing value inside the configuration. */
  readonly path: string
}

/** Stable public summary of a configuration. */
export interface MachineConfigurationSummary {
  readonly configurationId: string
  readonly name: string
  readonly machineKind: MachineKind
  readonly processorId: string
  readonly processorRevision: string
  readonly revision: string
}

/** Request-specific data that completes a configuration into a machine profile. */
export interface ProfileRequest {
  readonly sheet: Readonly<{ width: number; height: number; margin: number }>
  readonly profileRevision?: string
  readonly maxFeed?: number
  readonly processSettings?: Readonly<Record<string, boolean | number | string>>
  readonly expectedOutput?: string
}
