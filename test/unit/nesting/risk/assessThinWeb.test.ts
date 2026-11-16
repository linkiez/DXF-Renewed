import { expect } from 'expect'
import { assessThinWeb } from '../../../../src/nesting/risk/assessThinWeb'
import { buildRiskContext } from '../../../../src/nesting/risk/riskContext'
import { completeRiskProfile, riskRequest, safeJob, thinWebJob, withLimit, withoutLimit } from './fixtures'

describe('risk/assessThinWeb', () => {
  it('flags two outlines closer than the minimum with both keys, the distance and the limit', async () => {
    const [finding, ...rest] = assessThinWeb(buildRiskContext(riskRequest(await thinWebJob())))

    expect(rest).toEqual([])
    expect(finding).toMatchObject({ category: 'thin-web', partKey: 'part-1#0', otherPartKey: 'part-2#0', unit: 'm', limit: 0.002 })
    expect(finding.measured).toBeCloseTo(0.001, 6)
    expect(finding.message).toContain('part-1#0')
    expect(finding.message).toContain('part-2#0')
  })

  it('does not flag a distance exactly at the limit', async () => {
    const profile = withLimit(completeRiskProfile(), 'web.minimum', { value: 0.001 })

    expect(assessThinWeb(buildRiskContext(riskRequest(await thinWebJob(), profile)))).toEqual([])
  })

  it('also checks the distance to the sheet edge', async () => {
    const profile = withLimit(completeRiskProfile(), 'web.minimum', { value: 0.02 })

    const findings = assessThinWeb(buildRiskContext(riskRequest(await safeJob(), profile)))

    expect(findings.length).toBeGreaterThan(0)
    expect(findings.every((finding) => finding.otherPartKey === undefined)).toBe(true)
    expect(findings[0].message).toContain('borda')
  })

  it('compares only nearby pairs', async () => {
    expect(assessThinWeb(buildRiskContext(riskRequest(await safeJob())))).toEqual([])
  })

  it('makes the rule not assessable when the minimum web is missing', async () => {
    const context = buildRiskContext(riskRequest(await thinWebJob(), withoutLimit(completeRiskProfile(), 'web.minimum')))

    expect(context.rules.find((rule) => rule.category === 'thin-web')).toEqual({ category: 'thin-web', assessable: false, missing: ['web.minimum'] })
    expect(assessThinWeb(context)).toEqual([])
  })
})
