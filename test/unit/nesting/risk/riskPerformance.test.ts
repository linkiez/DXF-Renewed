import { expect } from 'expect'
import { assessCutRisk } from '../../../../src/nesting/risk/assessCutRisk'
import { referenceFixture } from '../review/fixtures'
import { completeRiskProfile } from './fixtures'

describe('risk/assessCutRisk performance (SC-006)', () => {
  it('assesses the 500-part reference job with every rule assessable in under 2 s, worst of five runs', async () => {
    const fixture = await referenceFixture()
    const request = { artifact: fixture.artifact, layout: fixture.layout, cutPlan: fixture.cutPlan, profile: completeRiskProfile() }
    const times: number[] = []
    let rules = 0

    for (let run = 0; run < 5; run += 1) {
      const started = performance.now()
      const result = assessCutRisk(request)
      times.push(performance.now() - started)
      rules = result.rules.filter((rule) => rule.assessable).length
    }

    console.log(`SC-006 risk assessment of 500 parts (ms): ${times.map((t) => t.toFixed(0)).join(', ')} | worst ${Math.max(...times).toFixed(0)}`)
    expect(rules).toBe(4)
    expect(Math.max(...times)).toBeLessThan(2000)
  }).timeout(60_000)
})
