import type { Observable } from 'rxjs'
import type {
  CompoundPlacement,
  Placement,
  Point2D,
  StockItem,
} from '../types'
import type {
  CutActionKind,
  CutActionMetadata,
  CutCurve,
  CutLayout,
  CutProcessProfile,
  CutPlanResult,
} from '../cutPath/types'
import type { CandidateEdit, ComparisonSummary, EditInput, EditNotice, Freshness, PlacementVerdict } from '../edit/types'
import type { ErpDigest, ErpNestingArtifact } from '../erp/types'
import type { CutRiskProfile, HeatView, RiskCategory, RiskRequest, RiskResult, RiskSeverity, RiskStatus } from '../risk/types'
import type { CostModel } from '../cost/types'

/** Inputs of a review: the calculation artifact plus optional cut layout and plan. */
export interface ReviewInput {
  /** Calculation artifact produced by the stateless ERP contract. */
  artifact: ErpNestingArtifact
  /** Cut layout used to link contours and actions to placements and shapes. */
  layout?: CutLayout
  /** Cut plan result whose actions and problems are reviewed. */
  cutPlan?: CutPlanResult
}

/** Severity of a review notice. */
export type ReviewNoticeSeverity = 'info' | 'warning' | 'error'

/** Where a review notice originates. */
export type ReviewNoticeOrigin = 'artifact' | 'planning' | 'review'

/** Stable codes of notices raised by the review itself. */
export type ReviewNoticeCode =
  | 'UNSUPPORTED_CONTRACT_VERSION'
  | 'INVALID_ARTIFACT'
  | 'NO_LAYOUT'
  | 'NO_CUT_PLAN'
  | 'EMPTY_SHEET'
  | 'UNLINKED_ACTION'
  | 'UNKNOWN_PART'
  | 'PLAN_SHEET_MISSING'
  | 'DEGENERATE_ACTION'
  | 'PLACEMENT_SHEET_UNRESOLVED'
  | 'PLACEMENT_GEOMETRY_APPROXIMATE'
  | 'GRAPHICS_UNAVAILABLE'
  | 'GRAPHICS_LOST'

/** Explicit message reporting a warning, rejection, problem or unavailable capability. */
export interface ReviewNotice {
  severity: ReviewNoticeSeverity
  /** Review code, or the code carried by the artifact or the cut plan. */
  code: string
  message: string
  origin: ReviewNoticeOrigin
  sheetId?: string
  partKey?: string
  actionIndex?: number
}

/** Whether a placed part carries a recorded problem. */
export type ReviewPartStatus = 'placed' | 'flagged'

/** One placed part of a sheet. */
export interface ReviewPart {
  /** `shapeId#instanceIndex`, unique within the scene. */
  key: string
  shapeId: string
  instanceIndex: number
  placement: Placement | CompoundPlacement
  /** Polygons drawn for the part. */
  outlines: readonly (readonly Point2D[])[]
  source: {
    layer?: string
    originalHandle?: string
    area?: number
    perimeter?: number
  }
  status: ReviewPartStatus
  notices: readonly ReviewNotice[]
}

/** One ordered planned action with its cumulative length. */
export interface ReviewAction {
  index: number
  kind: CutActionKind
  points: readonly Point2D[]
  curve?: CutCurve
  startLength: number
  length: number
  /** Start of the action on the playback axis, where every action has a positive span. */
  playStart: number
  /** Playback span: the action length, or a dwell for actions without length. */
  playSpan: number
  /** Undefined when the action could not be linked to a part. */
  partKey?: string
  contourId?: string
  metadata?: CutActionMetadata
  notices: readonly ReviewNotice[]
}

/** Ordered, flattened actions of one sheet. */
export interface ReviewTimeline {
  actions: readonly ReviewAction[]
  totalLength: number
  /** Total span of the playback axis. */
  playTotal: number
  pierceIndices: readonly number[]
}

/** One sheet of the scene with its parts and optional timeline. */
export interface ReviewSheet {
  id: string
  stock: StockItem
  parts: readonly ReviewPart[]
  timeline?: ReviewTimeline
}

