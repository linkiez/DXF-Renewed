import { message } from '../machine/messages'
import { cells } from './rowReader'
import { rowToEntry } from './rowToEntry'
import type { CutChartEntry, CutChartImport, CutChartInput, CutChartIssue, CutChartRow, SeparationRule } from './types'

function separationOf(row: CutChartRow): SeparationRule | undefined {
  const material = cells.text(row.Material)
  const thickness = cells.optional(row, 'Thickness')
  const part = cells.optional(row, 'Part Sep')
  const plate = cells.optional(row, 'Plate Sep')
  const pierce = cells.optional(row, 'Pierce Sep')
  if (!material || thickness === undefined || part === undefined || plate === undefined || pierce === undefined) return undefined
  return { material, thickness, part, plate, pierce }
}

/**
 * Import the cut chart table from rows supplied by the caller.
 *
 * The library reads no file: the host converts the workbook to rows. The unit comes from the unit marker; a row that
 * cannot be read, or that uses an unknown code, is reported once with its position and left out.
 *
 * @param input - Unit marker, table identity, rows and separation rows.
 * @returns The table (absent when the unit is missing) and the issues.
 */
export function importCutChartTable(input: CutChartInput): CutChartImport {
  const unit = input.unitMarker.trim()
  if (unit !== 'mm' && unit !== 'in') {
    return { issues: [{ code: 'CUTCHART_UNIT_MISSING', message: message('CUTCHART_UNIT_MISSING') }] }
  }
  const entries: CutChartEntry[] = []
  const issues: CutChartIssue[] = []
  input.rows.forEach((row, index) => {
    const result = rowToEntry(row, index + 1)
    if ('entry' in result) entries.push(result.entry)
    else issues.push(result.issue)
  })
  const separations = (input.separations ?? []).map(separationOf).filter((rule): rule is SeparationRule => rule !== undefined)
  return {
    table: {
      unit,
      ...(input.software !== undefined ? { software: input.software } : {}),
      ...(input.powerSupply !== undefined ? { powerSupply: input.powerSupply } : {}),
      entries,
      separations,
    },
    issues,
  }
}
