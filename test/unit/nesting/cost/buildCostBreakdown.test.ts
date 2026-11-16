import { expect } from 'expect'
import type { CutAction } from '../../../../src/nesting'
import { buildCostBreakdown } from '../../../../src/nesting/cost/buildCostBreakdown'
import { COST_CATEGORIES } from '../../../../src/nesting/cost/types'
import type { CostBreakdown } from '../../../../src/nesting/cost/types'
import {
  completeModel, deepFreeze, layoutOnlyRequest, partialRequest, referenceRequest, rejectedRequest,
  remnantFixture, smallRequest, withEstimated, withField, withoutField,
} from './fixtures'

const breakdownOf = (result: ReturnType<typeof buildCostBreakdown>): CostBreakdown => {
  if (!result.breakdown) throw new Error('no breakdown')
  return result.breakdown
}

const expectReconciled = (breakdown: CostBreakdown): void => {
  for (const category of COST_CATEGORIES) {
    const parts = breakdown.parts.reduce((total, part) => total + (part.components[category].amount ?? 0), 0)
    const sheets = breakdown.sheets.reduce((total, sheet) => total + (sheet.components[category].amount ?? 0), 0)
    expect(breakdown.job.components[category].amount).toBe(parts)
    expect(sheets).toBe(parts)
    expect(Number.isInteger(parts)).toBe(true)
  }
  const sumParts = breakdown.parts.reduce((total, part) => total + (part.total.amount ?? 0), 0)
  expect(breakdown.job.total.amount).toBe(sumParts)
}

describe('cost/buildCostBreakdown — complete inputs', () => {
  it('has all six categories, complete status and the parts adding up to the job', async () => {
    const breakdown = breakdownOf(buildCostBreakdown(await smallRequest()))

    expect(breakdown.parts).toHaveLength(4)
    expect(breakdown.job.total.status).toBe('complete')
    expect(breakdown.parts.every((p) => COST_CATEGORIES.every((c) => p.components[c].status === 'complete'))).toBe(true)
    expectReconciled(breakdown)
    for (const part of breakdown.parts) {
      const sum = COST_CATEGORIES.reduce((total, c) => total + (part.components[c].amount ?? 0), 0)
      expect(part.total.amount).toBe(sum)
    }
  })

  it('reports sheets with their kind and the sum of their parts', async () => {
    const breakdown = breakdownOf(buildCostBreakdown(await smallRequest()))

    expect(breakdown.sheets.map((s) => [s.sheetId, s.kind])).toEqual([['sheet-1', 'sheet'], ['sheet-2', 'sheet']])
    expect(breakdown.sheets[0].components.material.amount).toBe(10000)
    expect(breakdown.sheets[1].components.material.amount).toBe(12000)
  })

  it('prices a full sheet and a remnant separately in the same job', async () => {
    const { request } = await remnantFixture()

    const breakdown = breakdownOf(buildCostBreakdown(request))

    expect(breakdown.sheets.map((s) => s.kind)).toEqual(['sheet', 'remnant'])
    expect(breakdown.sheets[0].components.material.amount).toBe(10000)
    expect(breakdown.sheets[1].components.material.amount).toBe(3000)
    expectReconciled(breakdown)
  })

  it('also reports the copies of a part type in total', async () => {
    const breakdown = breakdownOf(buildCostBreakdown(await smallRequest()))

    expect(breakdown.partTypes.map((t) => [t.shapeId, t.quantity])).toEqual([['part-1', 1], ['part-2', 1], ['part-3', 1], ['part-4', 1]])
    expect(breakdown.partTypes[0].total.amount).toBe(breakdown.parts[0].total.amount)
  })

  it('does not charge unplaced quantity', async () => {
    const withUnplaced = breakdownOf(buildCostBreakdown(await partialRequest()))
    const without = breakdownOf(buildCostBreakdown(await smallRequest()))

    expect(withUnplaced.parts.some((p) => p.shapeId === 'part-9')).toBe(false)
    expect(withUnplaced.job.total.amount).toBe(without.job.total.amount)
  })

  it('keeps the amount of an action linked to a missing part, distributed and listed', async () => {
    const request = await smallRequest()
    const plan = (request.cutPlan?.plans ?? [])[0]
    const ghost: CutAction = { kind: 'cut', points: [{ x: 0, y: 0 }, { x: 5000, y: 0 }], partId: 'ghost' }
    const changed = {
      ...request,
      cutPlan: { ...(request.cutPlan as NonNullable<typeof request.cutPlan>), plans: [{ ...plan, actions: [...plan.actions, ghost] }, ...(request.cutPlan?.plans ?? []).slice(1)], plan: undefined },
    }

    const result = buildCostBreakdown(changed)
    const breakdown = breakdownOf(result)
    const base = breakdownOf(buildCostBreakdown(request))

    expect(breakdown.distributed.find((d) => d.category === 'cutting' && d.scope === 'sheet')?.amount).toBeGreaterThan(0)
    expect(breakdown.job.components.cutting.amount).toBeGreaterThan(base.job.components.cutting.amount as number)
    expect(result.notices.map((n) => n.code)).toEqual(expect.arrayContaining(['UNKNOWN_PART', 'UNALLOCATED_DISTRIBUTED']))
    expectReconciled(breakdown)
  })

  it('is identical for identical input and does not mutate deeply frozen inputs', async () => {
    const request = await smallRequest()
    const before = structuredClone(request)
    const frozen = deepFreeze(structuredClone(request))

    const first = buildCostBreakdown(frozen)
    const second = buildCostBreakdown(frozen)

    expect(second).toEqual(first)
    expect(frozen).toEqual(before)
  })

  it('reconciles the 500-part reference job', async () => {
    const breakdown = breakdownOf(buildCostBreakdown(await referenceRequest()))

    expect(breakdown.parts).toHaveLength(500)
    expect(breakdown.job.total.status).toBe('complete')
    expectReconciled(breakdown)
  })
})

