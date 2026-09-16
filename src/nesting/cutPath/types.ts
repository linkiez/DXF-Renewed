import type {
  NestableShape,
  Placement,
  Point2D,
  StockItem,
} from '../types'

/** Stable contour-sequencing strategy selected by a cut process profile. */
export type CutSequenceStrategy =
  | 'input'
  | 'nearest-neighbour'
  | 'stable-2-opt'

/** Options controlling deterministic contour sequencing. */
export interface SequenceOptions {
  /** Strategy used to order contours. */
  strategy: CutSequenceStrategy
  /** Optional upper bound for candidate-order improvement steps. */
  budget?: number
  /** Optional multiplier used to derive a deterministic improvement budget. */
  budgetFactor?: number
}

/** Lead geometry and placement rules. */
export interface LeadSpec {
  /** Lead construction used by the planner. */
  type: 'none' | 'straight' | 'arc'
  /** Lead length in the layout's unitless geometry convention. */
  length: number
  /** Lead direction in degrees. */
  angle: number
  /** Whether the lead is placed inside or outside the contour. */
  placement: 'inside' | 'outside' | 'automatic'
}

/** Pierce-point and small-hole process rules. */
export interface PierceSpec {
  /** Minimum clearance required around a pierce point. */
  clearance: number
  /** Diameter below which the small-hole rule applies. */
  smallHoleThreshold?: number
  /** Optional lead override for small holes. */
  smallHoleLead?: LeadSpec
}

/** Tab retention rules. */
export interface TabSpec {
  /** Whether tabs may be generated. */
  enabled: boolean
  /** Tab width in the layout's unitless geometry convention. */
  width?: number
  /** Requested number of tabs per contour. */
  count?: number
  /** Optional minimum distance between tabs. */
  minimumSpacing?: number
}

/** Overcut closure-extension rules. */
export interface OvercutSpec {
  /** Whether overcuts may be generated. */
  enabled: boolean
  /** Overcut length in the layout's unitless geometry convention. */
  length?: number
}

/** Minimum geometric clearances used during entry and route validation. */
export interface ClearanceRules {
  /** Minimum distance from another contour. */
  contour: number
  /** Minimum distance from a tab. */
  tab: number
  /** Minimum distance through kept material during rapid travel. */
  keptMaterial: number
  /** Optional minimum distance from the sheet edge. */
  sheetEdge?: number
}

/** Common-line cutting opt-in and tolerance rules. */
export interface CommonLineOptions {
  /** Whether common-line candidates may be considered. */
  enabled: boolean
  /** Maximum geometric mismatch accepted between shared edges. */
  tolerance: number
  /** Optional candidates requiring geometric verification before use. */
  candidates?: readonly CommonLineCandidate[]
}

/** Pair of contours proposed for common-line cutting. */
export interface CommonLineCandidate {
  firstContourId: string
  secondContourId: string
}

/** Process rules used to create and validate a machine-independent cut plan. */
export interface CutProcessProfile {
  /** Deterministic contour-sequencing rules. */
  sequence: SequenceOptions
  /** Lead-in and lead-out rules. */
  lead: LeadSpec
  /** Pierce-point rules. */
  pierce: PierceSpec
  /** Tab-generation rules. */
  tabs: TabSpec
  /** Optional overcut rules. */
  overcut: OvercutSpec
  /** Minimum clearances used by geometry validation. */
  clearance: ClearanceRules
  /** Common-line cutting rules. */
  commonLine: CommonLineOptions
}

/** A contour associated with a placed nesting shape. */
export interface CutContour {
  /** Stable contour identifier, unique within a layout. */
  id: string
  /** Stable part identifier used for grouping and traceability. */
  partId: string
  /** Identifier of the stock sheet containing the contour. */
  sheetId: string
  /** Existing nesting geometry for the contour. */
  shape: NestableShape
  /** Completed placement of the contour on its sheet. */
  placement: Placement
  /** Associated outer contour identifier for an inner contour. */
  parentContourId?: string
  /** Whether this contour is the associated outer contour. */
  isOuter: boolean
}

