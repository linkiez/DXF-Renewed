import { expect } from 'expect'
import { assessLoosePart } from '../../../../src/nesting/risk/assessLoosePart'
import { buildRiskContext } from '../../../../src/nesting/risk/riskContext'
import { completeRiskProfile, riskRequest, safeJob, smallPartFreedJob, tabHeldJob, withoutLimit } from './fixtures'

describe('risk/assessLoosePart', () => {
  it('flags a free part with an area at or below the limit, with its freed action and measured area', async () => {
    const [finding, ...rest] = assessLoosePart(buildRiskContext(riskRequest(await smallPartFreedJob())))

    expect(rest).toEqual([])
    expect(finding).toMatchObject({ category: 'loose-part', partKey: 'small#0', actionIndex: 2, unit: 'm²', limit: 0.0001 })
    expect(finding.measured).toBeCloseTo(0.000064, 9)
    expect(finding.planSeconds).toBeGreaterThan(0)
  })

  it('does not flag a larger part or a part that stays attached by a tab', async () => {
    expect(assessLoosePart(buildRiskContext(riskRequest(await safeJob())))).toEqual([])
    expect(assessLoosePart(buildRiskContext(riskRequest(await tabHeldJob())))).toEqual([])
  })

  it('makes the rule not assessable when the area limit is missing', async () => {
    const context = buildRiskContext(riskRequest(await smallPartFreedJob(), withoutLimit(completeRiskProfile(), 'loosePart.maxArea')))

    expect(context.rules.find((rule) => rule.category === 'loose-part')).toEqual({ category: 'loose-part', assessable: false, missing: ['loosePart.maxArea'] })
    expect(assessLoosePart(context)).toEqual([])
  })
})