/** Identity of the reviewed artifact. */
export interface ReviewIdentity {
  status: ErpNestingArtifact['status']
  contractVersion: number
  correlation: ErpNestingArtifact['correlation']
  inputDigest: ErpDigest
  outputDigest: ErpDigest
}

/** Totals shown in the written summary. */
export interface ReviewSummary {
  sheetCount: number
  partCount: number
  unplacedCount: number
  /** Utilization exactly as supplied by the artifact. */
  yield: number
  totalCutLength: number
  totalRapidLength: number
  pierceCount: number
}

/** Immutable representation of one artifact for review. */
export interface ReviewScene {
  status: 'ready' | 'partial' | 'unavailable'
  identity: ReviewIdentity | null
  sheets: readonly ReviewSheet[]
  notices: readonly ReviewNotice[]
  summary: ReviewSummary
  capabilities: { playback: boolean; actionInspection: boolean }
}

/** Point in the ordered action sequence of one sheet. */
export interface ReviewPosition {
  sheetId: string
  /** Integer in `[0, actions.length]`; `actions.length` means finished. */
  actionIndex: number
  /** In `[0, 1)` within the action; `0` at an exact action start. */
  progress: number
}

/** Displayed tool state derived from a position. */
export interface ReviewToolState {
  head: Point2D | null
  /** Number of fully completed actions. */
  completed: number
  current: ReviewAction | null
}

/** Temporary focus on a part or an action. */
export type ReviewSelection =
  | { kind: 'part'; sheetId: string; partKey: string }
  | { kind: 'action'; sheetId: string; actionIndex: number }

/** Inspector content for a selection. */
export interface ReviewInspection {
  title: string
  rows: readonly { label: string; value: string }[]
  notices: readonly ReviewNotice[]
}

/** View window in sheet coordinates. */
export interface ReviewViewport {
  center: Point2D
  zoom: number
}

/** Everything a renderer needs to draw one frame. */
export interface ReviewFrame {
  scene: ReviewScene
  sheetId: string
  position: ReviewPosition
  selection: ReviewSelection | null
  viewport: ReviewViewport
}

/** One reason a candidate position is refused, drawn next to the ghost. */
export interface OverlayMark {
  code: string
  label: string
}

/** A finding drawn on the sheet and on the timeline. */
export interface OverlayMarker {
  id: string
  category: RiskCategory
  severity: RiskSeverity
  x: number
  y: number
  label: string
}

/** What a renderer draws above the sheet: the candidate position, the heat view, free parts and markers. */
export interface ReviewOverlay {
  ghost?: {
    outline: readonly Point2D[]
    valid: boolean
    /** Where the labels of the marks are anchored. */
    anchor: Point2D
    marks: readonly OverlayMark[]
  }
  heat?: HeatView
  /** The parts that are free at the displayed moment, with their outlines. */
  freed?: readonly { key: string; outline: readonly Point2D[] }[]
  markers?: readonly OverlayMarker[]
}

/** Failure reported by an accelerated renderer. */
export type ReviewRendererFailure = 'GRAPHICS_UNAVAILABLE' | 'GRAPHICS_LOST'

/** Implemented by the accelerated and the static renderer. */
export interface ReviewRenderer {
  readonly kind: 'accelerated' | 'static'
  render(frame: ReviewFrame): void
  /** Draws the overlay above the sheet; `null` clears it. A renderer without it still works. */
  overlay?(overlay: ReviewOverlay | null): void
  /** Converts a client-space pointer position to sheet coordinates and the scale at that point. */
  pointAt(clientX: number, clientY: number): { point: Point2D; unitsPerPixel: number } | null
  onFailure(listener: (code: ReviewRendererFailure) => void): void
  dispose(): void
}

/** Observable controller state. */
export interface ReviewState {
  position: ReviewPosition
  playing: boolean
  speed: number
  sheetId: string
  selection: ReviewSelection | null
  viewport: ReviewViewport
  renderer: 'accelerated' | 'static'
  notices: readonly ReviewNotice[]
}

/** Time source injected into the controller. */
export interface ReviewClock {
  now(): number
  /** Schedules repeated ticks; the returned function cancels them. */
  schedule(tick: (now: number) => void): () => void
}

