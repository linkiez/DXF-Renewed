import type { CutLayout, CutPlanResult, CutProcessProfile } from '../cutPath/types'
import type { CostBreakdown, CostModel, ProductionReport } from '../cost/types'
import type { ErpDigest, ErpNestingArtifact } from '../erp/types'
import type { RiskCategory, RiskResult, CutRiskProfile } from '../risk/types'
import type { CompoundPlacement, Placement, Point2D, StockItem } from '../types'
import type { NeighbourIndex } from '../linking/neighbourIndex'

/** Kind of a part edit. */
export type EditKind = 'move' | 'rotate' | 'mirror'

/** Rotation, grain and mirroring rules of one part, supplied by the caller. */
export interface PartConstraint {
  /** Allowed absolute rotations in degrees; overrides the global list. */
  allowedRotations?: number[]
  /** The part must keep its orientation aligned with `grainAngle`; requires `grainAngle`. */
  grainLocked?: boolean
  /** Grain direction in degrees. */
  grainAngle?: number
  /** The part may be mirrored. */
  mirrorable?: boolean
}

/** An area of a sheet that no part may enter (earlier jobs, flaws). */
export interface ExclusionZone {
  id: string
  sheetId: string
  outline: Point2D[]
}

/** Constraints that the artifact does not carry. */
export interface EditConstraints {
  /** Allowed absolute rotations in degrees for every part without its own list. */
  allowedRotations?: number[]
  /** Rules per shape id. */
  parts?: Record<string, PartConstraint>
  exclusions?: ExclusionZone[]
}

/** Limits of an edit session. */
export interface EditLimits {
  /** Default 100, must be an integer >= 100. */
  maxLogLength?: number
}

/** Everything an edit session starts from. */
export interface EditInput {
  artifact: ErpNestingArtifact
  layout?: CutLayout
  cutPlan?: CutPlanResult
  constraints?: EditConstraints
  limits?: EditLimits
}

/** Placement transform of a part at one moment. */
export interface PlacementTransform {
  x: number
  y: number
  rotation: number
  mirrored: boolean
}

/** A candidate edit, before it is judged. */
export type CandidateEdit =
  | { partKey: string; kind: 'move'; delta: { dx: number; dy: number } }
  | { partKey: string; kind: 'rotate'; delta: { degrees: number } }
  | { partKey: string; kind: 'mirror' }

/** A confirmed edit in the log. */
export type PartEdit = CandidateEdit & { before: PlacementTransform; after: PlacementTransform }

/** Codes of the violations a candidate position can have, in their fixed report order. */
export type ViolationCode =
  | 'OVERLAP'
  | 'OUTSIDE_USABLE_AREA'
  | 'FORBIDDEN_ZONE'
  | 'SPACING_TOO_SMALL'
  | 'ROTATION_NOT_ALLOWED'
  | 'GRAIN_LOCKED'
  | 'MIRROR_NOT_ALLOWED'
  | 'CONSTRAINTS_UNKNOWN'
  | 'OUTLINE_UNAVAILABLE'
  | 'GROUP_INVALID'

/** One reason a candidate position is refused. */
export interface Violation {
  code: ViolationCode
  message: string
  partKey?: string
  otherPartKey?: string
  zoneId?: string
}

/** Result of judging a candidate edit. */
export interface PlacementVerdict {
  /** True only when `violations` is empty. */
  valid: boolean
  /** In fixed order: overlap, area, forbidden zone, spacing, orientation. */
  violations: Violation[]
  /** True when a verdict depends on an outline that is only a bounding box or on an unknown group. */
  approximate: boolean
  /** Keys of the enclosed parts that move together with the part. */
  group: string[]
}

/** Derived results that an edit can make outdated. */
export type DerivedResult = 'plan' | 'cost' | 'validation' | 'risk'
export type FreshnessState = 'current' | 'outdated'
export type Freshness = Record<DerivedResult, FreshnessState>

/** Stable codes of the notices raised by the edit module. */
export type EditNoticeCode =
  | 'APPROXIMATE_OUTLINE'
  | 'RECOMPUTE_DISCARDED'
  | 'EDIT_LOG_FULL'
  | 'PLAN_RECOMPUTE_FAILED'
  | 'COST_RECOMPUTE_FAILED'
  | 'RISK_UNAVAILABLE'
  | 'COMMON_LINE_BROKEN'
  | 'NO_LAYOUT'
  | 'INVALID_ARTIFACT'
  | 'UNSUPPORTED_CONTRACT_VERSION'
  | 'INVALID_INPUT'
  | 'FIGURE_OUTDATED'
  | 'PLACEMENT_SHEET_UNRESOLVED'

