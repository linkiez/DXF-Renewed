import { EPSILON } from '../../config'
import { message } from '../machine/messages'
import type { CutChartAbsence, CutChartEntry, CutChartFound, CutChartQuery, CutChartTable, CutChartToggles, CutChartUnit, SeparationRule } from './types'

const indexes = new WeakMap<CutChartTable, Map<string, CutChartEntry[]>>()

const keyOf = (material: string, thickness: number, cls: string): string => `${material}|${Math.round(thickness * 1000)}|${cls}`

function indexOf(table: CutChartTable): Map<string, CutChartEntry[]> {
  const cached = indexes.get(table)
  if (cached) return cached
  const built = new Map<string, CutChartEntry[]>()
  for (const entry of table.entries) {
    const key = keyOf(entry.material, entry.thickness, entry.class)
    built.set(key, [...(built.get(key) ?? []), entry])
  }
  indexes.set(table, built)
  return built
}

function matches(entry: CutChartEntry, toggles: Partial<CutChartToggles> | undefined): boolean {
  if (!toggles) return true
  return (Object.keys(toggles) as Array<keyof CutChartToggles>).every((key) => toggles[key] === undefined || entry.toggles[key] === toggles[key])
}

function separationOf(table: CutChartTable, material: string, thickness: number): SeparationRule | undefined {
  const same = (rule: SeparationRule) => Math.abs(rule.thickness - thickness) <= EPSILON
  return table.separations.find((rule) => rule.material === material && same(rule)) ?? table.separations.find((rule) => rule.material === '*' && same(rule))
}

/**
 * Look up the exact cut chart entry of a material, thickness and consumable class.
 *
 * Never uses a neighbouring thickness or class. When several rows match, the generic profile (`*`) comes first,
 * then the row order. A unit that differs from the table's is a result, not a conversion.
 *
 * @param table - Imported table.
 * @param query - Material, thickness, class and optional toggles.
 * @param unit - Unit of the machine configuration.
 * @returns The entry with its separation rule, or the absence or unit mismatch.
 */
export function findCutChartEntry(table: CutChartTable, query: CutChartQuery, unit: CutChartUnit): CutChartFound | CutChartAbsence {
  if (unit !== table.unit) {
    return { code: 'CUTCHART_UNIT_MISMATCH', message: message('CUTCHART_UNIT_MISMATCH', { table: table.unit, requested: unit }) }
  }
  const candidates = indexOf(table).get(keyOf(query.material, query.thickness, query.class)) ?? []
  const usable = candidates.filter((entry) => matches(entry, query.toggles))
  const entry = usable.find((item) => item.profile.type === '*') ?? usable[0]
  if (!entry) {
    return { code: 'CUTCHART_ABSENT', message: message('CUTCHART_ABSENT', { material: query.material, thickness: query.thickness, class: query.class }) }
  }
  const separation = separationOf(table, query.material, query.thickness)
  return { entry, ...(separation ? { separation } : {}) }
}
