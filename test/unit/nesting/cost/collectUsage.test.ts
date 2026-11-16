import { expect } from 'expect'
import type { CutAction, CutPlan } from '../../../../src/nesting'
import { collectUsage } from '../../../../src/nesting/cost/collectUsage'
import type { ActionUsage } from '../../../../src/nesting/cost/collectUsage'
import type { CostRequest } from '../../../../src/nesting/cost/types'
import { sparsePlacementFixture } from '../review/fixtures'
import { completeModel, smallRequest } from './fixtures'

const sum = (actions: readonly ActionUsage[], category: ActionUsage['category']): number =>
  actions.filter((a) => a.category === category).reduce((total, a) => total + a.length, 0)

const withPlan = (request: CostRequest, change: (plan: CutPlan) => CutPlan): CostRequest => {
  const plans = (request.cutPlan?.plans ?? []).map(change)
  return { ...request, cutPlan: { ...(request.cutPlan as NonNullable<CostRequest['cutPlan']>), plans, plan: undefined } }
}

describe('cost/collectUsage', () => {
  it('returns one usage per placed part with the part key and its sheet', async () => {
    const usage = collectUsage(await smallRequest())

    expect(usage.planPresent).toBe(true)
    expect(usage.sheets.map((s) => s.sheetId)).toEqual(['sheet-1', 'sheet-2'])
    expect(usage.sheets[0].parts.map((p) => p.key)).toEqual(['part-1#0', 'part-2#0'])
    expect(usage.sheets[1].parts.map((p) => p.sheetId)).toEqual(['sheet-2', 'sheet-2'])
    expect(usage.sheets.every((s) => s.kind === 'sheet')).toBe(true)
  })

  it('computes the net area with isOuter and abs(area), even when hole areas are stored positive', async () => {
    const usage = collectUsage(await smallRequest())

    expect(usage.sheets[0].parts[0].netArea).toBeCloseTo(400 - 36)
  })

  it('uses the placed outline area and an info notice when the layout is not supplied', async () => {
    const request = await smallRequest()
    const usage = collectUsage({ artifact: request.artifact, cutPlan: request.cutPlan, costModel: request.costModel })

    expect(usage.sheets[0].parts[0].netArea).toBeCloseTo(400)
    const notices = usage.notices.filter((n) => n.code === 'AREA_WITHOUT_HOLES')
    expect(notices).toHaveLength(4)
    expect(notices[0].severity).toBe('info')
    expect(notices[0].partKey).toBe('part-1#0')
  })

  it('sums cut, travel and pierce usage so that the totals equal the cut plan stats', async () => {
    const request = await smallRequest()
    const usage = collectUsage(request)
    const stats = (request.cutPlan?.plans ?? [])[0].stats
    const first = usage.sheets[0]
    const all = [...first.parts.flatMap((p) => p.actions), ...first.unallocated]

    expect(sum(all, 'cut')).toBeCloseTo(stats.cutLength)
    expect(sum(all, 'travel')).toBeCloseTo(stats.rapidLength)
    expect(all.filter((a) => a.category === 'pierce')).toHaveLength(stats.pierceCount)
  })

  it('carries the feed of a cut action and leaves dwell empty when the action has none', async () => {
    const usage = collectUsage(await smallRequest())
    const actions = usage.sheets[0].parts[0].actions

    expect(actions.filter((a) => a.category === 'cut').map((a) => a.feed)).toContain(1200)
    expect(actions.filter((a) => a.category === 'cut').some((a) => a.feed === null)).toBe(true)
    expect(actions.find((a) => a.category === 'pierce')?.dwell).toBeNull()
    expect(actions.find((a) => a.category === 'travel')?.feed).toBeNull()
  })

  it('accumulates unlinked actions as unallocated usage and raises a notice', async () => {
    const request = withPlan(await smallRequest(), (plan) => ({
      ...plan,
      actions: [...plan.actions, { kind: 'cut', points: [{ x: 0, y: 0 }, { x: 10, y: 0 }], partId: 'ghost' } as CutAction],
    }))

    const usage = collectUsage(request)

    expect(usage.sheets[0].unallocated).toEqual([{ category: 'cut', length: 10, feed: null, dwell: null }])
    expect(usage.notices.filter((n) => n.code === 'UNKNOWN_PART')).toHaveLength(2)
  })

  it('reports a part without cutting actions and still keeps it', async () => {
    const request = withPlan(await smallRequest(), (plan) => ({
      ...plan,
      actions: plan.actions.filter((a) => a.partId !== 'part-2'),
    }))

    const usage = collectUsage(request)

    expect(usage.sheets[0].parts.map((p) => p.key)).toContain('part-2#0')
    const notice = usage.notices.find((n) => n.code === 'PART_WITHOUT_CUTTING' && n.partKey === 'part-2#0')
    expect(notice?.severity).toBe('warning')
  })

  it('reports a part without positive net area', async () => {
    const request = await smallRequest()
    const layout = request.layout
    if (!layout) throw new Error('fixture without layout')
    const flat = {
      ...layout,
      contours: layout.contours.map((c) => (c.partId === 'part-1' ? { ...c, shape: { ...c.shape, area: 0 } } : c)),
    }

    const usage = collectUsage({ ...request, layout: flat })

    expect(usage.sheets[0].parts[0].netArea).toBe(0)
    expect(usage.notices.find((n) => n.code === 'PART_WITHOUT_AREA')?.partKey).toBe('part-1#0')
  })

  it('reports no plan and a plan for a sheet the artifact lacks', async () => {
    const request = await smallRequest()

    const none = collectUsage({ ...request, cutPlan: undefined })
    expect(none.planPresent).toBe(false)
    expect(none.sheets[0].parts[0].actions).toEqual([])
    expect(none.notices.map((n) => n.code)).toContain('NO_CUT_PLAN')

    const foreign = collectUsage(withPlan(request, (plan) => ({ ...plan, sheetId: 'sheet-9' })))
    expect(foreign.notices.map((n) => n.code)).toContain('PLAN_SHEET_MISSING')
  })

  it('never produces a part for unplaced items', async () => {
    const request = await smallRequest()
    const unplaced = { ...request.artifact, unplaced: [{ itemId: 'part-9', quantity: 2, reasonCode: 'UNPLACED', reason: 'Não cabe' }] }

    const usage = collectUsage({ ...request, artifact: unplaced })

    expect(usage.sheets.flatMap((s) => s.parts).some((p) => p.shapeId === 'part-9')).toBe(false)
  })

  it('warns that a part whose outline is only a bounding box has an approximate area', async () => {
    const input = await sparsePlacementFixture(1)

    const usage = collectUsage({ artifact: input.artifact, costModel: completeModel() })

    const approximate = usage.notices.filter((n) => n.code === 'PART_AREA_APPROXIMATE')
    expect(approximate.map((n) => n.partKey)).toEqual(['part-1#0', 'part-2#0'])
    expect(approximate[0].severity).toBe('warning')
    expect(approximate[0].message).toContain('retângulo')
    expect(usage.sheets[0].parts[0].netArea).toBeCloseTo(400)
  })

  it('does not warn about an approximate area for a placement that has its real outline', async () => {
    const request = await smallRequest()

    const usage = collectUsage({ artifact: request.artifact, costModel: request.costModel })

    expect(usage.notices.filter((n) => n.code === 'PART_AREA_APPROXIMATE')).toEqual([])
  })

  it('does not cost a placement whose sheet cannot be determined and names it in a warning', async () => {
    const input = await sparsePlacementFixture(2)

    const usage = collectUsage({ artifact: input.artifact, costModel: completeModel() })

    expect(usage.sheets.flatMap((s) => s.parts)).toEqual([])
    const unresolved = usage.notices.filter((n) => n.code === 'PLACEMENT_SHEET_UNRESOLVED')
    expect(unresolved.map((n) => n.partKey)).toEqual(['part-1#0', 'part-2#0', 'part-3#0', 'part-4#0'])
    expect(unresolved[0].severity).toBe('warning')
    expect(unresolved[0].message).toContain('part-1#0')
  })
})
