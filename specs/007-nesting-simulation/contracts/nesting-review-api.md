# Nesting Review API Contract

Public contract of feature 007. Declarations only: the implementation lives in
`src/nesting/review/` and the accelerated renderer on the subpath `review/three`. Types referenced
from existing modules are reused, not redefined. The declarations were type-checked against the
implemented sources with `tsc --noEmit --strict` when this contract was last updated.

```ts
/**
 * Public contract for nesting review (feature 007). Declarations only; the implementation lives
 * in `src/nesting/review/`. Types referenced from existing modules are reused, not redefined.
 */
import type { Observable } from 'rxjs'
import type {
  CompoundPlacement,
  Placement,
  Point2D,
  StockItem,
} from '../../../src/nesting/types'
import type {
  CutActionKind,
  CutActionMetadata,
  CutCurve,
  CutLayout,
  CutPlanResult,
} from '../../../src/nesting/cutPath/types'
import type { ErpDigest, ErpNestingArtifact } from '../../../src/nesting/erp/types'

export interface ReviewInput {
  artifact: ErpNestingArtifact
  layout?: CutLayout
  cutPlan?: CutPlanResult
}

export type ReviewNoticeSeverity = 'info' | 'warning' | 'error'
export type ReviewNoticeOrigin = 'artifact' | 'planning' | 'review'

export interface ReviewNotice {
  severity: ReviewNoticeSeverity
  code: string
  message: string
  origin: ReviewNoticeOrigin
  sheetId?: string
  partKey?: string
  actionIndex?: number
}

export interface ReviewPart {
  key: string
  shapeId: string
  instanceIndex: number
  placement: Placement | CompoundPlacement
  outlines: readonly (readonly Point2D[])[]
  source: { layer?: string; originalHandle?: string; area?: number; perimeter?: number }
  status: 'placed' | 'flagged'
  notices: readonly ReviewNotice[]
}

export interface ReviewAction {
  index: number
  kind: CutActionKind
  points: readonly Point2D[]
  curve?: CutCurve
  startLength: number
  length: number
  playStart: number
  playSpan: number
  partKey?: string
  contourId?: string
  metadata?: CutActionMetadata
  notices: readonly ReviewNotice[]
}

export interface ReviewTimeline {
  actions: readonly ReviewAction[]
  totalLength: number
  playTotal: number
  pierceIndices: readonly number[]
}

export interface ReviewSheet {
  id: string
  stock: StockItem
  parts: readonly ReviewPart[]
  timeline?: ReviewTimeline
}

export interface ReviewIdentity {
  status: ErpNestingArtifact['status']
  contractVersion: number
  correlation: ErpNestingArtifact['correlation']
  inputDigest: ErpDigest
  outputDigest: ErpDigest
}

export interface ReviewSummary {
  sheetCount: number
  partCount: number
  unplacedCount: number
  yield: number
  totalCutLength: number
  totalRapidLength: number
  pierceCount: number
}

export interface ReviewScene {
  status: 'ready' | 'partial' | 'unavailable'
  identity: ReviewIdentity | null
  sheets: readonly ReviewSheet[]
  notices: readonly ReviewNotice[]
  summary: ReviewSummary
  capabilities: { playback: boolean; actionInspection: boolean }
}

export interface ReviewPosition {
  sheetId: string
  actionIndex: number
  progress: number
}

export interface ReviewToolState {
  head: Point2D | null
  completed: number
  current: ReviewAction | null
}

export type ReviewSelection =
  | { kind: 'part'; sheetId: string; partKey: string }
  | { kind: 'action'; sheetId: string; actionIndex: number }

export interface ReviewInspection {
  title: string
  rows: readonly { label: string; value: string }[]
  notices: readonly ReviewNotice[]
}

/** Pure functions of the model; no I/O, no mutation of inputs, no time. */
export declare function buildReviewScene(input: ReviewInput): ReviewScene
export declare function stateAt(scene: ReviewScene, position: ReviewPosition): ReviewToolState
export declare function nextPierce(
  scene: ReviewScene,
  position: ReviewPosition,
): ReviewPosition | null
export declare function pickAt(
  scene: ReviewScene,
  sheetId: string,
  point: Point2D,
  tolerance: number,
  after?: ReviewSelection | null,
): ReviewSelection | null
export declare function inspect(
  scene: ReviewScene,
  selection: ReviewSelection,
): ReviewInspection
export declare function summarize(scene: ReviewScene): string

/** Always available; returns a self-contained SVG string and needs no DOM. */
export declare function renderReviewSvg(
  scene: ReviewScene,
  options: {
    sheetId: string
    position?: ReviewPosition
    selection?: ReviewSelection | null
    viewport?: ReviewViewport
  },
): string

export interface ReviewViewport {
  center: Point2D
  zoom: number
}

/** Implemented by the SVG and three.js renderers; the controller depends only on this. */
export interface ReviewRenderer {
  readonly kind: 'accelerated' | 'static'
  render(frame: {
    scene: ReviewScene
    sheetId: string
    position: ReviewPosition
    selection: ReviewSelection | null
    viewport: ReviewViewport
  }): void
  pointAt(clientX: number, clientY: number): { point: Point2D; unitsPerPixel: number } | null
  onFailure(listener: (code: 'GRAPHICS_UNAVAILABLE' | 'GRAPHICS_LOST') => void): void
  dispose(): void
}

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

export interface ReviewClock {
  now(): number
  schedule(tick: (now: number) => void): () => void
}

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
  pan(dx: number, dy: number): void
  zoomBy(factor: number): void
  resetViewport(): void
  handleKey(event: ReviewKeyEvent): boolean
  dispose(): void
}

/** Subset of a keyboard event the controller needs; keeps the controller DOM-free. */
export interface ReviewKeyEvent {
  key: string
  shiftKey: boolean
}

/**
 * Key map (all functions are also reachable through labeled controls with Tab focus):
 * Space play/pause; r reset; n next pierce; `<` `>` slower/faster; `[` `]` previous/next sheet;
 * `,` `.` previous/next action; PageUp/PageDown -10/+10 actions; Home/End first/last action;
 * ArrowLeft/ArrowRight previous/next part (selects); ArrowUp/ArrowDown previous/next action
 * (selects); Enter seek to the selected action; Esc clear selection; Shift+arrows pan; `+` `-`
 * zoom; `0` reset view.
 */
export declare function createReviewController(options: {
  scene: ReviewScene
  renderer: ReviewRenderer
  /** Static renderer that takes over after the accelerated one fails. */
  fallback?: ReviewRenderer
  clock: ReviewClock
  /** Notices raised before the session started. */
  notices?: readonly ReviewNotice[]
}): ReviewController

/** Exported from the additive subpath `review/three`; never imported by the main entry. */
export type ThreeNamespace = typeof import('three')

/** Rejects with a `ReviewGraphicsError` (code `GRAPHICS_UNAVAILABLE`) when WebGL2 or three is missing. */
export declare function createThreeRenderer(options: {
  container: HTMLElement
  three: ThreeNamespace | (() => Promise<ThreeNamespace>)
}): Promise<ReviewRenderer>

export declare function mountReview(
  container: HTMLElement,
  input: ReviewInput,
  options?: {
    /** Factory for the accelerated renderer; omitted means static review only. */
    acceleratedRenderer?: (view: HTMLElement) => Promise<ReviewRenderer>
    clock?: ReviewClock
  },
): Promise<{ scene: ReviewScene; controller: ReviewController | null; dispose(): void }>
```
