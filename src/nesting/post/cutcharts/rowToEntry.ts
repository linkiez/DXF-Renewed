import { message } from '../machine/messages'
import { unknownChartField } from './codeLists'
import { cells } from './rowReader'
import type { CutChartEntry, CutChartHeight, CutChartIssue, CutChartRow, CutChartToggles } from './types'

const REQUIRED = ['Thickness', 'Feedrate', 'Kerf', 'Cut Chart Type', 'Cut Chart Material', 'Cut Chart Current', 'Cut Chart Gas', 'Cut Chart Thickness'] as const

const HEIGHT_COLUMNS: ReadonlyArray<readonly [keyof CutChartHeight, string]> = [
  ['arcVoltage', 'Arc Voltage'],
  ['pierceTime', 'Pierce Time'],
  ['pierceHeightFactor', 'Pierce Height Factor'],
  ['cutHeight', 'Cut Height'],
  ['transferHeightFactor', 'Transfer Height Factor'],
  ['cutHeightDelay', 'Cut Height Delay'],
  ['kerfRedetect', 'Kerf Redetect'],
  ['edgePierceTime', 'Edge Pierce Time'],
  ['edgePierceHeightFactor', 'Edge Pierce Height Factor'],
  ['edgeTransferHeightFactor', 'Edge Transfer Height Factor'],
]

const toggles = (row: CutChartRow): CutChartToggles => ({
  trueHole: cells.flag(row['True Hole']),
  fineFeature: cells.flag(row['Fine Feature']),
  hdi: cells.flag(row.HDi),
  thickPierce: cells.flag(row['Thick Pierce']),
  underwater: cells.flag(row.Underwater),
  bevel: cells.flag(row.Bevel),
  edgePierceOnly: cells.flag(row['Edge Pierce Only']),
})

function height(row: CutChartRow): CutChartHeight {
  const out: Record<string, number> = {}
  for (const [key, column] of HEIGHT_COLUMNS) {
    const value = cells.optional(row, column)
    if (value !== undefined) out[key] = value
  }
  return out
}

const invalid = (rowNumber: number, detail: string): CutChartIssue => ({
  code: 'CUTCHART_ROW_INVALID',
  rowNumber,
  message: message('CUTCHART_ROW_INVALID', { row: rowNumber, detail }),
})

/**
 * Turn one workbook row into a cut chart entry.
 *
 * @param row - Row keyed by the workbook's English column names.
 * @param rowNumber - One-based position of the row in the input.
 * @returns The entry, or the issue that makes the row unusable.
 */
export function rowToEntry(row: CutChartRow, rowNumber: number): { entry: CutChartEntry } | { issue: CutChartIssue } {
  const material = cells.text(row.Material)
  const cls = cells.text(row.Class)
  if (!material) return { issue: invalid(rowNumber, 'coluna "Material" ausente') }
  if (!cls) return { issue: invalid(rowNumber, 'coluna "Class" ausente') }
  const bad = REQUIRED.find((column) => !((cells.optional(row, column) ?? 0) > 0))
  if (bad) return { issue: invalid(rowNumber, `coluna "${bad}" ausente ou ilegível`) }
  const value = (column: string): number => cells.optional(row, column) as number
  const chart = {
    type: value('Cut Chart Type'),
    material: value('Cut Chart Material'),
    current: value('Cut Chart Current'),
    gas: value('Cut Chart Gas'),
    thickness: value('Cut Chart Thickness'),
    ...(cells.optional(row, 'Cut Chart Cutting Surface') !== undefined ? { surface: value('Cut Chart Cutting Surface') } : {}),
  }
  const unknown = unknownChartField(chart)
  if (unknown) {
    return { issue: { code: 'CUTCHART_CODE_UNKNOWN', rowNumber, message: message('CUTCHART_CODE_UNKNOWN', { row: rowNumber, field: unknown, value: chart[unknown] }) } }
  }
  const feed = value('Feedrate')
  const kerf = value('Kerf')
  return {
    entry: {
      rowNumber,
      material,
      thickness: value('Thickness'),
      class: cls,
      profile: { type: cells.text(row['Profile Type']) ?? '*', diameter: cells.text(row.Diameter) ?? '*', area: cells.text(row['Profile Area']) ?? '*' },
      feed: { base: cells.optional(row, 'Base Feedrate') ?? feed, percent: cells.optional(row, 'Feedrate %') ?? 100, value: feed, leadIn: cells.optional(row, 'Lead In Feedrate') ?? feed },
      kerf: { base: cells.optional(row, 'Base Kerf') ?? kerf, adjustment: cells.optional(row, 'Process Variation Adjustment') ?? 0, value: kerf },
      chart,
      height: height(row),
      toggles: toggles(row),
      outputs: { v500: cells.flag(row.V500), v600: cells.flag(row.V600), m50n: cells.flag(row['M50 N']), rt: cells.flag(row.RT), hs: cells.flag(row.HS) },
    },
  }
}
