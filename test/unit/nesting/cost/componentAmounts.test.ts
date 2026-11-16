import { expect } from 'expect'
import type { ActionUsage, PartUsageRecord, UsageResult } from '../../../../src/nesting/cost/collectUsage'
import { componentAmounts } from '../../../../src/nesting/cost/componentAmounts'
import type { CostModel } from '../../../../src/nesting/cost/types'
import { completeModel, withEstimated, withField, withoutField } from './fixtures'

const cut = (length: number): ActionUsage => ({ category: 'cut', length, feed: null, dwell: null })
const travel = (length: number): ActionUsage => ({ category: 'travel', length, feed: null, dwell: null })
const pierce = (): ActionUsage => ({ category: 'pierce', length: 0, feed: null, dwell: null })

const part = (key: string, sheetId: string, netArea: number, actions: ActionUsage[] = []): PartUsageRecord => ({
  key, shapeId: key.split('#')[0], instanceIndex: 0, sheetId, netArea, actions,
})

/** Sheet-1 (full) with A and B, sheet-2 (remnant) with C. */
const usage = (): UsageResult => ({
  planPresent: true,
  notices: [],
  sheets: [
    {
      sheetId: 'sheet-1', kind: 'sheet', unallocated: [],
      parts: [part('A#0', 'sheet-1', 300, [cut(1000), travel(5000), pierce(), pierce()]), part('B#0', 'sheet-1', 100)],
    },
    { sheetId: 'sheet-2', kind: 'remnant', unallocated: [], parts: [part('C#0', 'sheet-2', 50)] },
  ],
})

const model = (): CostModel => {
  const base = completeModel()
  base.material = { fullSheet: { 'sheet-1': { value: 100 } }, remnant: { 'sheet-2': { value: 30 } } }
  return base
}

describe('cost/componentAmounts — complete inputs', () => {
  it('prices a full sheet and a remnant by their own value and distributes it by net area', () => {
    const { exact } = componentAmounts(usage(), model())

    expect(exact.material[0]).toBeCloseTo(7500)
    expect(exact.material[1]).toBeCloseTo(2500)
    expect(exact.material[2]).toBeCloseTo(3000)
  })

  it('charges cutting, pierce and travel from time and count at the supplied rates', () => {
    const { exact } = componentAmounts(usage(), model())

    expect(exact.cutting[0]).toBeCloseTo(50)
    expect(exact.pierce[0]).toBeCloseTo(20)
    expect(exact.travel[0]).toBeCloseTo(25)
    expect(exact.cutting[1]).toBe(0)
  })

  it('charges each consumable per use, by pierces and by cutting seconds', () => {
    const { exact } = componentAmounts(usage(), model())

    expect(exact.consumable[0]).toBeCloseTo(10 + 16.6667, 3)
    expect(exact.consumable[1]).toBe(0)
  })

  it('charges labour from machine time plus handling per sheet and per job, distributed by net area', () => {
    const { exact, distributed } = componentAmounts(usage(), model())

    const machine = (61 * 40 * 100) / 3600
    const sheetHandling = (60 * 40 * 100) / 3600
    const jobHandling = (120 * 40 * 100) / 3600
    expect(exact.labour[0]).toBeCloseTo(machine + sheetHandling * 0.75 + jobHandling * (300 / 450), 3)
    expect(exact.labour[1]).toBeCloseTo(sheetHandling * 0.25 + jobHandling * (100 / 450), 3)
    expect(exact.labour[2]).toBeCloseTo(sheetHandling + jobHandling * (50 / 450), 3)
    expect(distributed).toContainEqual({ category: 'labour', scope: 'job', exact: expect.closeTo(jobHandling, 3) })
    expect(distributed.filter((d) => d.scope === 'sheet' && d.category === 'labour')).toHaveLength(2)
  })

  it('distributes amounts without an owner part over the placed parts of their sheet by net area', () => {
    const data = usage()
    data.sheets[0].unallocated = [travel(1000)]

    const { exact, distributed } = componentAmounts(data, model())

    expect(exact.travel[0]).toBeCloseTo(25 + 5 * 0.75, 3)
    expect(exact.travel[1]).toBeCloseTo(5 * 0.25, 3)
    expect(distributed).toContainEqual({ category: 'travel', scope: 'sheet', scopeId: 'sheet-1', exact: expect.closeTo(5, 3) })
  })

  it('splits the price of a sheet equally when no part on it has positive net area', () => {
    const data = usage()
    data.sheets[0].parts = [part('A#0', 'sheet-1', 0), part('B#0', 'sheet-1', 0)]

    const { exact } = componentAmounts(data, model())

    expect(exact.material[0]).toBeCloseTo(5000)
    expect(exact.material[1]).toBeCloseTo(5000)
  })

  it('does not charge a sheet without parts and gives a zero amount for a zero rate', () => {
    const data = usage()
    data.sheets.push({ sheetId: 'sheet-3', kind: 'sheet', parts: [], unallocated: [] })
    const zero = withField(model(), 'rates.cuttingPerHour', { value: 0 })

    const { exact } = componentAmounts(data, zero)

    expect(exact.material).toHaveLength(3)
    expect(exact.cutting[0]).toBe(0)
  })

  it('expresses amounts in the smallest currency unit of the model', () => {
    const yen = withField(model(), 'currency', { code: 'JPY', minorUnitDigits: 0 })

    const { exact } = componentAmounts(usage(), yen)

    expect(exact.material[0]).toBeCloseTo(75)
  })
})

