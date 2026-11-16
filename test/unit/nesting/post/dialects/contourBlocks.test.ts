import { strict as assert } from 'node:assert'
import { splitContours } from '../../../../../src/nesting/post/dialects/contourBlocks'
import { referencePlan } from '../reference-plan'

describe('splitContours', () => {
  it('splits the reference plan into four contours with their travels', () => {
    const { contours, unsupported } = splitContours(referencePlan())
    assert.equal(unsupported.length, 0)
    assert.deepEqual(contours.map((c) => c.contourId), ['c-hole', 'c-outer', 'c-near', 'c-far'])
    assert.deepEqual(contours[0].rapidTarget, { x: 100, y: 100 })
    assert.equal(contours[0].pierce?.kind, 'pierce')
    assert.deepEqual(contours[0].motions.map((m) => m.action.kind), ['lead-in', 'cut'])
    assert.deepEqual(contours[1].motions.map((m) => m.action.kind), ['lead-in', 'cut', 'cut', 'cut', 'cut', 'cut'])
    assert.ok(Math.abs((contours[0].nextRapidLength ?? 0) - 170.88) < 0.001)
    assert.equal(contours[1].nextRapidLength, 50)
    assert.equal(contours[2].nextRapidLength, 1200)
    assert.equal(contours[3].nextRapidLength, undefined)
  })

  it('reports tab and common-line actions as unsupported with their index', () => {
    const plan = referencePlan()
    const withTab = { ...plan, actions: [plan.actions[0], plan.actions[1], { kind: 'tab' as const, points: [{ x: 1, y: 1 }], contourId: 'c-hole' }, ...plan.actions.slice(2)] }
    const { unsupported } = splitContours(withTab)
    assert.deepEqual(unsupported.map((u) => [u.actionIndex, u.kind]), [[2, 'tab']])
  })

  it('returns no contour for a plan without a pierce and does not mutate the plan', () => {
    const plan = Object.freeze({ ...referencePlan(), actions: Object.freeze([{ kind: 'rapid' as const, points: [{ x: 0, y: 0 }, { x: 5, y: 5 }] }, { kind: 'end' as const, points: [{ x: 5, y: 5 }] }]) as never })
    assert.deepEqual(splitContours(plan).contours, [])
  })
})
