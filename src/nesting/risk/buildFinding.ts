import { gradeSeverity } from './gradeSeverity'
import { riskMessages } from './messages'
import type { RiskFinding, RiskCategory } from './types'

/** What a rule knows about one finding. */
export interface FindingSpec {
  category: RiskCategory
  sheetId: string
  partKey?: string
  otherPartKey?: string
  /** Label of what the other side is when it is not a part, such as the sheet edge. */
  otherLabel?: string
  actionIndex?: number
  planSeconds?: number | null
  region?: RiskFinding['region']
  measured: number
  limit: number
  unit: string
  /** Measured over limit, or limit over measured for measures where smaller is worse. */
  ratio: number
  criticalFactor: number | undefined
}

const idOf = (spec: FindingSpec): string =>
  [spec.category, spec.sheetId, spec.partKey ?? '', spec.otherPartKey ?? spec.otherLabel ?? '', spec.actionIndex ?? '',
    spec.region ? `${Math.round(spec.region.x)},${Math.round(spec.region.y)}` : ''].join(':')

/**
 * Builds a finding with its stable id, severity and Brazilian Portuguese reason and mitigation.
 *
 * @param spec - What the rule measured.
 * @returns The finding.
 */
export function buildFinding(spec: FindingSpec): RiskFinding {
  const context = {
    partKey: spec.partKey,
    otherPartKey: spec.otherPartKey ?? spec.otherLabel,
    value: spec.measured,
    limit: spec.limit,
    unit: spec.unit,
  }
  return {
    id: idOf(spec),
    category: spec.category,
    severity: gradeSeverity(spec.ratio, spec.criticalFactor),
    sheetId: spec.sheetId,
    ...(spec.partKey !== undefined ? { partKey: spec.partKey } : {}),
    ...(spec.otherPartKey !== undefined ? { otherPartKey: spec.otherPartKey } : {}),
    ...(spec.actionIndex !== undefined ? { actionIndex: spec.actionIndex } : {}),
    ...(spec.planSeconds !== undefined && spec.planSeconds !== null ? { planSeconds: spec.planSeconds } : {}),
    ...(spec.region ? { region: spec.region } : {}),
    measured: spec.measured,
    limit: spec.limit,
    unit: spec.unit,
    message: riskMessages.finding[spec.category](context),
    mitigation: riskMessages.mitigation[spec.category](),
  }
}
