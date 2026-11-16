import { expect } from 'expect'
import { validateCostModel } from '../../../../src/nesting/cost/validateCostModel'
import type { CostModel } from '../../../../src/nesting/cost/types'
import { completeModel, withField } from './fixtures'

const codes = (model: CostModel): string[] => validateCostModel(model).map((n) => n.code)

describe('cost/validateCostModel', () => {
  it('accepts the complete model without any notice', () => {
    expect(validateCostModel(completeModel())).toEqual([])
  })

  it('rejects negative or non-numeric rates, prices, handling times and consumable costs, naming the field', () => {
    const cases: [string, unknown][] = [
      ['rates.cuttingPerHour', { value: -1 }],
      ['rates.labourPerHour', { value: Number.NaN }],
      ['rates.piercePerUnit', { value: Number.POSITIVE_INFINITY }],
      ['handling.secondsPerSheet', { value: -5 }],
      ['material.fullSheet', { 'sheet-1': { value: -100 } }],
    ]
    for (const [path, value] of cases) {
      const notices = validateCostModel(withField(completeModel(), path, value))
      expect(notices.map((n) => n.code)).toContain('INVALID_COST_MODEL')
      expect(notices[0].severity).toBe('error')
      expect(notices[0].message).toContain(path.split('.')[0])
    }
  })

  it('rejects a speed of zero or less and a consumable life of zero or less', () => {
    expect(codes(withField(completeModel(), 'speeds.cutting', { value: 0 }))).toContain('INVALID_COST_MODEL')
    expect(codes(withField(completeModel(), 'speeds.rapid', { value: -3 }))).toContain('INVALID_COST_MODEL')
    const model = completeModel()
    model.consumables[0].life = { value: { unit: 'pierces', amount: 0 } }
    const notices = validateCostModel(model)
    expect(notices.map((n) => n.code)).toContain('INVALID_COST_MODEL')
    expect(notices.find((n) => n.code === 'INVALID_COST_MODEL')?.message).toContain('nozzle')
  })

  it('rejects a bad currency code, minor-unit digits, geometry unit and duplicate consumable ids', () => {
    expect(codes(withField(completeModel(), 'currency', { code: 'brl', minorUnitDigits: 2 }))).toContain('INVALID_COST_MODEL')
    expect(codes(withField(completeModel(), 'currency', { code: 'BRL', minorUnitDigits: 5 }))).toContain('INVALID_COST_MODEL')
    expect(codes(withField(completeModel(), 'geometryUnitsPerMeter', 0))).toContain('INVALID_COST_MODEL')
    const model = completeModel()
    model.consumables.push({ ...model.consumables[0] })
    expect(codes(model)).toContain('INVALID_COST_MODEL')
  })

  it('rejects values declared in another currency with MIXED_CURRENCY', () => {
    const model = withField(completeModel(), 'rates.cuttingPerHour', { value: 60, currency: 'USD' })

    const notices = validateCostModel(model)

    expect(notices.map((n) => n.code)).toEqual(['MIXED_CURRENCY'])
    expect(notices[0].message).toContain('USD')
  })

  it('accepts a value that declares the same currency and returns every issue at once without throwing', () => {
    const same = withField(completeModel(), 'rates.cuttingPerHour', { value: 60, currency: 'BRL' })
    expect(validateCostModel(same)).toEqual([])

    const many = withField(withField(completeModel(), 'rates.cuttingPerHour', { value: -1 }), 'speeds.cutting', { value: 0 })
    expect(validateCostModel(many).length).toBeGreaterThanOrEqual(2)
  })

  it('does not treat an absent optional field as invalid', () => {
    const model = completeModel()
    delete model.rates
    delete model.handling

    expect(validateCostModel(model)).toEqual([])
  })
})
