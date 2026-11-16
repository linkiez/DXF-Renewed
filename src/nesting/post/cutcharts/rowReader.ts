import type { CutChartCell, CutChartRow } from './types'

function number(cell: CutChartCell): number | undefined {
  if (typeof cell === 'number') return Number.isFinite(cell) ? cell : undefined
  if (typeof cell === 'string' && cell.trim() !== '') {
    const value = Number(cell)
    return Number.isFinite(value) ? value : undefined
  }
  return undefined
}

/** Readers of the cells of a cut chart row. Internal. */
export const cells = {
  /** Numeric cell; numeric text is accepted, anything else is `undefined`. */
  number,
  /** Text cell; empty text is `undefined`. */
  text(cell: CutChartCell): string | undefined {
    if (typeof cell === 'string') return cell.trim() === '' ? undefined : cell
    if (typeof cell === 'number') return String(cell)
    return undefined
  },
  /** Toggle cell: `1` or `true` is on. */
  flag(cell: CutChartCell): boolean {
    return cell === true || number(cell) === 1
  },
  /** Optional numeric column of a row. */
  optional(row: CutChartRow, column: string): number | undefined {
    return number(row[column])
  },
}
