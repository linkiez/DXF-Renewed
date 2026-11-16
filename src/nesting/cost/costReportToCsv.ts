import { costReportTables } from './costReportTables'
import type { CostReport, CostTable } from './types'

const cell = (value: string | number | null): string => {
  if (value === null) return ''
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const toCsv = (table: CostTable): string =>
  [table.columns, ...table.rows].map((row) => row.map(cell).join(',')).join('\n') + '\n'

/**
 * Writes the two export tables as RFC 4180 text: UTF-8, comma separator, LF line ends, header row,
 * decimal point, empty cells for incomplete values and quotes doubled inside quoted fields.
 *
 * @param report - Cost report.
 * @returns The `parts` and `job` tables as text; the output does not depend on the process locale.
 */
export function costReportToCsv(report: CostReport): { parts: string; job: string } {
  const tables = costReportTables(report)
  return { parts: toCsv(tables.parts), job: toCsv(tables.job) }
}
