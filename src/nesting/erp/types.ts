import type { Observable } from 'rxjs'
import type { NestRequest, NestResponse, NestingAlgorithm } from '../types'

export const ERP_CONTRACT_VERSION = 1

/** Terminal outcome emitted by the stateless ERP calculation. */
export type ErpArtifactStatus = 'complete' | 'partial' | 'rejected'
export type ErpIssueSeverity = 'warning' | 'rejection'

/** ERP identifiers preserved on every emitted artifact. */
export interface ErpCorrelation {
  orderId: string
  revisionId: string
  requestId: string
}

/** Caller-provided machine capability snapshot. */
export interface ErpSnapshot {
  id: string
  revision: string
  capabilities: Record<string, string | number | boolean>
}

/** Caller-provided manufacturing process snapshot. */
export interface ErpProcessProfile {
  id: string
  revision: string
  settings: Record<string, string | number | boolean>
}

/** Complete nesting input delegated to the existing nesting engine. */
export interface ErpNestingJob {
  parts: NestRequest['parts']
  stock: NestRequest['stock']
  machine: ErpSnapshot
  processProfile: ErpProcessProfile
  nesting: Pick<
    NestRequest,
    'edgeClearance' | 'partToPartClearance' | 'objective' | 'acceleration'
  > & {
    algorithm?: NestingAlgorithm
    allowedRotations?: number[]
  }
}

/** Versioned, self-contained ERP nesting request. */
export interface ErpNestingRequest {
  contractVersion: number
  correlation: ErpCorrelation
  job: ErpNestingJob
  seed: number
  overrides?: Record<string, string | number | boolean>
  requestedAt?: string
}

/** Machine-readable warning or rejection reported by the contract. */
export interface ErpIssue {
  severity: ErpIssueSeverity
  code: string
  message: string
  path?: string
}

/** Specific part quantity that could not be placed. */
export interface ErpUnplacedItem {
  itemId: string
  quantity: number
  reasonCode: string
  reason: string
}

/** Deterministic digest produced by the contract. */
export interface ErpDigest {
  algorithm: 'sha256'
  value: string
}

/** Serializable terminal artifact returned by the ERP flow. */
export interface ErpNestingArtifact {
  contractVersion: number
  correlation: ErpCorrelation
  status: ErpArtifactStatus
  snapshots: {
    machine: ErpSnapshot
    stock: ErpNestingJob['stock']
    processProfile: ErpProcessProfile
  }
  layout: NestResponse | null
  warnings: ErpIssue[]
  rejections: ErpIssue[]
  unplaced: ErpUnplacedItem[]
  overrides: Record<string, string | number | boolean>
  inputDigest: ErpDigest
  outputDigest: ErpDigest
}

/** Public Observable entry point for ERP nesting calculations. */
export type ErpNestingFlow = (
  request: ErpNestingRequest,
) => Observable<ErpNestingArtifact>
