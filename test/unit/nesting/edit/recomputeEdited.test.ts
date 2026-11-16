import { expect } from 'expect'
import { firstValueFrom, toArray } from 'rxjs'
import { commitEdit } from '../../../../src/nesting/edit/commitEdit'
import { createEditState } from '../../../../src/nesting/edit/createEditState'
import { recomputeEdited } from '../../../../src/nesting/edit/recomputeEdited'
import type { EditInput, EditState, RecomputeRequest, RecomputeStep } from '../../../../src/nesting/edit/types'
import type { CutPlanResult } from '../../../../src/nesting'
import { profile } from '../cutPath/fixtures'
import { completeModel } from '../cost/fixtures'
import { completeRiskProfile } from '../risk/fixtures'
import { deepFreeze, editFixture } from './fixtures'

const edited = (input: EditInput): EditState => {
  const state = createEditState(input).state as EditState
  return commitEdit(state, { partKey: 'part-A#0', kind: 'move', delta: { dx: 3, dy: 3 } }).state
}
const run = (request: RecomputeRequest): Promise<RecomputeStep[]> => firstValueFrom(recomputeEdited(request).pipe(toArray()))
const processProfile = () => profile({ sequence: { strategy: 'input' } })

describe('edit/recomputeEdited', () => {
  it('emits the plan step and then the cost step, both current, stamped with the revision', async () => {
    const state = edited((await editFixture()).input)

    const steps = await run({ state, processProfile: processProfile(), costModel: completeModel() })

    expect(steps.map((s) => [s.step, s.status, s.revision])).toEqual([['plan', 'current', 1], ['cost', 'current', 1]])
    expect(steps[0].result).toBeDefined()
    expect((steps[1] as Extract<RecomputeStep, { step: 'cost' }>).result?.breakdown).not.toBeNull()
  })

  it('plans the edited layout, not the original', async () => {
    const fixture = await editFixture()
    const state = edited(fixture.input)

    const [plan] = await run({ state, processProfile: processProfile() })

    expect(JSON.stringify((plan.result as CutPlanResult).plan)).not.toEqual(JSON.stringify(fixture.cutPlan.plan))
  })

  it('emits only the plan step when no cost model is supplied', async () => {
    const state = edited((await editFixture()).input)

    expect((await run({ state, processProfile: processProfile() })).map((s) => s.step)).toEqual(['plan'])
  })

  it('reports a planner failure with PLAN_RECOMPUTE_FAILED, keeps the layout and leaves the cost unavailable', async () => {
    const state = edited((await editFixture()).input)
    const broken = profile({ lead: { type: 'straight', length: -1, angle: 0, placement: 'outside' } })

    const steps = await run({ state, processProfile: broken, costModel: completeModel() })

    expect(steps.map((s) => [s.step, s.status])).toEqual([['plan', 'unavailable'], ['cost', 'unavailable']])
    expect(steps[0].notices.map((n) => n.code)).toEqual(['PLAN_RECOMPUTE_FAILED'])
    expect(steps[1].notices.map((n) => n.code)).toEqual(['COST_RECOMPUTE_FAILED'])
    expect(state.working.parts.get('part-A#0')?.placement.x).toBe(13)
  })

  it('reports a cost failure with COST_RECOMPUTE_FAILED', async () => {
    const state = edited((await editFixture()).input)

    const steps = await run({ state, processProfile: processProfile(), costModel: null as never })

    expect(steps.map((s) => [s.step, s.status])).toEqual([['plan', 'current'], ['cost', 'unavailable']])
    expect(steps[1].notices.map((n) => n.code)).toEqual(['COST_RECOMPUTE_FAILED'])
  })

  it('warns when moving a part breaks a common line of the original plan', async () => {
    const fixture = await editFixture()
    const plan = fixture.cutPlan.plan as NonNullable<CutPlanResult['plan']>
    const extended = { ...plan, actions: [...plan.actions, { kind: 'common-line' as const, points: [{ x: 30, y: 10 }, { x: 30, y: 30 }], metadata: { firstContourId: 'part-A-outer', secondContourId: 'part-B-outer' } }] }
    const withCommon: CutPlanResult = { ...fixture.cutPlan, plan: extended, plans: [extended] }
    const state = edited({ ...fixture.input, cutPlan: withCommon })

    const [step] = await run({ state, processProfile: processProfile() })

    expect(step.notices.map((n) => [n.code, n.partKey])).toEqual([['COMMON_LINE_BROKEN', 'part-A#0']])
  })

  it('never mutates its input and rejects a request without a state', async () => {
    const fixture = await editFixture()
    const state = deepFreeze(edited({ ...fixture.input, cutPlan: undefined }))

    await expect(run({ state, processProfile: processProfile(), costModel: completeModel() })).resolves.toHaveLength(2)
    await expect(run({ state: undefined, processProfile: processProfile() } as never)).rejects.toThrow(TypeError)
  })

  it('is cold: each subscription recomputes', async () => {
    const state = edited((await editFixture()).input)
    const flow = recomputeEdited({ state, processProfile: processProfile() })

    expect(await firstValueFrom(flow.pipe(toArray()))).toEqual(await firstValueFrom(flow.pipe(toArray())))
  })

  it('runs the risk step after the plan with the edited layout and omits it without a profile', async () => {
    const state = edited((await editFixture()).input)

    const without = await run({ state, processProfile: processProfile() })
    const steps = await run({ state, processProfile: processProfile(), riskProfile: completeRiskProfile() })

    expect(without.map((s) => s.step)).toEqual(['plan'])
    expect(steps.map((s) => [s.step, s.status])).toEqual([['plan', 'current'], ['risk', 'current']])
    expect((steps[1] as Extract<RecomputeStep, { step: 'risk' }>).result?.indicative).toBe(true)
  })

  it('reports RISK_UNAVAILABLE when the profile is invalid or the plan failed', async () => {
    const state = edited((await editFixture()).input)
    const broken = profile({ lead: { type: 'straight', length: -1, angle: 0, placement: 'outside' } })

    const invalidProfile = await run({ state, processProfile: processProfile(), riskProfile: { ...completeRiskProfile(), geometryUnitsPerMeter: 0 } })
    const failedPlan = await run({ state, processProfile: broken, riskProfile: completeRiskProfile() })

    expect(invalidProfile[1]).toMatchObject({ step: 'risk', status: 'unavailable' })
    expect(invalidProfile[1].notices.map((n) => n.code)).toEqual(['RISK_UNAVAILABLE'])
    expect(failedPlan.map((s) => [s.step, s.status])).toEqual([['plan', 'unavailable'], ['risk', 'unavailable']])
  })
})
