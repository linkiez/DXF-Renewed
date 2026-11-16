import { expect } from 'expect'
import type { CutAction } from '../../../../src/nesting'
import { buildTimeline } from '../../../../src/nesting/review/buildTimeline'

const actions: CutAction[] = [
  { kind: 'rapid', points: [{ x: 0, y: 0 }, { x: 3, y: 4 }] },
  { kind: 'pierce', points: [{ x: 3, y: 4 }] },
  { kind: 'cut', points: [{ x: 3, y: 4 }, { x: 3, y: 14 }, { x: 13, y: 14 }] },
  {
    kind: 'cut',
    points: [{ x: 0, y: 0 }, { x: 10, y: 0 }],
    curve: { type: 'arc', center: { x: 5, y: 0 }, clockwise: false },
  },
  { kind: 'pierce', points: [{ x: 1, y: 1 }] },
  { kind: 'end', points: [{ x: 1, y: 1 }] },
]

describe('review/buildTimeline', () => {
  it('computes cumulative start length and length per action', () => {
    const timeline = buildTimeline(actions)

    expect(timeline.actions.map((a) => a.index)).toEqual([0, 1, 2, 3, 4, 5])
    expect(timeline.actions[0].length).toBeCloseTo(5)
    expect(timeline.actions[1].length).toBe(0)
    expect(timeline.actions[2].startLength).toBeCloseTo(5)
    expect(timeline.actions[2].length).toBeCloseTo(20)
    expect(timeline.actions[3].startLength).toBeCloseTo(25)
  })

  it('measures an arc along its curve, not by its chord', () => {
    const timeline = buildTimeline(actions)

    expect(timeline.actions[3].length).toBeCloseTo(Math.PI * 5)
    expect(timeline.totalLength).toBeCloseTo(25 + Math.PI * 5)
  })

  it('lists pierce indices in order and keeps zero-length actions', () => {
    const timeline = buildTimeline(actions)

    expect(timeline.pierceIndices).toEqual([1, 4])
    expect(timeline.actions).toHaveLength(actions.length)
    expect(timeline.actions[5].length).toBe(0)
  })

  it('gives every action a positive playback span, with a dwell for actions without length', () => {
    const timeline = buildTimeline(actions)

    expect(timeline.actions.every((a) => a.playSpan > 0)).toBe(true)
    expect(timeline.actions[1].length).toBe(0)
    expect(timeline.actions[1].playSpan).toBeGreaterThan(0)
    expect(timeline.actions[0].playSpan).toBeCloseTo(timeline.actions[0].length)
    expect(timeline.actions[2].playStart).toBeCloseTo(timeline.actions[1].playStart + timeline.actions[1].playSpan)
    const last = timeline.actions[timeline.actions.length - 1]
    expect(timeline.playTotal).toBeCloseTo(last.playStart + last.playSpan)
  })

  it('measures a bezier along its control polygon sampling', () => {
    const timeline = buildTimeline([{
      kind: 'cut',
      points: [{ x: 0, y: 0 }, { x: 10, y: 0 }],
      curve: { type: 'bezier', controlPoints: [{ x: 0, y: 5 }, { x: 10, y: 5 }] },
    }])

    expect(timeline.actions[0].length).toBeGreaterThan(10)
    expect(timeline.actions[0].length).toBeLessThan(20)
  })

  it('is deterministic and does not mutate its input', () => {
    const frozen = structuredClone(actions)
    const first = buildTimeline(actions)
    const second = buildTimeline(actions)

    expect(second).toEqual(first)
    expect(actions).toEqual(frozen)
  })

  it('carries part, contour and metadata links through', () => {
    const timeline = buildTimeline([{
      kind: 'cut',
      points: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
      contourId: 'c1',
      partId: 'p1',
      metadata: { feed: 900 },
    }])

    expect(timeline.actions[0].contourId).toBe('c1')
    expect(timeline.actions[0].metadata).toEqual({ feed: 900 })
    expect(timeline.actions[0].notices).toEqual([])
  })
})
