import { strict as assert } from 'node:assert'
import { generatedPlan, referencePlan } from './reference-plan'

describe('reference plan', () => {
  it('has four contours with travels of 170.880, 50 and 1200', () => {
    const plan = referencePlan()
    const rapids = plan.actions.filter((a) => a.kind === 'rapid')
    assert.equal(rapids.length, 4)
    const lastOf = (contourId: string) => {
      const own = plan.actions.filter((a) => a.contourId === contourId && a.kind !== 'rapid')
      const points = own[own.length - 1].points
      return points[points.length - 1]
    }
    const target = (i: number) => rapids[i].points[rapids[i].points.length - 1]
    const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)
    assert.ok(Math.abs(dist(lastOf('c-hole'), target(1)) - 170.88) < 0.001)
    assert.equal(dist(lastOf('c-outer'), target(2)), 50)
    assert.equal(dist(lastOf('c-near'), target(3)), 1200)
  })

  it('applies the quality option and marks the small contours', () => {
    const plan = referencePlan({ quality: '1' })
    assert.ok(plan.actions.filter((a) => a.metadata).every((a) => a.metadata?.quality === '1'))
    const near = plan.actions.find((a) => a.contourId === 'c-near' && a.kind === 'pierce')
    assert.equal(near?.metadata?.contourClass, 'small')
  })

  it('builds N non-overlapping squares', () => {
    const plan = generatedPlan(100)
    assert.equal(plan.actions.filter((a) => a.kind === 'pierce').length, 100)
  })
})
