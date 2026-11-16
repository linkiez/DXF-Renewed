import type { CategoryNeeds, Need } from './componentNeeds'
import { costMessages } from './messages'
import type { CostCategory, CostNotice } from './types'

const missingMessage = (need: Need): string => {
  switch (need.code) {
    case 'MISSING_RATE': return costMessages.missingRate(need.path)
    case 'MISSING_SPEED': return costMessages.missingSpeed(need.path)
    case 'MISSING_DWELL': return costMessages.missingDwell()
    case 'MISSING_CONSUMABLE_LIFE': return costMessages.missingConsumableLife(need.subject ?? need.path)
    case 'MISSING_SHEET_PRICE': return costMessages.missingSheetPrice(need.subject ?? need.path, need.path.startsWith('material.remnant.') ? 'remnant' : 'sheet')
  }
}

/**
 * Builds one notice per missing or estimated input, however many categories depend on it.
 *
 * @param needs - Inputs of each category.
 * @returns Warnings for missing inputs and info notices for inputs marked as estimates.
 */
export function statusNotices(needs: Record<CostCategory, CategoryNeeds>): CostNotice[] {
  const seen = new Set<string>()
  const notices: CostNotice[] = []
  for (const category of Object.keys(needs) as CostCategory[]) {
    for (const need of needs[category].needs) {
      if (seen.has(need.path)) continue
      if (need.value === undefined) {
        seen.add(need.path)
        notices.push({ severity: 'warning', code: need.code, message: missingMessage(need), component: category })
      } else if (need.value.estimated === true) {
        seen.add(need.path)
        notices.push({ severity: 'info', code: 'ESTIMATED_INPUT', message: costMessages.estimatedInput(need.path), component: category })
      }
    }
  }
  return notices
}
