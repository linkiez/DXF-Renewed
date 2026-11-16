import { expect } from 'expect'
import { firstValueFrom } from 'rxjs'
import { calculateCostReport } from '../../../../src/nesting/cost/calculateCostReport'
import { costReportTables } from '../../../../src/nesting/cost/costReportTables'
import { costReportToCsv } from '../../../../src/nesting/cost/costReportToCsv'
import type { CostReport } from '../../../../src/nesting/cost/types'
import { COST_CATEGORIES } from '../../../../src/nesting/cost/types'
import { completeModel, partialRequest, referenceRequest, rejectedRequest, smallRequest, withoutField } from './fixtures'

const reportOf = async (request: Awaited<ReturnType<typeof smallRequest>>): Promise<CostReport> =>
  firstValueFrom(calculateCostReport(request))

const PART_COLUMNS = [
  'part_key', 'shape_id', 'instance_index', 'sheet_id', 'net_area', 'cut_length', 'travel_length',
  'pierce_count', 'cutting_seconds', 'travel_seconds', 'pierce_seconds', 'material', 'cutting',
  'pierce', 'travel', 'consumable', 'labour', 'total', 'status', 'currency',
]
const JOB_COLUMNS = ['scope', 'scope_id', 'metric', 'status', 'value', 'currency']
const COST_METRICS = [
  'cost.material', 'cost.cutting', 'cost.pierce', 'cost.travel', 'cost.consumable', 'cost.labour',
  'cost.total', 'cost.partial_subtotal',
]
const TIME_METRICS = ['time.cutting_seconds', 'time.travel_seconds', 'time.pierce_seconds', 'time.handling_seconds', 'time.total_seconds']
const PRODUCTION_METRICS = ['production.sheets_used', 'production.yield', 'production.waste_area', 'production.total_area', 'production.unplaced_quantity']

describe('cost/costReportTables', () => {
  it('has the contract columns and one row per placed part in artifact order', async () => {
    const { parts } = costReportTables(await reportOf(await smallRequest()))

    expect(parts.columns).toEqual(PART_COLUMNS)
    expect(parts.rows).toHaveLength(4)
    expect(parts.rows.map((row) => row[0])).toEqual(['part-1#0', 'part-2#0', 'part-3#0', 'part-4#0'])
    expect(parts.rows.every((row) => row.length === PART_COLUMNS.length)).toBe(true)
  })

  it('writes amounts as integers, measures with exactly three decimals and the currency code', async () => {
    const { parts } = costReportTables(await reportOf(await smallRequest()))
    const row = parts.rows[0]
    const at = (name: string) => row[PART_COLUMNS.indexOf(name)]

    expect(Number.isInteger(at('material'))).toBe(true)
    expect(Number.isInteger(at('total'))).toBe(true)
    expect(Number.isInteger(at('pierce_count'))).toBe(true)
    expect(at('net_area')).toMatch(/^\d+\.\d{3}$/)
    expect(at('cut_length')).toMatch(/^\d+\.\d{3}$/)
    expect(at('cutting_seconds')).toMatch(/^\d+\.\d{3}$/)
    expect(at('currency')).toBe('BRL')
    expect(at('status')).toBe('complete')
  })

  it('puts job rows first and then each sheet, with the metrics in the fixed order and production only for the job', async () => {
    const { job } = costReportTables(await reportOf(await smallRequest()))
    const scopes = [...new Set(job.rows.map((row) => `${row[0]}:${row[1]}`))]

    expect(job.columns).toEqual(JOB_COLUMNS)
    expect(scopes).toEqual(['job:', 'sheet:sheet-1', 'sheet:sheet-2'])
    expect(job.rows.filter((r) => r[0] === 'job').map((r) => r[2])).toEqual([...COST_METRICS, ...TIME_METRICS, ...PRODUCTION_METRICS])
    expect(job.rows.filter((r) => r[1] === 'sheet-1').map((r) => r[2])).toEqual([...COST_METRICS, ...TIME_METRICS])
  })

  it('leaves an incomplete amount or time empty and marks its status', async () => {
    const report = await reportOf(await smallRequest(withoutField(completeModel(), 'rates.cuttingPerHour')))
    const { parts, job } = costReportTables(report)

    expect(parts.rows[0][PART_COLUMNS.indexOf('cutting')]).toBeNull()
    expect(parts.rows[0][PART_COLUMNS.indexOf('total')]).toBeNull()
    expect(parts.rows[0][PART_COLUMNS.indexOf('status')]).toBe('incomplete')
    const total = job.rows.find((r) => r[0] === 'job' && r[2] === 'cost.total')
    expect(total?.[3]).toBe('incomplete')
    expect(total?.[4]).toBeNull()
    expect(job.rows.find((r) => r[0] === 'job' && r[2] === 'cost.partial_subtotal')?.[4]).toBe(report.breakdown?.job.total.partialSubtotal)
  })

  it('sums the unplaced quantity and gives empty tables for an unavailable report', async () => {
    const withUnplaced = costReportTables(await reportOf(await partialRequest()))
    expect(withUnplaced.job.rows.find((r) => r[2] === 'production.unplaced_quantity')?.[4]).toBe(1)

    const unavailable = costReportTables(await reportOf(await rejectedRequest()))
    expect(unavailable.parts.rows).toEqual([])
    expect(unavailable.job.rows).toEqual([])
    expect(unavailable.parts.columns).toEqual(PART_COLUMNS)
  })
})

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1 } else if (char === '"') quoted = false
      else field += char
    } else if (char === '"') quoted = true
    else if (char === ',') { row.push(field); field = '' }
    else if (char === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else field += char
  }
  return rows
}

