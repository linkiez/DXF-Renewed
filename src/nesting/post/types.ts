import type { CutAction, CutPlan } from '../cutPath'

/** Supported machine families. */
/** Supported machine families for built-in processors. */
export type MachineKind = 'laser' | 'plasma'
/** Coordinate units accepted by a machine profile. */
export type Units = 'mm' | 'inch'

/** Immutable machine and processor configuration supplied by the host application. */
export interface MachineProfile {
  readonly machineId: string
  readonly machineKind: MachineKind
  readonly processorId: string
  readonly processorRevision: string
  readonly profileRevision: string
  readonly units: Units
  readonly sheet: Readonly<{ width: number; height: number; margin: number }>
  readonly maxFeed: number
  readonly arcSupport: boolean
  readonly curveLinearizationTolerance?: number
  readonly capabilities: Readonly<Record<string, boolean | number | string>>
  readonly processSettings?: Readonly<Record<string, boolean | number | string>>
  readonly feed?: number
  readonly power?: number
  readonly amperage?: number
  readonly pierceDwellMs?: number
  readonly thc?: boolean
  /**
   * Reviewed output supplied by the caller or a host-level fixture adapter.
   * The post-processing library never reads files to resolve it.
   */
  readonly expectedOutput?: string
  /** @deprecated Use expectedOutput or an application-level fixture adapter. */
  readonly fixtureName?: string
  readonly lineNumbers?: boolean
}

/** Structured validation result that blocks release when severity is `error`. */
export interface ValidationIssue {
  readonly severity: 'error' | 'warning'
  readonly code: string
  readonly message: string
  readonly actionIndex?: number
  readonly contourId?: string
}

/** Context passed from orchestration to a processor. */
export interface PostProcessingContext {
  readonly profile: MachineProfile
  readonly linearizedPlan: CutPlan
}

export type PostContext = PostProcessingContext

/** Stable public summary for a registered processor revision. */
export interface PostProcessorSummary {
  readonly id: string
  readonly name: string
  readonly revision: string
  readonly machineKind: MachineKind
}

/** Versioned processor contract for validation and deterministic emission. */
export interface PostProcessor extends PostProcessorSummary {
  readonly validate: (
    plan: CutPlan,
    context: PostProcessingContext,
  ) => readonly ValidationIssue[]
  readonly emit: (
    plan: CutPlan,
    context: PostProcessingContext,
  ) => string
}

/** Generated machine output and its release decision. */
export interface MachineProgram {
  readonly gcode: string
  readonly releasable: boolean
  readonly processorName: string
  readonly processorId: string
  readonly processorRevision: string
  readonly profileRevision: string
  readonly validationIssues: readonly ValidationIssue[]
  readonly expectedOutputMatched: boolean
}

/** Legacy context shape retained for additive API compatibility. */
export interface PostProcessorContext {
  readonly plan: CutPlan
  readonly profile: MachineProfile
}

/** Alias for callers that model actions independently from CutPlan. */
export type PostAction = CutAction
