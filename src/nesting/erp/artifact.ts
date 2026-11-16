import type { NestResponse } from '../types'
import { digestCanonical } from './digest'
import { outputProjection } from './outputProjection'
import type {
  ErpIssue,
  ErpNestingArtifact,
  ErpNestingRequest,
  ErpUnplacedItem,
} from './types'
import type { CanonicalInput } from './canonical'

export async function createNestingArtifact(
  request: ErpNestingRequest,
  plan: NestResponse,
): Promise<ErpNestingArtifact> {
  const unplaced = plan.unplaced.map<ErpUnplacedItem>((item) => ({
    itemId: item.shapeId,
    quantity: item.quantity,
    reasonCode: 'UNPLACED',
    reason: item.reason,
  }))
  const warnings: ErpIssue[] = []
  const rejections: ErpIssue[] = []
  const status = unplaced.length > 0 ? 'partial' : 'complete'
  const inputDigest = await digestCanonical({
    contractVersion: request.contractVersion,
    job: request.job as CanonicalInput,
    seed: request.seed,
    overrides: request.overrides ?? {},
  })
  const outputDigest = await digestCanonical(outputProjection(request.contractVersion, plan, unplaced))

  return {
    contractVersion: request.contractVersion,
    correlation: request.correlation,
    status,
    snapshots: {
      machine: request.job.machine,
      stock: request.job.stock,
      processProfile: request.job.processProfile,
    },
    layout: plan,
    warnings,
    rejections,
    unplaced,
    overrides: request.overrides ?? {},
    inputDigest,
    outputDigest,
  }
}