describe('cost/costReportToCsv', () => {
  it('writes RFC 4180 text: header row, commas, LF line ends, decimal point and empty cells', async () => {
    const csv = costReportToCsv(await reportOf(await smallRequest(withoutField(completeModel(), 'rates.cuttingPerHour'))))

    expect(csv.parts.split('\n')[0]).toBe(PART_COLUMNS.join(','))
    expect(csv.parts.endsWith('\n')).toBe(true)
    expect(csv.parts).not.toContain('\r')
    expect(csv.parts).toMatch(/,\d+\.\d{3},/)
    const row = parseCsv(csv.parts)[1]
    expect(row[PART_COLUMNS.indexOf('cutting')]).toBe('')
    expect(row[PART_COLUMNS.indexOf('status')]).toBe('incomplete')
  })

  it('quotes fields with a comma, a quote or a line break, doubling quotes', async () => {
    const request = await smallRequest()
    const layout = request.artifact.layout
    if (!layout) throw new Error('fixture without layout')
    const renamed = { ...layout, sheets: layout.sheets.map((s) => (s.id === 'sheet-1' ? { ...s, id: 'a,"b"\nc' } : s)), placements: layout.placements.map((p) => (p.sheetId === 'sheet-1' ? { ...p, sheetId: 'a,"b"\nc' } : p)) }
    const model = completeModel()
    model.material.fullSheet = { 'a,"b"\nc': { value: 100 }, 'sheet-2': { value: 120 } }
    const report = await reportOf({ ...request, artifact: { ...request.artifact, layout: renamed }, layout: undefined, cutPlan: undefined, costModel: model })

    const csv = costReportToCsv(report)

    expect(csv.parts).toContain('"a,""b""\nc"')
    expect(parseCsv(csv.parts)[1][PART_COLUMNS.indexOf('sheet_id')]).toBe('a,"b"\nc')
  })

  it('is identical for identical reports and independent of the process locale', async () => {
    const report = await reportOf(await smallRequest())
    const first = costReportToCsv(report)
    const original = Number.prototype.toLocaleString
    Number.prototype.toLocaleString = () => '1.234,5'
    try {
      expect(costReportToCsv(report)).toEqual(first)
    } finally {
      Number.prototype.toLocaleString = original
    }
  })

  it('reproduces the totals when read back: the parts add up to the job for every category (SC-007)', async () => {
    for (const request of [await smallRequest(), await referenceRequest()]) {
      const report = await reportOf(request)
      const csv = costReportToCsv(report)
      const parts = parseCsv(csv.parts).slice(1)
      const job = parseCsv(csv.job).slice(1).filter((row) => row[0] === 'job')

      for (const category of COST_CATEGORIES) {
        const total = parts.reduce((sum, row) => sum + Number(row[PART_COLUMNS.indexOf(category)]), 0)
        const jobRow = job.find((row) => row[2] === `cost.${category}`)
        expect(Number(jobRow?.[4])).toBe(total)
      }
      const grand = parts.reduce((sum, row) => sum + Number(row[PART_COLUMNS.indexOf('total')]), 0)
      expect(Number(job.find((row) => row[2] === 'cost.total')?.[4])).toBe(grand)
      expect(Number(job.find((row) => row[2] === 'cost.total')?.[4])).toBe(report.breakdown?.job.total.amount)
    }
  })

  it('gives header-only text for an unavailable report', async () => {
    const csv = costReportToCsv(await reportOf(await rejectedRequest()))

    expect(csv.parts).toBe(`${PART_COLUMNS.join(',')}\n`)
    expect(csv.job).toBe(`${JOB_COLUMNS.join(',')}\n`)
  })
})
