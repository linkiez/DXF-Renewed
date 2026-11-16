import type { CutActionKind } from '../../cutPath/types'
import { sampleActionPath } from '../../linking/actionPath'
import type { ReviewTimeline } from '../types'
import { LINE_KINDS } from './lineKinds'
import type { LineKind } from './lineKinds'


/** Segments of one action kind in timeline order, with prefix counts per action index. */
export interface KindBatch {
  /** x, y, z triplets, two vertices per segment. */
  positions: Float32Array
  segments: number
  /** `segmentsBefore[k]` is the number of segments of this kind in actions with index < k. */
  segmentsBefore: Uint32Array
}

/** Point markers (pierces or tabs) in timeline order with prefix counts. */
export interface MarkerBatch {
  /** x, y pairs. */
  centers: Float32Array
  count: number
  before: Uint32Array
}

/** Merged buffers of one sheet's timeline. */
export interface TimelineBuffers {
  lines: ReadonlyMap<LineKind, KindBatch>
  pierces: MarkerBatch
  tabs: MarkerBatch
  /** Largest number of segments any single action produces. */
  maxActionSegments: number
}

/**
 * Flattens a timeline into merged, order-preserving buffers so a trail is a prefix of each buffer.
 *
 * @param timeline - Timeline of one sheet.
 * @returns Per-kind segment buffers and pierce/tab marker buffers with prefix counts.
 */
export function buildBuffers(timeline: ReviewTimeline): TimelineBuffers {
  const actions = timeline.actions
  const paths = actions.map((action) =>
    action.kind === 'pierce' || action.kind === 'end' ? [] : sampleActionPath(action.points, action.curve),
  )
  const segmentCount = new Map<LineKind, number>(LINE_KINDS.map((kind) => [kind, 0]))
  const before = new Map<LineKind, Uint32Array>(LINE_KINDS.map((kind) => [kind, new Uint32Array(actions.length + 1)]))
  const pierceBefore = new Uint32Array(actions.length + 1)
  const tabBefore = new Uint32Array(actions.length + 1)
  let pierces = 0
  let tabs = 0
  let maxActionSegments = 0

  actions.forEach((action, index) => {
    for (const kind of LINE_KINDS) (before.get(kind) as Uint32Array)[index] = segmentCount.get(kind) as number
    pierceBefore[index] = pierces
    tabBefore[index] = tabs
    if (action.kind === 'pierce') pierces += 1
    if (action.kind === 'tab') tabs += 1
    const segments = Math.max(0, paths[index].length - 1)
    maxActionSegments = Math.max(maxActionSegments, segments)
    if (action.kind !== 'pierce' && action.kind !== 'end') {
      segmentCount.set(action.kind, (segmentCount.get(action.kind) as number) + segments)
    }
  })
  for (const kind of LINE_KINDS) (before.get(kind) as Uint32Array)[actions.length] = segmentCount.get(kind) as number
  pierceBefore[actions.length] = pierces
  tabBefore[actions.length] = tabs

  const lines = new Map<LineKind, KindBatch>()
  for (const kind of LINE_KINDS) {
    const segments = segmentCount.get(kind) as number
    const positions = new Float32Array(segments * 6)
    let cursor = 0
    actions.forEach((action, index) => {
      if (action.kind !== kind) return
      const path = paths[index]
      for (let step = 1; step < path.length; step += 1) {
        positions[cursor++] = path[step - 1].x
        positions[cursor++] = path[step - 1].y
        positions[cursor++] = 0
        positions[cursor++] = path[step].x
        positions[cursor++] = path[step].y
        positions[cursor++] = 0
      }
    })
    lines.set(kind, { positions, segments, segmentsBefore: before.get(kind) as Uint32Array })
  }

  const centersOf = (kind: CutActionKind, total: number): Float32Array => {
    const centers = new Float32Array(total * 2)
    let cursor = 0
    actions.forEach((action) => {
      if (action.kind !== kind || action.points.length === 0) return
      const first = action.points[0]
      const last = action.points[action.points.length - 1]
      centers[cursor++] = (first.x + last.x) / 2
      centers[cursor++] = (first.y + last.y) / 2
    })
    return centers
  }

  return {
    lines,
    pierces: { centers: centersOf('pierce', pierces), count: pierces, before: pierceBefore },
    tabs: { centers: centersOf('tab', tabs), count: tabs, before: tabBefore },
    maxActionSegments,
  }
}
