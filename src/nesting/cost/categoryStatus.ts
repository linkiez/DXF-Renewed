import type { CategoryNeeds } from './componentNeeds'
import type { ComponentStatus } from './types'

/** Status of one category and the stable reasons behind it. */
export interface CategoryStatusInfo {
  status: ComponentStatus
  reasons: string[]
}

/**
 * Derives the status of a category from its inputs only (never from amounts).
 *
 * @param category - Inputs of the category and whether it needs a cut plan.
 * @param planPresent - Whether the request carried a cut plan.
 * @returns `incomplete` when an input or a needed plan is missing, `estimated` when a used input is
 *   marked as an estimate, else `complete`; the reasons list each missing or estimated input.
 */
export function categoryStatus(category: CategoryNeeds, planPresent: boolean): CategoryStatusInfo {
  const reasons: string[] = []
  if (category.needsPlan && !planPresent) reasons.push('NO_CUT_PLAN')
  for (const need of category.needs) {
    if (need.value === undefined) reasons.push(`${need.code}:${need.subject ?? need.path}`)
  }
  if (reasons.length > 0) return { status: 'incomplete', reasons }
  const estimated = category.needs.filter((need) => need.value?.estimated === true).map((need) => `ESTIMATED:${need.path}`)
  return { status: estimated.length > 0 ? 'estimated' : 'complete', reasons: estimated }
}
