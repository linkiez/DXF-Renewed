import { expect } from 'expect'
import { assessCutRisk } from '../../../../src/nesting/risk/assessCutRisk'
import {
  completeRiskProfile, deepFreeze, denseClusterJob, headStrikeJob, riskRequest, safeJob, smallPartFreedJob,
  spreadJob, tabHeldJob, thinWebJob, withLimit, withoutLimit,
} from './fixtures'

const categories = (result: ReturnType<typeof assessCutRisk>): string[] => result.findings.map((finding) => finding.category)

describe('risk/assessCutRisk', () => {
  it('finds each planted risk under its category with the measured value, the limit and the unit', async () => {
    expect(categories(assessCutRisk(riskRequest(await denseClusterJob())))).toContain('heat')
    expect(categories(assessCutRisk(riskRequest(await thinWebJob())))).toEqual(['thin-web'])
    expect(categories(assessCutRisk(riskRequest(await smallPartFreedJob())))).toEqual(['loose-part'])
    expect(categories(assessCutRisk(riskRequest(await headStrikeJob()))).sort()).toEqual(['head-strike', 'loose-part'])
    for (const finding of assessCutRisk(riskRequest(await headStrikeJob())).findings) {
      expect(finding.measured).toBeGreaterThanOrEqual(0)
      expect(finding.limit).toBeGreaterThan(0)
      expect(finding.unit.length).toBeGreaterThan(0)
      expect(finding.id.length).toBeGreaterThan(0)
    }
  })

  it('has no finding at all for the safe job and for the spread job', async () => {
    expect(assessCutRisk(riskRequest(await safeJob())).findings).toEqual([])
    expect(assessCutRisk(riskRequest(await spreadJob())).findings).toEqual([])
    expect(assessCutRisk(riskRequest(await tabHeldJob())).findings.map((f) => f.category)).toEqual([])
  })

  it('grades a finding warning at the limit and critical at the limit times the critical factor', async () => {
    const job = await thinWebJob()

    expect(assessCutRisk(riskRequest(job)).findings[0].severity).toBe('critical')
    const mild = withLimit(completeRiskProfile(), 'criticalFactor', { value: 3 })
    expect(assessCutRisk(riskRequest(job, mild)).findings[0].severity).toBe('warning')
  })

  it('keeps every finding a warning and says so when the critical factor is missing', async () => {
    const result = assessCutRisk(riskRequest(await thinWebJob(), withoutLimit(completeRiskProfile(), 'criticalFactor')))

    expect(result.findings.map((f) => f.severity)).toEqual(['warning'])
    expect(result.notices.map((n) => n.code)).toContain('SEVERITY_NOT_GRADED')
  })

  it('lists every rule as assessable or not and is partial when one cannot be assessed', async () => {
    const full = assessCutRisk(riskRequest(await thinWebJob()))
    const partial = assessCutRisk(riskRequest(await thinWebJob(), withoutLimit(completeRiskProfile(), 'web.minimum')))

    expect(full.status).toBe('assessed')
    expect(full.rules.map((rule) => [rule.category, rule.assessable])).toEqual([['heat', true], ['thin-web', true], ['loose-part', true], ['head-strike', true]])
    expect(partial.status).toBe('partial')
    expect(partial.rules.find((rule) => rule.category === 'thin-web')).toEqual({ category: 'thin-web', assessable: false, missing: ['web.minimum'] })
    expect(partial.notices.filter((n) => n.code === 'RULE_NOT_ASSESSABLE')[0].message).toContain('web.minimum')
    expect(partial.findings).toEqual([])
  })

  it('is always indicative and carries the estimated-limit notice', async () => {
    const profile = withLimit(completeRiskProfile(), 'web.minimum', { value: 0.002, estimated: true })

    const result = assessCutRisk(riskRequest(await thinWebJob(), profile))

    expect(result.indicative).toBe(true)
    expect(result.notices.map((n) => n.code)).toContain('ESTIMATED_LIMIT')
  })

  it('is unavailable for an invalid profile and for a plan without actions', async () => {
    const invalid = assessCutRisk(riskRequest(await thinWebJob(), withLimit(completeRiskProfile(), 'geometryUnitsPerMeter', 0)))
    const job = await thinWebJob()
    const empty = assessCutRisk({ ...riskRequest(job), cutPlan: { ...job.cutPlan, plan: undefined, plans: [] } })

    expect(invalid).toMatchObject({ status: 'unavailable', findings: [] })
    expect(invalid.notices.map((n) => n.code)).toEqual(['PROFILE_INVALID'])
    expect(empty).toMatchObject({ status: 'unavailable', findings: [] })
    expect(empty.notices.map((n) => n.code)).toEqual(['NO_ACTIONS'])
  })

  it('orders findings by severity, category, sheet, action and part, and is deterministic', async () => {
    const request = riskRequest(await headStrikeJob())

    const result = assessCutRisk(request)

    expect(result.findings.map((f) => f.category)).toEqual(['loose-part', 'head-strike'])
    expect(assessCutRisk(request)).toEqual(result)
  })

  it('never mutates the request', async () => {
    const job = await denseClusterJob()
    const frozen = deepFreeze(JSON.parse(JSON.stringify(riskRequest(job))))

    expect(() => assessCutRisk(frozen)).not.toThrow()
  })
})
