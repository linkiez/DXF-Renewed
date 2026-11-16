import type { CutActionKind } from '../cutPath/types'

/** Time and cost category of an action: cutting, rapid travel or a pierce. */
export type ActionCategory = 'cut' | 'travel' | 'pierce'

const CATEGORY: Partial<Record<CutActionKind, ActionCategory>> = {
  cut: 'cut',
  'lead-in': 'cut',
  'lead-out': 'cut',
  overcut: 'cut',
  tab: 'cut',
  'common-line': 'cut',
  rapid: 'travel',
  pierce: 'pierce',
}

/**
 * Classifies an action kind for time and cost purposes.
 *
 * @param kind - Kind of a cut action.
 * @returns `cut`, `travel` or `pierce`; `undefined` for kinds that take no time, such as `end`.
 */
export function actionCategory(kind: CutActionKind): ActionCategory | undefined {
  return CATEGORY[kind]
}
