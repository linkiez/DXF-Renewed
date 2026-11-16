import type { CutLayout, CutPlanResult } from '../cutPath/types'
import type { Estimable } from '../cost/types'
import type { ErpCorrelation, ErpDigest, ErpNestingArtifact } from '../erp/types'

/** Risk categories assessed by the module. */
export type RiskCategory = 'heat' | 'thin-web' | 'loose-part' | 'head-strike'
export type RiskSeverity = 'warning' | 'critical'

/** Caller-supplied limits of the indicative risk rules, in SI units. */
export interface CutRiskProfile {
  contractVersion: 1
  /** Finite, > 0, required for every rule. */
  geometryUnitsPerMeter: number
  /** Cutting and rapid speeds in meters per minute, pierce dwell in seconds. */
  speeds?: {
    cutting?: Estimable<number>
    rapid?: Estimable<number>
    pierceDwellSeconds?: Estimable<number>
  }
  /** Meters, seconds, meters, each > 0. */
  heat?: {
    radius?: Estimable<number>
    windowSeconds?: Estimable<number>
    maxCutLength?: Estimable<number>
  }
  /** Meters > 0. */
  web?: { minimum?: Estimable<number> }
  /** Square meters > 0. */
  loosePart?: { maxArea?: Estimable<number> }
  /** Meters > 0. */
  headStrike?: { clearance?: Estimable<number> }
  /** Number > 1; absent means findings are never graded `critical`. */
  criticalFactor?: Estimable<number>
  /** Where the limits come from, copied into the report. */
  source?: string
}

/** Everything a risk assessment is calculated from. */
export interface RiskRequest {
  artifact: ErpNestingArtifact
  layout?: CutLayout
  cutPlan: CutPlanResult
  profile: CutRiskProfile
}

/** Stable codes of the notices raised by the risk module. */
export type RiskNoticeCode =
  | 'PROFILE_INVALID'
  | 'ESTIMATED_LIMIT'
  | 'RULE_NOT_ASSESSABLE'
  | 'SEVERITY_NOT_GRADED'
  | 'NO_ACTIONS'
  | 'NO_CUT_PLAN'
  | 'INVALID_ARTIFACT'
  | 'UNSUPPORTED_CONTRACT_VERSION'

/** An explicit message about a limit, a rule or an input of the assessment. */
export interface RiskNotice {
  severity: 'info' | 'warning' | 'error'
  code: RiskNoticeCode
  message: string
  category?: RiskCategory
}

/** One assessed problem. */
export interface RiskFinding {
  /** Stable identifier used to jump to the finding. */
  id: string
  category: RiskCategory
  severity: RiskSeverity
  sheetId: string
  partKey?: string
  otherPartKey?: string
  actionIndex?: number
  /** Plan time of the moment, in seconds. */
  planSeconds?: number
  region?: { x: number; y: number; radius: number }
  measured: number
  limit: number
  unit: string
  /** Reason in Brazilian Portuguese, with the numbers. */
  message: string
  /** Suggestion in Brazilian Portuguese; never applied automatically. */
  mitigation: string
}

/** Whether a rule could be assessed and, if not, which inputs are missing. */
export interface RiskRule {
  category: RiskCategory
  assessable: boolean
  missing: string[]
}

/** The moment a part becomes free, or stays held by a tab. */
export interface FreedMoment {
  sheetId: string
  partKey: string
  actionIndex: number
  planSeconds: number | null
  held: boolean
  /** True when the area is at or below `loosePart.maxArea`. */
  loose: boolean
  area: number
}

export type RiskStatus = 'assessed' | 'partial' | 'unavailable'

/** Findings and context of one assessment, without digests. */
export interface RiskResult {
  status: RiskStatus
  /** Always true: the result is an indication, not a test cut. */
  indicative: true
  findings: RiskFinding[]
  rules: RiskRule[]
  freedMoments: FreedMoment[]
  notices: RiskNotice[]
}

/** Serializable report linked to one artifact, with audit digests. */
export interface RiskReport extends RiskResult {
  contractVersion: 1
  correlation: ErpCorrelation
  artifactDigests: { input: ErpDigest; output: ErpDigest }
  profileDigest: ErpDigest
  digest: ErpDigest
}

/** Inputs of `heatAt`: the assessment inputs, the sheet and the plan time. */
export interface HeatRequest extends RiskRequest {
  sheetId: string
  planSeconds: number
}

/** A square of the heat view. */
export interface HeatCell {
  x: number
  y: number
  size: number
  /** Windowed cut length divided by `heat.maxCutLength`; above 1 is over the limit. */
  value: number
}

/** Accumulated heat of one sheet at one plan time. */
export interface HeatView {
  available: boolean
  /** Missing profile paths when the view is unavailable. */
  missing: string[]
  cells: HeatCell[]
  max: number
}