describe('cost/buildCostBreakdown — statuses and unavailable cases', () => {
  it('makes only the dependent component incomplete, with no amounts, a reason and one notice', async () => {
    const full = breakdownOf(buildCostBreakdown(await smallRequest()))
    const result = buildCostBreakdown(await smallRequest(withoutField(completeModel(), 'rates.cuttingPerHour')))
    const breakdown = breakdownOf(result)

    expect(breakdown.job.components.cutting).toEqual({ status: 'incomplete', amount: null, reasons: ['MISSING_RATE:rates.cuttingPerHour'] })
    expect(breakdown.parts.every((p) => p.components.cutting.amount === null)).toBe(true)
    expect(breakdown.job.components.travel.amount).toBe(full.job.components.travel.amount)
    expect(breakdown.job.components.material.amount).toBe(full.job.components.material.amount)
    const notices = result.notices.filter((n) => n.code === 'MISSING_RATE')
    expect(notices).toHaveLength(1)
    expect(notices[0].message).toContain('rates.cuttingPerHour')
  })

  it('does not present an incomplete total as final and exposes only the partial subtotal', async () => {
    const full = breakdownOf(buildCostBreakdown(await smallRequest()))
    const breakdown = breakdownOf(buildCostBreakdown(await smallRequest(withoutField(completeModel(), 'rates.cuttingPerHour'))))

    expect(breakdown.job.total.status).toBe('incomplete')
    expect(breakdown.job.total.amount).toBeNull()
    expect(breakdown.job.total.partialSubtotal).toBe((full.job.total.amount as number) - (full.job.components.cutting.amount as number))
    expect(breakdown.sheets.every((s) => s.total.status === 'incomplete' && s.total.amount === null)).toBe(true)
    expect(breakdown.parts.every((p) => p.total.status === 'incomplete')).toBe(true)
  })

  it('uses a value marked as estimated and marks the dependent components and totals as estimated', async () => {
    const full = breakdownOf(buildCostBreakdown(await smallRequest()))
    const result = buildCostBreakdown(await smallRequest(withEstimated(completeModel(), 'speeds.cutting')))
    const breakdown = breakdownOf(result)

    expect(breakdown.job.components.cutting.status).toBe('estimated')
    expect(breakdown.job.components.cutting.amount).toBe(full.job.components.cutting.amount)
    expect(breakdown.job.components.material.status).toBe('complete')
    expect(breakdown.job.total.status).toBe('estimated')
    expect(breakdown.job.total.amount).toBe(full.job.total.amount)
    expect(result.notices.filter((n) => n.code === 'ESTIMATED_INPUT').map((n) => n.message)).toEqual([expect.stringContaining('speeds.cutting')])
  })

  it('lets incomplete take precedence over estimated and keeps statuses independent of the amounts', async () => {
    const both = withEstimated(withoutField(completeModel(), 'rates.travelPerHour'), 'speeds.cutting')
    const doubled = withField(both, 'rates.cuttingPerHour', { value: 120 })

    const first = breakdownOf(buildCostBreakdown(await smallRequest(both)))
    const second = breakdownOf(buildCostBreakdown(await smallRequest(doubled)))

    expect(first.job.total.status).toBe('incomplete')
    expect(second.job.total.status).toBe('incomplete')
    expect(second.job.components.cutting.status).toBe(first.job.components.cutting.status)
    expect(second.job.components.cutting.amount).not.toBe(first.job.components.cutting.amount)
  })

  it('estimates material and flags every cut-dependent component when there is no cut plan', async () => {
    const result = buildCostBreakdown(await layoutOnlyRequest())
    const breakdown = breakdownOf(result)

    expect(breakdown.job.components.material.status).toBe('complete')
    expect(breakdown.job.components.material.amount).toBeGreaterThan(0)
    for (const category of ['cutting', 'pierce', 'travel', 'consumable', 'labour'] as const) {
      expect(breakdown.job.components[category].status).toBe('incomplete')
      expect(breakdown.job.components[category].reasons).toContain('NO_CUT_PLAN')
    }
    expect(result.notices.map((n) => n.code)).toContain('NO_CUT_PLAN')
  })

  it('reports a missing sheet price per sheet kind', async () => {
    const model = completeModel()
    model.material.fullSheet = {}
    const result = buildCostBreakdown(await smallRequest(model))

    expect(breakdownOf(result).job.components.material.status).toBe('incomplete')
    expect(result.notices.filter((n) => n.code === 'MISSING_SHEET_PRICE')).toHaveLength(2)
    expect(result.notices.find((n) => n.code === 'MISSING_SHEET_PRICE')?.message).toContain('chapa inteira')
  })

  it('returns no breakdown and a specific notice for a rejected artifact, an unsupported version and an invalid model', async () => {
    const rejected = buildCostBreakdown(await rejectedRequest())
    expect(rejected.breakdown).toBeNull()
    expect(rejected.notices.map((n) => n.code)).toEqual(['NO_LAYOUT'])
    expect(rejected.notices[0].severity).toBe('error')

    const small = await smallRequest()
    const old = buildCostBreakdown({ ...small, artifact: { ...small.artifact, contractVersion: 2 } })
    expect(old.breakdown).toBeNull()
    expect(old.notices.map((n) => n.code)).toEqual(['UNSUPPORTED_CONTRACT_VERSION'])

    const invalid = buildCostBreakdown(await smallRequest(withField(completeModel(), 'rates.cuttingPerHour', { value: -1 })))
    expect(invalid.breakdown).toBeNull()
    expect(invalid.notices.map((n) => n.code)).toEqual(['INVALID_COST_MODEL'])
  })

  it('keeps the sheet and job totals incomplete when only one sheet has an incomplete input', async () => {
    const { request } = await remnantFixture()
    request.costModel.material.remnant = {}

    const breakdown = breakdownOf(buildCostBreakdown(request))

    expect(breakdown.job.components.material.status).toBe('incomplete')
    expect(breakdown.sheets[0].components.material.amount).toBeNull()
    expect(breakdown.job.total.amount).toBeNull()
  })

  it('raises exactly one notice, with its code and the input path, for each missing speed, dwell and consumable life', async () => {
    const cases: [string, string, string][] = [
      ['speeds.cutting', 'MISSING_SPEED', 'speeds.cutting'],
      ['speeds.rapid', 'MISSING_SPEED', 'speeds.rapid'],
      ['speeds.pierceDwellSeconds', 'MISSING_DWELL', 'perfuração'],
    ]
    for (const [path, code, text] of cases) {
      const result = buildCostBreakdown(await smallRequest(withoutField(completeModel(), path)))
      const notices = result.notices.filter((n) => n.code === code && n.message.includes(text))
      expect(notices).toHaveLength(1)
      expect(notices[0].severity).toBe('warning')
    }

    const model = completeModel()
    delete model.consumables[0].life
    const life = buildCostBreakdown(await smallRequest(model)).notices.filter((n) => n.code === 'MISSING_CONSUMABLE_LIFE')
    expect(life).toHaveLength(1)
    expect(life[0].message).toContain('nozzle')
  })
})
