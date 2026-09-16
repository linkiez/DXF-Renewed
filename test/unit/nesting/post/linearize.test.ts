import { strict as assert } from 'node:assert'
import { linearizeCutPlan, validateEmittedPlan } from '../../../../src/nesting/post'
import { plan, profile } from './fixtures'

describe('linearizeCutPlan', () => {
  it('returns immutable deterministic points for an explicit arc', () => {
    const curvedPlan = {
      ...plan,
      actions: plan.actions.map((action) => action.kind === 'cut'
        ? {
            ...action,
            curve: { type: 'arc' as const, center: { x: 20, y: 25 }, clockwise: false },
          }
        : action),
    }
    const result = linearizeCutPlan(curvedPlan, profile({ arcSupport: false, curveLinearizationTolerance: 2 }))
    assert.notEqual(result, plan)
    assert.ok(result.actions[2].points.length > 2)
    assert.equal(result.actions[2].curve, undefined)
    assert.deepEqual(result.actions[2].points[0], { x: 20, y: 20 })
    assert.deepEqual(result.actions[2].points.at(-1), { x: 30, y: 30 })
  })

  it('leaves unsupported curve representations explicit for validation rejection', () => {
    const curvedPlan = {
      ...plan,
      actions: plan.actions.map((action) => action.kind === 'cut'
        ? {
            ...action,
            curve: { type: 'spline', controlPoints: [{ x: 25, y: 25 }] } as never,
          }
        : action),
    }
    const result = linearizeCutPlan(curvedPlan, profile({ arcSupport: false, curveLinearizationTolerance: 1 }))
    assert.equal(result.actions[2].curve?.type, 'spline')
  })

  it('linearizes Bezier curves deterministically within the profile tolerance', () => {
    const curvedPlan = {
      ...plan,
      actions: plan.actions.map((action) => action.kind === 'cut'
        ? {
            ...action,
            points: [{ x: 20, y: 20 }, { x: 40, y: 20 }],
            curve: {
              type: 'bezier' as const,
              controlPoints: [{ x: 20, y: 45 }, { x: 40, y: -5 }],
            },
          }
        : action),
    }
    const machineProfile = profile({ arcSupport: false, curveLinearizationTolerance: 1 })
    const first = linearizeCutPlan(curvedPlan, machineProfile)
    const second = linearizeCutPlan(curvedPlan, machineProfile)

    assert.deepEqual(first, second)
    assert.equal(first.actions[2].curve, undefined)
    assert.ok(first.actions[2].points.length > 2)
    assert.deepEqual(curvedPlan.actions[2].points, [{ x: 20, y: 20 }, { x: 40, y: 20 }])
  })

  it('preserves malformed Bezier curves so validation can reject them explicitly', () => {
    const curvedPlan = {
      ...plan,
      actions: plan.actions.map((action) => action.kind === 'cut'
        ? {
            ...action,
            curve: { type: 'bezier' as const, controlPoints: [] },
          }
        : action),
    }
    const machineProfile = profile({ arcSupport: false, curveLinearizationTolerance: 1 })
    const result = linearizeCutPlan(curvedPlan, machineProfile)
    const issues = validateEmittedPlan(result, machineProfile)

    assert.equal(result.actions[2].curve?.type, 'bezier')
    assert.ok(issues.some((issue) => issue.code === 'CURVE_MALFORMED'))
  })
})
