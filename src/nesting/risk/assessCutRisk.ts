import { assessHeadStrike } from './assessHeadStrike'
import { assessHeat } from './assessHeat'
import { assessLoosePart } from './assessLoosePart'
import { assessThinWeb } from './assessThinWeb'
import { freedMoments } from './freedMoments'
import { riskMessages } from './messages'
import { validateRiskProfile } from './validateRiskProfile'
import { buildRiskContext } from './riskContext'
import type { RiskContext } from './riskContext'
import type { RiskCategory, RiskFinding, RiskNotice, RiskRequest, RiskResult, RiskRule } from './types'

const CATEGORY_ORDER: RiskCategory[] = ['heat', 'thin-web', 'loose-part', 'head-strike']

const unavailable = (notices: RiskNotice[]): RiskResult => ({
  status: 'unavailable',
  indicative: true,
  findings: [],
  rules: [],
  freedMoments: [],
  notices,
})

const keyOf = (finding: RiskFinding): (string | number)[] => [
  finding.severity === 'critical' ? 0 : 1,
  CATEGORY_ORDER.indexOf(finding.category),
  finding.sheetId,
  finding.actionIndex ?? -1,
  finding.partKey ?? '',
  finding.id,
]

const order = (a: RiskFinding, b: RiskFinding): number => {
  const left = keyOf(a)
  const right = keyOf(b)
  for (let index = 0; index < left.length; index += 1) {
    const result = typeof left[index] === 'number'
      ? (left[index] as number) - (right[index] as number)
      : String(left[index]).localeCompare(String(right[index]))
    if (result !== 0) return result
  }
  return 0
}

const notAssessable = (rules: readonly RiskRule[]): RiskNotice[] =>
  rules.filter((rule) => !rule.assessable).map((rule) => ({
    severity: 'warning' as const,
    code: 'RULE_NOT_ASSESSABLE' as const,
    category: rule.category,
    message: riskMessages.notice.RULE_NOT_ASSESSABLE({ rule: riskMessages.category[rule.category], detail: rule.missing.join(', ') }),
  }))

const findingsOf = (context: RiskContext): RiskFinding[] =>
  [...assessHeat(context), ...assessThinWeb(context), ...assessLoosePart(context), ...assessHeadStrike(context)].sort(order)

/**
 * Assesses a cut plan for the four indicative risks: heat accumulation, thin web, loose part and
 * head strike.
 *
 * The profile is validated first; an invalid profile or a plan without actions gives an
 * unavailable result with its reasons. A rule whose limit is missing is reported as not assessable
 * and the result is partial. The result is deterministic and the request is never mutated.
 *
 * @param request - Artifact, optional cut layout, cut plan and risk profile.
 * @returns Findings, rules, freed moments and notices; always indicative.
 * @example
 * ```typescript
 * const result = assessCutRisk({ artifact, layout, cutPlan, profile })
 * ```
 */
export function assessCutRisk(request: RiskRequest): RiskResult {
  const profileNotices = validateRiskProfile(request.profile)
  if (profileNotices.some((item) => item.severity === 'error')) return unavailable(profileNotices)
  if (!request.artifact.layout) {
    return unavailable([{ severity: 'error', code: 'INVALID_ARTIFACT', message: riskMessages.notice.INVALID_ARTIFACT({ detail: 'layout' }) }])
  }
  const context = buildRiskContext(request)
  if (context.actions.length === 0) {
    return unavailable([{ severity: 'error', code: 'NO_ACTIONS', message: riskMessages.notice.NO_ACTIONS({}) }])
  }
  const notices = [
    ...profileNotices,
    ...notAssessable(context.rules),
    ...(context.limits.critical === undefined ? [{ severity: 'info' as const, code: 'SEVERITY_NOT_GRADED' as const, message: riskMessages.notice.SEVERITY_NOT_GRADED({}) }] : []),
  ]
  return {
    status: context.rules.every((rule) => rule.assessable) ? 'assessed' : 'partial',
    indicative: true,
    findings: findingsOf(context),
    rules: context.rules,
    freedMoments: freedMoments(context),
    notices,
  }
}
