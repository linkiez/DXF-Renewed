import { COST_CATEGORIES } from './types'
import type { CostGroup, CostReport, CostTable, TimeByCategory } from './types'

type Cell = string | number | null

const PART_COLUMNS = [
  'part_key', 'shape_id', 'instance_index', 'sheet_id', 'net_area', 'cut_length', 'travel_length',
  'pierce_count', 'cutting_seconds', 'travel_seconds', 'pierce_seconds', ...COST_CATEGORIES, 'total',
  'status', 'currency',
]
const JOB_COLUMNS = ['scope', 'scope_id', 'metric', 'status', 'value', 'currency']
const DECIMALS = 3

const fixed = (value: number | null): string | null => (value === null ? null : value.toFixed(DECIMALS))

const partRows = (report: CostReport): Cell[][] =>
  (report.breakdown?.parts ?? []).map((part) => [
    part.key, part.shapeId, part.instanceIndex, part.sheetId,
    fixed(part.usage.netArea), fixed(part.usage.cutLength), fixed(part.usage.travelLength), part.usage.pierceCount,
    fixed(part.usage.cuttingSeconds), fixed(part.usage.travelSeconds), fixed(part.usage.pierceSeconds),
    ...COST_CATEGORIES.map((category) => part.components[category].amount),
    part.total.amount, part.total.status, report.currency.code,
  ])

const timeRows = (time: TimeByCategory): [string, string | null][] => [
  ['time.cutting_seconds', fixed(time.cuttingSeconds)],
  ['time.travel_seconds', fixed(time.travelSeconds)],
  ['time.pierce_seconds', fixed(time.pierceSeconds)],
  ['time.handling_seconds', fixed(time.handlingSeconds)],
  ['time.total_seconds', fixed(time.totalSeconds)],
]

const scopeRows = (scope: 'job' | 'sheet', scopeId: string, group: CostGroup, time: TimeByCategory | undefined, currency: string): Cell[][] => {
  const row = (metric: string, status: string, value: Cell): Cell[] => [scope, scopeId, metric, status, value, currency]
  const costs = COST_CATEGORIES.map((category) =>
    row(`cost.${category}`, group.components[category].status, group.components[category].amount))
  const totals = [
    row('cost.total', group.total.status, group.total.amount),
    row('cost.partial_subtotal', group.total.status, group.total.partialSubtotal),
  ]
  const times = timeRows(time ?? { cuttingSeconds: null, travelSeconds: null, pierceSeconds: null, handlingSeconds: null, totalSeconds: null })
    .map(([metric, value]) => row(metric, value === null ? 'incomplete' : 'complete', value))
  return [...costs, ...totals, ...times]
}

const productionRows = (report: CostReport): Cell[][] => {
  const production = report.production
  if (!production) return []
  const row = (metric: string, value: Cell): Cell[] => ['job', '', metric, 'complete', value, report.currency.code]
  return [
    row('production.sheets_used', production.sheetsUsed),
    row('production.yield', fixed(production.yield)),
    row('production.waste_area', fixed(production.wasteArea)),
    row('production.total_area', fixed(production.totalArea)),
    row('production.unplaced_quantity', production.unplaced.reduce((total, item) => total + item.quantity, 0)),
  ]
}

const jobRows = (report: CostReport): Cell[][] => {
  const { breakdown, production } = report
  if (!breakdown) return []
  const currency = report.currency.code
  return [
    ...scopeRows('job', '', breakdown.job, production?.time.job, currency),
    ...productionRows(report),
    ...breakdown.sheets.flatMap((sheet) =>
      scopeRows('sheet', sheet.sheetId, sheet, production?.time.sheets.find((item) => item.sheetId === sheet.sheetId), currency)),
  ]
}

/**
 * Projects a report into the two export tables: one row per placed part, and the job and sheet
 * metrics in a fixed order. Amounts are integers in minor units; lengths, areas and seconds are
 * strings with exactly three decimals; an incomplete value is `null`.
 *
 * @param report - Cost report.
 * @returns The `parts` and `job` tables; header-only for an unavailable report.
 */
export function costReportTables(report: CostReport): { parts: CostTable; job: CostTable } {
  return {
    parts: { columns: PART_COLUMNS, rows: partRows(report) },
    job: { columns: JOB_COLUMNS, rows: jobRows(report) },
  }
}
