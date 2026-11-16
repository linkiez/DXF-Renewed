import type { CutChartCodes } from './types'

/** Currents of the vendor list (amps). */
const CURRENTS = new Set([
  5, 7, 8, 9, 10, 15, 18, 20, 22, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 85, 100, 105, 125, 130, 150, 200, 260, 275, 300,
  340, 400, 500, 600, 760, 800, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000,
])

const inRange = (value: number, min: number, max: number): boolean => Number.isInteger(value) && value >= min && value <= max

const CHECKS: ReadonlyArray<readonly [keyof CutChartCodes, (value: number) => boolean]> = [
  ['type', (v) => inRange(v, 1, 71) && v !== 41],
  ['material', (v) => inRange(Math.floor(v), 1, 6)],
  ['current', (v) => CURRENTS.has(v)],
  ['gas', (v) => inRange(v, 1, 29)],
  ['thickness', (v) => inRange(v, 1, 115)],
  ['surface', (v) => inRange(v, 1, 2)],
]

/**
 * Find the first cut chart code that the vendor code lists do not define.
 *
 * The lists are those of the EDGE Connect Programmer Reference 809550 (torch types, materials, currents, gases,
 * thickness codes and cutting surfaces).
 *
 * @param chart - Codes of a row.
 * @returns The name of the first unknown code, or `undefined` when all are known.
 */
export function unknownChartField(chart: CutChartCodes): keyof CutChartCodes | undefined {
  for (const [field, known] of CHECKS) {
    const value = chart[field]
    if (value !== undefined && !known(value)) return field
  }
  return undefined
}
