import type { DerivedResult, Freshness } from './types'

const RESULTS: readonly DerivedResult[] = ['plan', 'cost', 'validation', 'risk']

/**
 * Tells which derived results are current for the layout `key`.
 *
 * @param computedFor - Layout key each result was computed for, `null` when never.
 * @param key - Key of the layout at the cursor.
 * @returns `current` for a result computed for that layout, `outdated` otherwise.
 */
export function freshness(computedFor: Readonly<Record<DerivedResult, string | null>>, key: string): Freshness {
  const entries = RESULTS.map((result) => [result, computedFor[result] === key ? 'current' : 'outdated'] as const)
  return Object.fromEntries(entries) as Freshness
}