describe('cost/componentAmounts — statuses', () => {
  const statusOf = (data: UsageResult, source: CostModel, planPresent = true) =>
    componentAmounts({ ...data, planPresent }, source).status

  it('marks complete inputs complete without reasons', () => {
    const status = statusOf(usage(), model())

    expect(Object.values(status).every((s) => s.status === 'complete' && s.reasons.length === 0)).toBe(true)
  })

  it('makes exactly the dependent components incomplete when a rate, speed, dwell, life or price is missing', () => {
    const cases: [string, string[], string][] = [
      ['rates.cuttingPerHour', ['cutting'], 'MISSING_RATE:rates.cuttingPerHour'],
      ['rates.travelPerHour', ['travel'], 'MISSING_RATE:rates.travelPerHour'],
      ['rates.piercePerUnit', ['pierce'], 'MISSING_RATE:rates.piercePerUnit'],
      ['speeds.cutting', ['cutting', 'consumable', 'labour'], 'MISSING_SPEED:speeds.cutting'],
      ['speeds.rapid', ['travel', 'labour'], 'MISSING_SPEED:speeds.rapid'],
      ['speeds.pierceDwellSeconds', ['labour'], 'MISSING_DWELL:speeds.pierceDwellSeconds'],
      ['rates.labourPerHour', ['labour'], 'MISSING_RATE:rates.labourPerHour'],
      ['handling.secondsPerSheet', ['labour'], 'MISSING_RATE:handling.secondsPerSheet'],
      ['handling.secondsPerJob', ['labour'], 'MISSING_RATE:handling.secondsPerJob'],
    ]
    for (const [path, incomplete, reason] of cases) {
      const status = statusOf(usage(), withoutField(model(), path))
      const found = Object.entries(status).filter(([, s]) => s.status === 'incomplete').map(([name]) => name)
      expect(found.sort()).toEqual([...incomplete].sort())
      expect(status[incomplete[0] as keyof typeof status].reasons).toContain(reason)
    }
  })

  it('makes material incomplete when the price of a used sheet or remnant is missing', () => {
    const noPrice = model()
    noPrice.material.fullSheet = {}

    const status = statusOf(usage(), noPrice)

    expect(status.material.status).toBe('incomplete')
    expect(status.material.reasons).toEqual(['MISSING_SHEET_PRICE:sheet-1'])
  })

  it('makes the consumable component incomplete when a life is missing', () => {
    const noLife = model()
    delete noLife.consumables[0].life

    const status = statusOf(usage(), noLife)

    expect(status.consumable.status).toBe('incomplete')
    expect(status.consumable.reasons).toContain('MISSING_CONSUMABLE_LIFE:nozzle')
  })

  it('does not invent a value: an incomplete category has zero exact amounts and the others keep theirs', () => {
    const { exact } = componentAmounts(usage(), withoutField(model(), 'rates.cuttingPerHour'))

    expect(exact.cutting.every((v) => v === 0)).toBe(true)
    expect(exact.material[0]).toBeCloseTo(7500)
    expect(exact.travel[0]).toBeCloseTo(25)
  })

  it('treats a zero value as valid and an absent value as missing', () => {
    expect(statusOf(usage(), withField(model(), 'rates.cuttingPerHour', { value: 0 })).cutting.status).toBe('complete')
    expect(statusOf(usage(), withoutField(model(), 'rates.cuttingPerHour')).cutting.status).toBe('incomplete')
  })

  it('marks every component that used an estimated value as estimated, with a reason per input', () => {
    const status = statusOf(usage(), withEstimated(model(), 'speeds.cutting'))

    expect(status.cutting).toEqual({ status: 'estimated', reasons: ['ESTIMATED:speeds.cutting'] })
    expect(status.consumable.status).toBe('estimated')
    expect(status.labour.status).toBe('estimated')
    expect(status.material.status).toBe('complete')
    expect(status.pierce.status).toBe('complete')
  })

  it('makes every cut-dependent component incomplete without a cut plan, keeping material', () => {
    const status = statusOf(usage(), model(), false)

    expect(status.material.status).toBe('complete')
    for (const category of ['cutting', 'pierce', 'travel', 'consumable', 'labour'] as const) {
      expect(status[category].status).toBe('incomplete')
      expect(status[category].reasons).toContain('NO_CUT_PLAN')
    }
  })
})
