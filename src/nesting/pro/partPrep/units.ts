export const CANONICAL_UNIT = 'mm' as const
const SUPPORTED_UNITS = new Set<string>(['mm'])

export type UnitResolution =
  | { ok: true; unit: 'mm' }
  | { ok: false; reason: string }

/** Absent unit => mm; declared `mm` => mm; any other declared unit => rejection (FR-008). */
export function resolveUnit(unit?: string): UnitResolution {
  if (unit == null || unit === '') return { ok: true, unit: 'mm' }
  if (SUPPORTED_UNITS.has(unit)) return { ok: true, unit: 'mm' }
  return { ok: false, reason: `unsupported unit: ${unit}` }
}
