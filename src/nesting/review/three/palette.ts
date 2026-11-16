import type { LineKind } from './lineKinds'

/** Colors, dash patterns and opacity of the accelerated view. */
export const PALETTE = {
  colors: {
    rapid: 0x6b7280, 'lead-in': 0x15803d, cut: 0x1d4ed8, 'lead-out': 0x15803d,
    overcut: 0xea580c, tab: 0x7c3aed, 'common-line': 0x0f766e,
  } satisfies Record<LineKind, number>,
  dashes: {
    rapid: [4, 3], 'lead-in': [1, 2], 'lead-out': [6, 2], overcut: [2, 1],
  } as Partial<Record<LineKind, [number, number]>>,
  ghostOpacity: 0.3,
  sheet: 0x374151,
  parts: 0x1d4ed8,
  flagged: 0xb91c1c,
  pierce: 0xdc2626,
  tab: 0x7c3aed,
  highlight: 0xf59e0b,
}
