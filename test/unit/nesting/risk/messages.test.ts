import { expect } from 'expect'
import { riskMessages } from '../../../../src/nesting/risk/messages'
import type { RiskCategory, RiskNoticeCode } from '../../../../src/nesting/risk/types'

const CATEGORIES: RiskCategory[] = ['heat', 'thin-web', 'loose-part', 'head-strike']
const NOTICES: RiskNoticeCode[] = [
  'PROFILE_INVALID', 'ESTIMATED_LIMIT', 'RULE_NOT_ASSESSABLE', 'SEVERITY_NOT_GRADED', 'NO_ACTIONS',
  'NO_CUT_PLAN', 'INVALID_ARTIFACT', 'UNSUPPORTED_CONTRACT_VERSION',
]
const context = { partKey: 'part-1#0', otherPartKey: 'part-2#0', value: 1.25, limit: 1, unit: 'm', detail: 'web.minimum', rule: 'alma fina' }

describe('risk/messages — pt_BR single source', () => {
  it('builds a finding reason with the measured value, the limit and the unit for every category', () => {
    for (const category of CATEGORIES) {
      const text = riskMessages.finding[category](context)
      expect(text).toContain('1,25')
      expect(text).toContain('1')
      expect(text).toContain('m')
    }
  })

  it('builds a mitigation suggestion for every category', () => {
    for (const category of CATEGORIES) expect(riskMessages.mitigation[category]().length).toBeGreaterThan(10)
  })

  it('has a non-empty builder for every risk notice code', () => {
    for (const code of NOTICES) expect(riskMessages.notice[code](context).length).toBeGreaterThan(10)
  })

  it('names the missing input in the not assessable notice and states the indicative nature', () => {
    expect(riskMessages.notice.RULE_NOT_ASSESSABLE(context)).toContain('web.minimum')
    expect(riskMessages.notice.RULE_NOT_ASSESSABLE(context)).toContain('alma fina')
    expect(riskMessages.indicative()).toContain('não substitui')
  })
})
