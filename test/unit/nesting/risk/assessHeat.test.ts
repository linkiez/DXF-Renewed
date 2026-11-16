import { expect } from 'expect'
import { assessHeat } from '../../../../src/nesting/risk/assessHeat'
import { buildRiskContext } from '../../../../src/nesting/risk/riskContext'
import { completeRiskProfile, denseClusterJob, riskRequest, spreadJob, withLimit, withoutLimit } from './fixtures'

const findingsOf = async (job: ReturnType<typeof denseClusterJob>, profile = completeRiskProfile()) =>
  assessHeat(buildRiskContext(riskRequest(await job, profile)))

describe('risk/assessHeat', () => {
  it('flags the dense cluster with the region, the moment, the measured length and the limit', async () => {
    const findings = await findingsOf(denseClusterJob())

    expect(findings.length).toBeGreaterThan(0)
    const [first] = findings
    expect(first).toMatchObject({ category: 'heat', sheetId: 'sheet-1', unit: 'm', limit: 0.3 })
    expect(first.measured).toBeGreaterThan(0.3)
    expect(first.region?.radius).toBeCloseTo(30)
    expect(first.planSeconds).toBeGreaterThan(0)
    expect(first.actionIndex).toBeGreaterThanOrEqual(0)
    expect(first.message).toContain('Acúmulo de calor')
    expect(first.mitigation.length).toBeGreaterThan(10)
  })

  it('reports each hot region once, apart from the others', async () => {
    const findings = await findingsOf(denseClusterJob())

    const centers = findings.map((finding) => finding.region as { x: number; y: number; radius: number })
    for (let a = 0; a < centers.length; a += 1) {
      for (let b = a + 1; b < centers.length; b += 1) {
        expect(Math.hypot(centers[a].x - centers[b].x, centers[a].y - centers[b].y)).toBeGreaterThanOrEqual(centers[a].radius)
      }
    }
  })

  it('does not flag the same cuts spread apart', async () => {
    expect(await findingsOf(spreadJob())).toEqual([])
  })

  it('does not flag a cooling gap longer than the window', async () => {
    expect(await findingsOf(denseClusterJob(), withLimit(completeRiskProfile(), 'heat.windowSeconds', { value: 0.5 }))).toEqual([])
  })

  it('makes the rule not assessable, naming the path, when a heat limit is missing', async () => {
    const context = buildRiskContext(riskRequest(await denseClusterJob(), withoutLimit(completeRiskProfile(), 'heat.maxCutLength')))

    expect(context.rules.find((rule) => rule.category === 'heat')).toEqual({ category: 'heat', assessable: false, missing: ['heat.maxCutLength'] })
    expect(assessHeat(context)).toEqual([])
  })
})