/** An explicit message about a gap or a consequence of an edit. */
export interface EditNotice {
  severity: 'info' | 'warning' | 'error'
  code: EditNoticeCode
  message: string
  partKey?: string
  sheetId?: string
}

/** One placed part in the working layout of a session. */
export interface WorkingPart {
  key: string
  shapeId: string
  instanceIndex: number
  sheetId: string
  placement: Placement | CompoundPlacement
  /** `[outer, ...holes]`. */
  outlines: Point2D[][]
  approximate: boolean
  mirrored: boolean
  /** Contour id of each outline, aligned with `outlines`; empty without a cut layout. */
  contourIds: readonly string[]
  /** Where the placement lives in the artifact layout. */
  source: { kind: 'placement' | 'compound'; index: number }
  /** True when the hole outlines of the part are known (compound or a cut layout is present). */
  holesKnown: boolean
}

/** The layout at the cursor of a session, with a neighbour index per sheet. */
export interface WorkingLayout {
  parts: ReadonlyMap<string, WorkingPart>
  /** Part keys in artifact order. */
  order: readonly string[]
  sheets: ReadonlyMap<string, StockItem>
  index: ReadonlyMap<string, NeighbourIndex>
}

/** Immutable state of an edit session. */
export interface EditState {
  readonly input: EditInput
  readonly maxLogLength: number
  readonly edits: readonly PartEdit[]
  /** How many edits of the log are applied, `0..edits.length`. */
  readonly cursor: number
  /** An integer that increases on every commit, undo and redo. */
  readonly revision: number
  readonly freshness: Freshness
  /** Layout key for which each derived result was computed, `null` when never. */
  readonly computedFor: Readonly<Record<DerivedResult, string | null>>
  /** The layout at the cursor. */
  readonly working: WorkingLayout
  /** The layout before any edit, used to replay the log. */
  readonly baseWorking: WorkingLayout
}

/** Result of `createEditState`. */
export interface CreateEditStateResult {
  state: EditState | null
  notices: EditNotice[]
}

/** Result of `commitEdit`. */
export interface CommitResult {
  state: EditState
  verdict: PlacementVerdict
  notices: EditNotice[]
}

/** The edit part of an edited result. */
export interface EditRecord {
  originalOutputDigest: ErpDigest
  originalInputDigest: ErpDigest
  /** Applied edits only (`edits[0..cursor)`), in order. */
  log: PartEdit[]
  /** SHA-256 of the canonical JSON of the whole result without this field. */
  digest: ErpDigest
  notices: EditNotice[]
}

/** The edited layout as a new artifact that refers to the original. */
export interface EditedArtifact {
  artifact: ErpNestingArtifact
  edit: EditRecord
}

/** What a recomputation needs besides the state. */
export interface RecomputeRequest {
  state: EditState
  processProfile: CutProcessProfile
  costModel?: CostModel
  riskProfile?: CutRiskProfile
}

interface StepBase {
  /** Revision of the state the step started from. */
  revision: number
  status: 'current' | 'unavailable' | 'discarded'
  notices: EditNotice[]
}

/** One step of a recomputation. */
export type RecomputeStep =
  | (StepBase & { step: 'plan'; result?: CutPlanResult })
  | (StepBase & { step: 'cost'; result?: { breakdown: CostBreakdown | null; production: ProductionReport | null } })
  | (StepBase & { step: 'risk'; result?: RiskResult })

/** Results of one side of a comparison. */
export interface ComparisonInputs {
  production?: ProductionReport | null
  breakdown?: CostBreakdown | null
  risk?: RiskResult | null
}

/** Inputs of `compareLayouts`: the session and the results computed for each side. */
export interface CompareRequest {
  state: EditState
  original: ComparisonInputs
  edited: ComparisonInputs
}

/** Before, after and the difference of one figure; `null` when a side is outdated or unavailable. */
export interface FigureDelta {
  before: number | null
  after: number | null
  delta: number | null
}

/** What changed between the original and the edited layout. */
export interface ComparisonSummary {
  /** Number of parts with at least one violation. */
  invalidParts: FigureDelta
  cutSeconds: FigureDelta
  /** Total cost in minor units. */
  cost: FigureDelta
  risk: Record<RiskCategory, FigureDelta>
  notices: EditNotice[]
}
