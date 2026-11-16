import type { Observable } from 'rxjs'
import { observeFlow } from '../async/observableFlow'
import type { CanonicalInput } from '../erp/canonical'
import { digestCanonical } from '../erp/digest'
import type { ErpDigest } from '../erp/types'
import { buildCostBreakdown } from './buildCostBreakdown'
import { costMessages } from './messages'
import { costModelSchema, costRequestSchema } from './schemas'
import type { CostModel, CostNotice, CostReport, CostRequest } from './types'

const SEVERITY_RANK: Record<CostNotice['severity'], number> = { error: 0, warning: 1, info: 2 }

const sortNotices = (notices: readonly CostNotice[]): CostNotice[] =>
  [...notices].sort(
    (a, b) =>
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
      a.code.localeCompare(b.code) ||
      (a.partKey ?? '').localeCompare(b.partKey ?? ''),
  )

const asCanonical = (value: unknown): CanonicalInput => JSON.parse(JSON.stringify(value ?? null)) as CanonicalInput

const modelDigest = async (model: unknown): Promise<ErpDigest> => {
  try {
    return await digestCanonical(asCanonical(model))
  } catch {
    return digestCanonical(null)
  }
}

const currencyOf = (model: CostModel | undefined): CostReport['currency'] => ({
  code: String(model?.currency?.code ?? ''),
  minorUnitDigits: Number(model?.currency?.minorUnitDigits ?? 0),
})

const invalidModelNotice = (request: CostRequest): CostNotice | null => {
  const parsed = costModelSchema.safeParse(request.costModel)
  if (parsed.success) return null
  const issue = parsed.error.issues[0]
  const field = issue ? issue.path.join('.') || 'costModel' : 'costModel'
  return { severity: 'error', code: 'INVALID_COST_MODEL', message: costMessages.invalidCostModel(field) }
}

const build = async (request: CostRequest): Promise<CostReport> => {
  const artifact = costRequestSchema.shape.artifact.safeParse(request?.artifact)
  if (!artifact.success) throw new TypeError(`invalid cost request: ${artifact.error.message}`)
  const blocked = invalidModelNotice(request)
  const result = blocked ? { breakdown: null, production: null, notices: [blocked] } : buildCostBreakdown(request)
  const withoutDigest = {
    contractVersion: 1 as const,
    status: result.breakdown ? result.breakdown.job.total.status : ('unavailable' as const),
    correlation: request.artifact.correlation,
    artifactDigests: { input: request.artifact.inputDigest, output: request.artifact.outputDigest },
    costModelDigest: await modelDigest(request.costModel),
    currency: currencyOf(request.costModel),
    breakdown: result.breakdown,
    production: result.production,
    notices: sortNotices(result.notices),
  }
  return { ...withoutDigest, reportDigest: await digestCanonical(asCanonical(withoutDigest)) }
}

/**
 * Calculates one cost report as a cold Observable that emits the report and completes.
 *
 * Nothing is read before subscription. An invalid cost model, a rejected artifact or an unsupported
 * contract version yields an `unavailable` report with specific notices; an artifact that fails the
 * ERP artifact schema has no correlation or digests to report and rejects the Observable, like the
 * ERP nesting flow. The report carries the artifact correlation and digests, the digest of the cost
 * model and its own digest, and is identical for identical inputs.
 *
 * @param request - Artifact, optional layout and cut plan, and the cost model.
 * @returns Observable that emits one `CostReport`.
 * @example
 * ```typescript
 * const report = await firstValueFrom(calculateCostReport({ artifact, layout, cutPlan, costModel }))
 * ```
 */
export function calculateCostReport(request: CostRequest): Observable<CostReport> {
  return observeFlow(() => build(request))
}
