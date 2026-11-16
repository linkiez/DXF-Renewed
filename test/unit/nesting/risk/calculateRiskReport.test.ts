import { expect } from 'expect'
import { firstValueFrom } from 'rxjs'
import { calculateRiskReport } from '../../../../src/nesting/risk/calculateRiskReport'
import { completeRiskProfile, riskRequest, thinWebJob, withLimit } from './fixtures'

describe('risk/calculateRiskReport', () => {
  it('emits one report with the correlation, the digests and the findings, then completes', async () => {
    const job = await thinWebJob()
    const values: unknown[] = []

    await new Promise<void>((resolve, reject) => {
      calculateRiskReport(riskRequest(job)).subscribe({ next: (value) => values.push(value), complete: resolve, error: reject })
    })

    expect(values).toHaveLength(1)
    const report = values[0] as Awaited<ReturnType<typeof firstValueFrom<ReturnType<typeof calculateRiskReport>>>>
    expect(report).toMatchObject({ contractVersion: 1, status: 'assessed', indicative: true, correlation: job.artifact.correlation })
    expect(report.artifactDigests).toEqual({ input: job.artifact.inputDigest, output: job.artifact.outputDigest })
    expect(report.profileDigest.value).toMatch(/^[0-9a-f]{64}$/)
    expect(report.digest.value).toMatch(/^[0-9a-f]{64}$/)
    expect(report.findings.map((f) => f.category)).toEqual(['thin-web'])
  })

  it('yields an unavailable report with PROFILE_INVALID notices for an invalid profile', async () => {
    const report = await firstValueFrom(calculateRiskReport(riskRequest(await thinWebJob(), withLimit(completeRiskProfile(), 'web.minimum', { value: -1 }))))

    expect(report.status).toBe('unavailable')
    expect(report.notices.map((n) => n.code)).toEqual(['PROFILE_INVALID'])
    expect(report.findings).toEqual([])
  })

  it('rejects a structurally invalid request', async () => {
    const job = await thinWebJob()
    const broken = { ...riskRequest(job), artifact: { ...job.artifact, correlation: undefined } } as never

    await expect(firstValueFrom(calculateRiskReport(broken))).rejects.toThrow(TypeError)
  })

  it('gives identical digests in five consecutive runs and a different digest for another profile', async () => {
    const request = riskRequest(await thinWebJob())
    const digests: string[] = []
    for (let run = 0; run < 5; run += 1) digests.push((await firstValueFrom(calculateRiskReport(request))).digest.value)

    expect(new Set(digests).size).toBe(1)
    const other = await firstValueFrom(calculateRiskReport(riskRequest(await thinWebJob(), withLimit(completeRiskProfile(), 'web.minimum', { value: 0.0005 }))))
    expect(other.digest.value).not.toBe(digests[0])
  })

  it('is cold: nothing runs before subscription', async () => {
    const request = riskRequest(await thinWebJob())
    const flow = calculateRiskReport(request)

    expect(flow).toBeDefined()
    expect((await firstValueFrom(flow)).status).toBe('assessed')
  })
})