/** Immutable planning input for one or more nested sheets. */
export interface CutLayout {
  /** Stock sheets referenced by the contours. */
  sheets: readonly StockItem[]
  /** Ordered contours used for the baseline travel measurement. */
  contours: readonly CutContour[]
  /** Optional deterministic origin for the first rapid move. */
  startPoint?: Point2D
}

/** Machine-independent action marker emitted by a cut plan. */
export type CutActionKind =
  | 'rapid'
  | 'pierce'
  | 'lead-in'
  | 'cut'
  | 'lead-out'
  | 'overcut'
  | 'tab'
  | 'common-line'
  | 'end'

/** Scalar metadata attached to a cut action. */
export type CutActionMetadata = Readonly<
  Record<string, string | number | boolean>
>

/** One ordered movement or process operation in a cut plan. */
export interface CutAction {
  /** Action category understood by machine-independent post-processors. */
  kind: CutActionKind
  /** Ordered coordinates used by the action. */
  points: readonly Point2D[]
  /** Contour associated with the action, when applicable. */
  contourId?: string
  /** Part associated with the action, when applicable. */
  partId?: string
  /** Optional process metadata without vendor-specific commands. */
  metadata?: CutActionMetadata
}

/** Aggregate measurements for a generated cut plan. */
export interface CutPlanStats {
  /** Total length of cutting actions. */
  cutLength: number
  /** Total length of rapid movements. */
  rapidLength: number
  /** Number of pierce actions. */
  pierceCount: number
  /** Number of tab actions. */
  tabCount: number
}

/** Ordered machine-independent cut sequence for one sheet. */
export interface CutPlan {
  /** Stable identity of the sheet served by this plan. */
  sheetId: string
  /** Ordered actions selected by the process profile. */
  actions: readonly CutAction[]
  /** Aggregate action measurements. */
  stats: CutPlanStats
  /** Rapid distance for the input contour order. */
  baselineRapidLength: number
  /** Rapid distance for the generated contour order. */
  optimizedRapidLength: number
}

/** Stable categories for expected cut-path validation failures. */
export type CutPathProblemCode =
  | 'OUT_OF_BOUNDS'
  | 'RAPID_OVER_PART'
  | 'LEAD_CROSSES_GEOMETRY'
  | 'TAB_TOO_WIDE'
  | 'COMMON_LINE_REJECTED'
  | 'ENTRY_INVALID'

/** Severity assigned to a cut-path validation problem. */
export type CutPathProblemSeverity = 'error' | 'warning'

/** Actionable validation finding associated with a cut plan. */
export interface CutPathProblem {
  /** Stable problem category for programmatic handling. */
  code: CutPathProblemCode
  /** Whether the finding prevents plan release. */
  severity: CutPathProblemSeverity
  /** Correction-oriented explanation of the finding. */
  message: string
  /** Related sheet, when available. */
  sheetId?: string
  /** Related part, when available. */
  partId?: string
  /** Related contour, when available. */
  contourId?: string
  /** Index of the rejected action, when available. */
  actionIndex?: number
}

/** Travel metrics comparing the input and optimized contour orders. */
export interface CutPlanMetrics {
  /** Rapid distance for the input contour order. */
  baselineRapidLength: number
  /** Rapid distance for the generated contour order. */
  optimizedRapidLength: number
  /** Relative reduction, where 0.2 represents 20 percent. */
  improvementRatio: number
}

/** Structured result returned by a cut-path planner. */
export interface CutPlanResult {
  /** Whether the plan contains no error-severity problems. */
  valid: boolean
  /** Generated plan when validation succeeds. */
  plan?: CutPlan
  /** Complete generated plans, one for each referenced sheet. */
  plans?: readonly CutPlan[]
  /** All expected geometric and process findings. */
  problems: readonly CutPathProblem[]
  /** Baseline and optimized travel measurements. */
  metrics: CutPlanMetrics
}
