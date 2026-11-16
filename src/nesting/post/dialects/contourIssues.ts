import type { ValidationIssue } from '../types'
import { message } from '../machine/messages'
import type { ContourSplit } from './contourBlocks'

/**
 * Issues of a contour split common to the contour-oriented dialects.
 *
 * @param split - Result of `splitContours`.
 * @returns `ACTION_UNSUPPORTED` for each unsupported action and `EMPTY_PROGRAM` when there is no contour.
 */
export function contourIssues(split: ContourSplit): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = split.unsupported.map((item) => ({
    severity: 'error',
    code: 'ACTION_UNSUPPORTED',
    message: message('ACTION_UNSUPPORTED', { kind: item.kind }),
    actionIndex: item.actionIndex,
    ...(item.contourId ? { contourId: item.contourId } : {}),
  }))
  if (split.contours.length === 0) issues.push({ severity: 'error', code: 'EMPTY_PROGRAM', message: message('EMPTY_PROGRAM') })
  return issues
}
