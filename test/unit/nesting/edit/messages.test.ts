import { expect } from 'expect'
import { editMessages } from '../../../../src/nesting/edit/messages'
import type { EditNoticeCode, ViolationCode } from '../../../../src/nesting/edit/types'

const VIOLATIONS: ViolationCode[] = [
  'OVERLAP', 'OUTSIDE_USABLE_AREA', 'FORBIDDEN_ZONE', 'SPACING_TOO_SMALL', 'ROTATION_NOT_ALLOWED',
  'GRAIN_LOCKED', 'MIRROR_NOT_ALLOWED', 'CONSTRAINTS_UNKNOWN', 'OUTLINE_UNAVAILABLE', 'GROUP_INVALID',
]
const NOTICES: EditNoticeCode[] = [
  'APPROXIMATE_OUTLINE', 'RECOMPUTE_DISCARDED', 'EDIT_LOG_FULL', 'PLAN_RECOMPUTE_FAILED',
  'COST_RECOMPUTE_FAILED', 'RISK_UNAVAILABLE', 'COMMON_LINE_BROKEN', 'NO_LAYOUT', 'INVALID_ARTIFACT',
  'UNSUPPORTED_CONTRACT_VERSION', 'INVALID_INPUT', 'PLACEMENT_SHEET_UNRESOLVED', 'FIGURE_OUTDATED',
]
const context = { partKey: 'part-1#0', otherPartKey: 'part-2#0', zoneId: 'flaw-1', value: 3.5, limit: 5, detail: 'motivo' }

describe('edit/messages — pt_BR single source', () => {
  it('has a non-empty builder for every violation code', () => {
    for (const code of VIOLATIONS) expect(editMessages.violation[code](context).length).toBeGreaterThan(10)
  })

  it('has a non-empty builder for every edit notice code', () => {
    for (const code of NOTICES) expect(editMessages.notice[code](context).length).toBeGreaterThan(10)
  })

  it('interpolates the identifiers and values it is given', () => {
    expect(editMessages.violation.OVERLAP(context)).toContain('part-2#0')
    expect(editMessages.violation.FORBIDDEN_ZONE(context)).toContain('flaw-1')
    expect(editMessages.violation.SPACING_TOO_SMALL(context)).toContain('3,5')
    expect(editMessages.notice.EDIT_LOG_FULL(context)).toContain('5')
  })

  it('writes Brazilian Portuguese', () => {
    expect(editMessages.violation.OUTSIDE_USABLE_AREA(context)).toBe(
      'A peça part-1#0 sai da área útil da chapa ou invade a margem de borda.',
    )
  })
})
