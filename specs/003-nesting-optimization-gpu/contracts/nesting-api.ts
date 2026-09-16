/**
 * Public contract additions for nesting optimization and GPU acceleration (spec 003).
 *
 * These types are additive to the feature-002 contract in
 * `specs/002-true-shape-nesting/contracts/nesting-api.ts`. An existing caller that supplies only
 * the feature-002 fields keeps compiling and keeps its behavior: `acceleration` defaults to `true`
 * but the result for a given seed is identical on either backend (FR-003 / SC-001).
 */
import type { NestRequest, NestResponse } from '../../../src/nesting'

/** Caller-selected weights for the competing layout outcomes (FR-001). */
export interface OptimizationObjective {
  /** Weight for material use. Finite, >= 0. */
  materialUse: number
  /** Weight for machine travel. Finite, >= 0. */
  travel: number
  /** Weight for sheet count. Finite, >= 0. */
  sheetCount: number
  /** Weight for remnant preference. Finite, >= 0. */
  remnant: number
}

/** Which calculation path produced a result (FR-007). */
export type ExecutionBackend = 'cpu' | 'webgpu'

/** Backend selection, timing and fallback information (FR-007). */
export interface ExecutionBackendReport {
  /** Path actually used. */
  backend: ExecutionBackend
  /** Effective value of the `acceleration` request field after defaulting. */
  requested: boolean
  /** `true` when `backend === 'webgpu'`. */
  accelerated: boolean
  /** Explicit reason when acceleration was requested but not used (FR-006). */
  fallbackReason?: string
  /** Measurement only; never a search budget. */
  timings: {
    /** Milliseconds spent scoring candidates. */
    scoringMs: number
    /** Total milliseconds for the job. */
    totalMs: number
  }
}

/** Feature-003 request fields, merged additively onto `NestRequest`. */
export interface OptimizationRequest {
  /** Optional weighted objective. Omitted means material-use-only (feature-002 behavior). */
  objective?: OptimizationObjective
  /**
   * Optional acceleration toggle. Default `true`: detect and prefer WebGPU when available.
   * `false` runs entirely on the CPU baseline without attempting acceleration (FR-004).
   */
  acceleration?: boolean
}

/** Feature-003 response fields, merged additively onto `NestResponse`. */
export interface OptimizationResponse {
  /** Backend report; present whenever a job is processed (FR-007). */
  backend?: ExecutionBackendReport
}

/** The feature-002 request extended with the feature-003 fields. */
export type OptimizationNestRequest = NestRequest & OptimizationRequest

/** The feature-002 response extended with the feature-003 fields. */
export type OptimizationNestResponse = NestResponse & OptimizationResponse

/**
 * Runs true-shape nesting with the optional weighted objective and optional acceleration.
 * Pure and synchronous from the caller's perspective; identical input + seed yields identical
 * `placements` and `sheets` regardless of the selected backend.
 */
export declare function nestOptimized(
  request: OptimizationNestRequest,
): OptimizationNestResponse
