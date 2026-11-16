import { expect } from 'expect'
import { firstValueFrom, toArray } from 'rxjs'
import { calculateCostReport } from '../../../../src/nesting/cost/calculateCostReport'
import { buildCostBreakdown } from '../../../../src/nesting/cost/buildCostBreakdown'
import type { CostReport, CostRequest } from '../../../../src/nesting/cost/types'
import { canonicalize } from '../../../../src/nesting/erp/canonical'
import type { CanonicalInput } from '../../../../src/nesting/erp/canonical'
import { digestCanonical } from '../../../../src/nesting/erp/digest'
import { completeModel, deepFreeze, partialRequest, referenceRequest, rejectedRequest, smallRequest, withField } from './fixtures'

const run = (request: CostRequest): Promise<CostReport> => firstValueFrom(calculateCostReport(request))

describe('cost/calculateCostReport — flow', () => {
  it('is cold: it reads nothing before subscription, emits exactly one report and completes', async () => {
    const request = await smallRequest()
    let reads = 0
    const spy = new Proxy(request, { get: (target, key) => { reads += 1; return target[key as keyof CostRequest] } })

    const observable = calculateCostReport(spy)
    expect(reads).toBe(0)
    const reports = await firstValueFrom(observable.pipe(toArray()))

    expect(reports).toHaveLength(1)
    expect(reads).toBeGreaterThan(0)
  })

  it('carries correlation, artifact digests, the digest of the canonical cost model, currency and version', async () => {
    const request = await smallRequest()

    const report = await run(request)

    expect(report.contractVersion).toBe(1)
    expect(report.status).toBe('complete')
    expect(report.correlation).toEqual(request.artifact.correlation)
    expect(report.artifactDigests).toEqual({ input: request.artifact.inputDigest, output: request.artifact.outputDigest })
    expect(report.costModelDigest).toEqual(await digestCanonical(request.costModel as unknown as CanonicalInput))
    expect(report.currency).toEqual({ code: 'BRL', minorUnitDigits: 2 })
    expect(report.breakdown).not.toBeNull()
    expect(report.production?.sheetsUsed).toBe(2)
  })

  it('has a report digest equal to the digest of the canonical report without that field', async () => {
    const report = await run(await smallRequest())
    const { reportDigest, ...rest } = report

    expect(reportDigest).toEqual(await digestCanonical(rest as unknown as CanonicalInput))
    expect(canonicalize(rest as unknown as CanonicalInput)).not.toContain(reportDigest.value)
  })

  it('lists unplaced items in the report and charges nothing for them', async () => {
    const report = await run(await partialRequest())

    expect(report.production?.unplaced.map((u) => u.itemId)).toEqual(['part-9'])
    expect(report.notices.map((n) => n.code)).toContain('UNPLACED_NOT_CHARGED')
  })

  it('takes the report status from the job total', async () => {
    const estimated = await run(await smallRequest(withField(completeModel(), 'speeds.cutting', { value: 2, estimated: true })))
    const incomplete = await run(await smallRequest(withField(completeModel(), 'rates.labourPerHour', undefined)))

    expect(estimated.status).toBe('estimated')
    expect(incomplete.status).toBe('incomplete')
  })

  it('emits an unavailable report with notices for an invalid model, a rejected artifact and an unsupported version', async () => {
    const invalid = await run(await smallRequest(withField(completeModel(), 'rates.cuttingPerHour', { value: -1 })))
    const rejected = await run(await rejectedRequest())
    const small = await smallRequest()
    const old = await run({ ...small, artifact: { ...small.artifact, contractVersion: 2 } })

    expect(invalid.status).toBe('unavailable')
    expect(invalid.breakdown).toBeNull()
    expect(invalid.production).toBeNull()
    expect(invalid.notices.map((n) => n.code)).toEqual(['INVALID_COST_MODEL'])
    expect(rejected.status).toBe('unavailable')
    expect(rejected.notices.map((n) => n.code)).toEqual(['NO_LAYOUT'])
    expect(old.status).toBe('unavailable')
    expect(old.notices.map((n) => n.code)).toEqual(['UNSUPPORTED_CONTRACT_VERSION'])
    expect(invalid.correlation).toEqual(small.artifact.correlation)
  })

  it('emits an unavailable report for a model that fails the schema, with a specific notice', async () => {
    const small = await smallRequest()
    const broken = { ...small, costModel: { ...completeModel(), geometryUnitsPerMeter: '1000' } } as unknown as CostRequest

    const report = await run(broken)

    expect(report.status).toBe('unavailable')
    expect(report.notices[0].code).toBe('INVALID_COST_MODEL')
  })

  it('rejects the Observable for a request whose artifact fails the ERP artifact schema', async () => {
    const small = await smallRequest()
    const broken = { ...small, artifact: { ...small.artifact, outputDigest: { algorithm: 'sha256', value: 'xyz' } } } as CostRequest

    await expect(run(broken)).rejects.toThrow()
    await expect(run({ ...small, artifact: undefined } as unknown as CostRequest)).rejects.toThrow()
  })

  it('orders notices by severity, then code, then part key', async () => {
    const report = await run(await smallRequest(withField(completeModel(), 'rates.cuttingPerHour', undefined)))
    const rank = { error: 0, warning: 1, info: 2 }
    const ordered = [...report.notices].sort((a, b) => rank[a.severity] - rank[b.severity] || a.code.localeCompare(b.code) || (a.partKey ?? '').localeCompare(b.partKey ?? ''))

    expect(report.notices).toEqual(ordered)
  })

  it('survives a JSON round trip unchanged and leaves frozen inputs untouched', async () => {
    const request = await smallRequest()
    const before = structuredClone(request)
    const frozen = deepFreeze(structuredClone(request))

    const report = await run(frozen)

    expect(JSON.parse(JSON.stringify(report))).toEqual(report)
    expect(frozen).toEqual(before)
  })

  it('produces 100 identical reports, digests included, for the same inputs', async () => {
    const request = await smallRequest()
    const first = await run(request)

    for (let index = 0; index < 100; index += 1) expect(await run(request)).toEqual(first)
  })

  it('reports the 500-part reference job in under one second and reconciles with the core breakdown', async () => {
    const request = await referenceRequest()

    const started = performance.now()
    const report = await run(request)
    const elapsed = performance.now() - started

    expect(elapsed).toBeLessThan(1000)
    expect(report.status).toBe('complete')
    expect(report.breakdown?.parts).toHaveLength(500)
    expect(report.breakdown?.job).toEqual(buildCostBreakdown(request).breakdown?.job)
  })
})
