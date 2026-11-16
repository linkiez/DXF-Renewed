import type { CutAction, CutActionKind, CutPlan } from '../../cutPath'
import type { Point2D } from '../../types'

/** One motion action of a contour with its index in the plan. */
export interface ContourMotion {
  readonly action: CutAction
  readonly index: number
}

/** A contour: the rapid to its start, its pierce and the motions that follow. */
export interface Contour {
  readonly contourId?: string
  readonly partId?: string
  readonly rapid: CutAction
  readonly rapidTarget: Point2D
  readonly pierce: CutAction
  readonly motions: readonly ContourMotion[]
  /** Last point of the contour (the pierce point when it has no motion). */
  readonly lastPoint: Point2D
  /** Straight distance from the last point to the next contour's rapid target; undefined for the last. */
  readonly nextRapidLength?: number
}

/** An action that no contour-oriented dialect can express. */
export interface UnsupportedAction {
  readonly actionIndex: number
  readonly kind: CutActionKind
  readonly contourId?: string
}

/** Result of splitting a plan. */
export interface ContourSplit {
  readonly contours: readonly Contour[]
  readonly unsupported: readonly UnsupportedAction[]
}

const MOTION: ReadonlySet<CutActionKind> = new Set(['lead-in', 'cut', 'lead-out', 'overcut'])
const UNSUPPORTED: ReadonlySet<CutActionKind> = new Set(['tab', 'common-line'])

const lastOf = (points: readonly Point2D[]): Point2D => points[points.length - 1]

interface Draft {
  rapid: CutAction
  pierce?: CutAction
  motions: ContourMotion[]
}

function build(draft: Draft): Omit<Contour, 'nextRapidLength'> | undefined {
  if (!draft.pierce) return undefined
  const all = [draft.rapid, draft.pierce, ...draft.motions.map((m) => m.action)]
  const contourId = all.find((a) => a.contourId)?.contourId
  const partId = all.find((a) => a.partId)?.partId
  const lastMotion = draft.motions[draft.motions.length - 1]
  return {
    ...(contourId ? { contourId } : {}),
    ...(partId ? { partId } : {}),
    rapid: draft.rapid,
    rapidTarget: lastOf(draft.rapid.points),
    pierce: draft.pierce,
    motions: draft.motions,
    lastPoint: lastOf(lastMotion ? lastMotion.action.points : draft.pierce.points),
  }
}

function unsupportedOf(action: CutAction, index: number): UnsupportedAction {
  return { actionIndex: index, kind: action.kind, ...(action.contourId ? { contourId: action.contourId } : {}) }
}

function addToDraft(draft: Draft, action: CutAction, index: number): void {
  if (action.kind === 'pierce' && !draft.pierce) draft.pierce = action
  else if (MOTION.has(action.kind)) draft.motions.push({ action, index })
}

function link(drafts: readonly Draft[]): Contour[] {
  const built = drafts.map(build).filter((item): item is Omit<Contour, 'nextRapidLength'> => item !== undefined)
  return built.map((item, position) => {
    const next = built[position + 1]
    if (!next) return item
    return { ...item, nextRapidLength: Math.hypot(next.rapidTarget.x - item.lastPoint.x, next.rapidTarget.y - item.lastPoint.y) }
  })
}

/**
 * Split a flat cut plan into contours for contour-oriented dialects.
 *
 * A contour starts at a `rapid` and holds the pierce and the lead-in, cut, lead-out and overcut actions that
 * follow it, up to the next `rapid` or the `end` action. A group without a pierce is not a contour.
 * `tab` and `common-line` actions are returned as unsupported and never flattened.
 *
 * @param plan - Cut plan; not mutated.
 * @returns The contours with the travel to the next one, and the unsupported actions.
 */
export function splitContours(plan: CutPlan): ContourSplit {
  const drafts: Draft[] = []
  const unsupported: UnsupportedAction[] = []
  let current: Draft | undefined
  plan.actions.forEach((action, index) => {
    if (UNSUPPORTED.has(action.kind)) {
      unsupported.push(unsupportedOf(action, index))
    } else if (action.kind === 'rapid') {
      current = { rapid: action, motions: [] }
      drafts.push(current)
    } else if (action.kind === 'end') {
      current = undefined
    } else if (current) {
      addToDraft(current, action, index)
    }
  })
  return { contours: link(drafts), unsupported }
}