/** Subset of a keyboard event used by the controller. */
export interface ReviewKeyEvent {
  key: string
  shiftKey: boolean
}

/** Playback and seeking commands of one review session. */
export interface ReviewController {
  readonly state$: Observable<ReviewState>
  play(): void
  pause(): void
  reset(): void
  setSpeed(speed: number): void
  stepToNextPierce(): void
  seek(position: ReviewPosition): void
  seekToAction(actionIndex: number): void
  seekBy(actions: number): void
  selectSheet(sheetId: string): void
  select(selection: ReviewSelection | null): void
  moveSelection(kind: 'part' | 'action', delta: 1 | -1): void
  seekToSelectedAction(): void
  /** Moves the view by fractions of the visible extent; the center stays inside the sheet. */
  pan(dx: number, dy: number): void
  zoomBy(factor: number): void
  resetViewport(): void
  /** Runs the command bound to the key; returns whether the key was handled. */
  handleKey(event: ReviewKeyEvent): boolean
  dispose(): void
}

/** Options of the edit mode of `mountReview`. */
export interface ReviewEditOptions {
  /** Rotation, grain, mirroring and exclusion rules the artifact does not carry. */
  constraints?: EditInput['constraints']
  /** Size of one keyboard nudge, in geometry units, and of one rotation step, in degrees. */
  step?: { move: number; rotate: number }
  /** Called with the new state of the edit panel after every change. */
  onChange?(state: EditPanelState): void
  /** Process profile and cost model used to recompute the plan and the cost of the edited layout. */
  recompute?: { processProfile: CutProcessProfile; costModel?: CostModel }
}

/** Options of the risk assessment of `mountReview`. */
export interface ReviewRiskOptions {
  profile: CutRiskProfile
  processProfile: CutProcessProfile
  costModel?: CostModel
}

/** Observable state of the edit panel. */
export interface EditPanelState {
  mode: 'off' | 'edit'
  /** Key of the part being edited. */
  activePart: string | null
  candidate: CandidateEdit | null
  verdict: PlacementVerdict | null
  freshness: Freshness
  /** False from the first confirmed edit until the plan is recomputed. */
  planVisible: boolean
  canUndo: boolean
  canRedo: boolean
  riskStatus: RiskStatus | 'none'
  notices: readonly EditNotice[]
  /** True while a recomputation is running. */
  recomputing: boolean
  /** What changed against the original after the last recomputation. */
  comparison: ComparisonSummary | null
  /** Risk result of the displayed layout; null when it is outdated or was not assessed. */
  risk: RiskResult | null
  /** The inputs `risk` was assessed from, for the playback views. */
  riskRequest: RiskRequest | null
}

/** Edit and risk commands of a mounted review; the playback controller is unchanged. */
export interface ReviewEditHandle {
  readonly edit$: Observable<EditPanelState>
  enter(): void
  leave(): void
  selectPart(partKey: string | null): void
  /** Judges a candidate and shows it as the ghost; `null` clears it. */
  propose(candidate: CandidateEdit | null): void
  /** Confirms the pending candidate when its verdict is valid. */
  confirm(): void
  cancel(): void
  undo(): void
  redo(): void
  /** Recomputes the plan, the cost and the risk of the edited layout. */
  recompute(): void
  dispose(): void
}

/** Handle returned by `mountReview`. */
export interface ReviewMount {
  /** Scene displayed by the mounted review. */
  scene: ReviewScene
  /** Playback controller; `null` when the scene has nothing to play. */
  controller: ReviewController | null
  /** Edit commands; present only when the `edit` option was supplied. */
  edit: ReviewEditHandle | null
  /** Removes the review from its container and releases listeners. */
  dispose(): void
}

/** Options of `mountReview`. */
export interface ReviewMountOptions {
  /** Creates the accelerated renderer inside the given element; omitted means static review only. */
  acceleratedRenderer?: (view: HTMLElement) => Promise<ReviewRenderer>
  /** Time source for playback; defaults to the window's animation frames. */
  clock?: ReviewClock
  /** Turns on the edit mode: reposition parts with a live verdict, undo and redo. */
  edit?: ReviewEditOptions
  /** Turns on the cut risk assessment. */
  risk?: ReviewRiskOptions
}
