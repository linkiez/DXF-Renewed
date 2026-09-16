/**
 * Public TypeScript contract for stateless ERP nesting calculations.
 */
// fallow-ignore-file unused-file

import type { Observable } from 'rxjs'
import type { NestResponse, PartRequest, StockItem } from '../../../src/nesting/types'

export type ContractStatus = 'complete' | 'partial' | 'rejected' | 'failed'

export interface CorrelationRevision {
  orderId: string
  revisionId: string
  requestId: string
}

export interface MachineSnapshot {
  id: string
  revision: string
  capabilities: Record<string, string | number | boolean>
}

export interface ProcessProfileSnapshot {
  id: string
  revision: string
  settings: Record<string, string | number | boolean>
}

export interface NestingSettings {
  edgeClearance: number
  partToPartClearance: number
  algorithm?: string
  allowedRotations?: number[]
  acceleration?: boolean
}

export interface JobInput {
  parts: PartRequest[]
  stock: StockItem[]
  machine: MachineSnapshot
  processProfile: ProcessProfileSnapshot
  nesting: NestingSettings
}

export interface ErpNestingRequest {
  contractVersion: number
  correlation: CorrelationRevision
  job: JobInput
  seed: number
  overrides?: Record<string, string | number | boolean>
  requestedAt?: string
}

export interface ArtifactIssue {
  code: string
  message: string
  itemId?: string
  severity: 'warning' | 'rejection'
}

export interface UnplacedItem {
  itemId: string
  quantity: number
  reasonCode: string
  reason: string
}

export interface ResourceSnapshots {
  machine: MachineSnapshot
  stock: StockItem[]
  processProfile: ProcessProfileSnapshot
}

export interface Sha256Digest {
  algorithm: 'sha256'
  value: string
}

export interface NestingArtifact {
  contractVersion: number
  status: ContractStatus
  correlation: CorrelationRevision
  snapshots: ResourceSnapshots
  layout: NestResponse | null
  warnings: ArtifactIssue[]
  rejections: ArtifactIssue[]
  unplaced: UnplacedItem[]
  overrides: Record<string, string | number | boolean>
  inputDigest: Sha256Digest
  outputDigest: Sha256Digest
}

export type ErpNestingFlow = (
  request: ErpNestingRequest,
) => Observable<NestingArtifact>
