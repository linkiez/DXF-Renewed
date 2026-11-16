import type { RiskFinding } from '../risk/types'
import type { ReviewPosition, ReviewSelection } from './types'

/**
 * Tells where the review must go to show a finding: the start of its action and the part or action
 * it concerns.
 *
 * @param finding - Finding to show.
 * @returns The position to seek and the selection to make.
 */
export function seekTargetOf(finding: RiskFinding): { position: ReviewPosition; selection: ReviewSelection } {
  const actionIndex = finding.actionIndex ?? 0
  const selection: ReviewSelection = finding.partKey !== undefined
    ? { kind: 'part', sheetId: finding.sheetId, partKey: finding.partKey }
    : { kind: 'action', sheetId: finding.sheetId, actionIndex }
  return { position: { sheetId: finding.sheetId, actionIndex, progress: 0 }, selection }
}

