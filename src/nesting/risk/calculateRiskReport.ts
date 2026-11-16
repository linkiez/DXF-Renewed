import type { Observable } from 'rxjs'
import { observeFlow } from '../async/observableFlow'
import type { CanonicalInput } from '../erp/canonical'
import { digestCanonical } from '../erp/digest'
import { erpNestingArtifactSchema } from '../erp/schemas'
import type { ErpDigest } from '../erp/types'
import { assessCutRisk } from './assessCutRisk'
import type { RiskReport, RiskRequest } from './types'

const asCanonical = (value: unknown): CanonicalInput => JSON.parse(JSON.stringify(value ?? null)) as CanonicalInput

const profileDigest = async (profile: unknown): Promise<ErpDigest> => {
  try {
    return await digestCanonical(asCanonical(profile))
  } catch {
    return digestCanonical(null)
  }
}

const build = async (request: RiskRequest): Promise<RiskReport> => {
  const artifact = erpNestingArtifactSchema.safeParse(request?.artifact)
  if (!artifact.success) throw new TypeError(`invalid risk request: ${artifact.error.message}`)
  const withoutDigest = {
    contractVersion: 1 as const,
    correlation: request.artifact.correlation,
    artifactDigests: { input: request.artifact.inputDigest, output: request.artifact.outputDigest },
    profileDigest: await profileDigest(request.profile),
    ...assessCutRisk(request),
  }
  return { ...withoutDigest, digest: await digestCanonical(asCanonical(withoutDigest)) }
}

/**
 * Assesses a cut plan and returns one auditable report as a cold Observable that emits and completes.
 *
 * Nothing runs before subscription. An invalid profile yields an `unavailable` report with specific
 * notices; an artifact that fails the ERP schema has no correlation or digests to report and rejects
 * the Observable, like the ERP and cost flows. The report carries the artifact correlation and
 * digests, the digest of the profile and its own digest, and is identical for identical inputs.
 *
 * @param request - Artifact, optional cut layout, cut plan and risk profile.
 * @returns Observable that emits one `RiskReport`.
 * @example
 * ```typescript
 * const report = await firstValueFrom(calculateRiskReport({ artifact, layout, cutPlan, profile }))
 * ```
 */
export function calculateRiskReport(request: RiskRequest): Observable<RiskReport> {
  return observeFlow(() => build(request))
}
