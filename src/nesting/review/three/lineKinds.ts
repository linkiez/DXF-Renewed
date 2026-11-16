import type { CutActionKind } from '../../cutPath/types'

/** Action kinds drawn as line segments. */
export type LineKind = Exclude<CutActionKind, 'pierce' | 'end'>

/** Line kinds in drawing order. */
export const LINE_KINDS: readonly LineKind[] = [
  'rapid', 'lead-in', 'cut', 'lead-out', 'overcut', 'tab', 'common-line',
]
