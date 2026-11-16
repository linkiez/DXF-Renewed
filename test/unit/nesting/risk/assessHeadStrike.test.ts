import { expect } from 'expect'
import { assessHeadStrike } from '../../../../src/nesting/risk/assessHeadStrike'
import { buildRiskContext } from '../../../../src/nesting/risk/riskContext'
import { completeRiskProfile, headStrikeJob, riskRequest, smallPartFreedJob, tabHeldJob, withoutLimit } from './fixtures'

describe('risk/assessHeadStrike', () => {
  it('flags a path that passes within the clearance of a loose part after it was freed', async () => {
    const [finding, ...rest] = assessHeadStrike(buildRiskContext(riskRequest(await headStrikeJob())))

    expect(rest).toEqual([])
    expect(finding).toMatchObject({ category: 'head-strike', partKey: 'small#0', actionIndex: 6, unit: 'm', limit: 0.005 })
    expect(finding.measured).toBeLessThanOrEqual(0.005)
    expect(finding.message).toContain('small#0')
  })

  it('does not count the departure move that leaves the part right after its release', async () => {
    expect(assessHeadStrike(buildRiskContext(riskRequest(await smallPartFreedJob())))).toEqual([])
  })

  it('does not flag a part that is held by a tab, or a path before the part was freed', async () => {
    expect(assessHeadStrike(buildRiskContext(riskRequest(await tabHeldJob())))).toEqual([])
  })

  it('makes the rule not assessable when the clearance or the area limit is missing', async () => {
    const job = await headStrikeJob()
    const noClearance = buildRiskContext(riskRequest(job, withoutLimit(completeRiskProfile(), 'headStrike.clearance')))
    const noArea = buildRiskContext(riskRequest(job, withoutLimit(completeRiskProfile(), 'loosePart.maxArea')))

    expect(noClearance.rules.find((rule) => rule.category === 'head-strike')).toEqual({ category: 'head-strike', assessable: false, missing: ['headStrike.clearance'] })
    expect(noArea.rules.find((rule) => rule.category === 'head-strike')?.missing).toEqual(['loosePart.maxArea'])
    expect(assessHeadStrike(noClearance)).toEqual([])
  })
})
