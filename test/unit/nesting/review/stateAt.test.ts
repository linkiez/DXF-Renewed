import { expect } from 'expect'
import { actionPrefix } from '../../../../src/nesting/review/actionPrefix'
import { buildReviewScene } from '../../../../src/nesting/review/buildScene'
import { distanceAtPosition } from '../../../../src/nesting/review/distanceAtPosition'
import { nextPierce } from '../../../../src/nesting/review/nextPierce'
import { positionAtDistance } from '../../../../src/nesting/review/positionAtDistance'
import { stateAt } from '../../../../src/nesting/review/stateAt'
import type { ReviewAction, ReviewScene } from '../../../../src/nesting/review/types'
import { referenceFixture, smallFixture } from './fixtures'

const sceneOf = async (): Promise<ReviewScene> => buildReviewScene((await smallFixture()).input)

const line = (kind: ReviewAction['kind'], points: ReviewAction['points'], curve?: ReviewAction['curve']): ReviewAction => ({
  index: 0, kind, points, curve, startLength: 0, length: 0, notices: [],
})

describe('review/actionPrefix', () => {
  it('interpolates along a polyline by fraction of its length', () => {
    const action = line('cut', [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }])

    expect(actionPrefix(action, 0)).toEqual([{ x: 0, y: 0 }])
    expect(actionPrefix(action, 0.25)).toEqual([{ x: 0, y: 0 }, { x: 5, y: 0 }])
    expect(actionPrefix(action, 0.75)).toEqual([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 5 }])
    expect(actionPrefix(action, 1)).toEqual([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }])
  })

  it('samples an arc on its circle and keeps a single point for a pierce', () => {
    const arc = line('cut', [{ x: 0, y: 0 }, { x: 10, y: 0 }], { type: 'arc', center: { x: 5, y: 0 }, clockwise: false })
    const half = actionPrefix(arc, 0.5)
    const mid = half[half.length - 1]

    expect(mid.x).toBeCloseTo(5)
    expect(Math.abs(mid.y)).toBeCloseTo(5)
    expect(actionPrefix(line('pierce', [{ x: 3, y: 4 }]), 0.5)).toEqual([{ x: 3, y: 4 }])
    expect(actionPrefix(line('end', []), 1)).toEqual([])
  })
})

describe('review/stateAt', () => {
  it('shows the tool at the start of an action, in the middle and at the end of the plan', async () => {
    const scene = await sceneOf()
    const actions = scene.sheets[0].timeline?.actions ?? []
    const cutIndex = actions.findIndex((a) => a.kind === 'cut')

    const atStart = stateAt(scene, { sheetId: 'sheet-1', actionIndex: cutIndex, progress: 0 })
    expect(atStart.head).toEqual(actions[cutIndex].points[0])
    expect(atStart.completed).toBe(cutIndex)
    expect(atStart.current?.index).toBe(cutIndex)

    const middle = stateAt(scene, { sheetId: 'sheet-1', actionIndex: cutIndex, progress: 0.5 })
    expect(middle.head).not.toEqual(actions[cutIndex].points[0])
    expect(middle.completed).toBe(cutIndex)

    const finished = stateAt(scene, { sheetId: 'sheet-1', actionIndex: actions.length, progress: 0 })
    expect(finished.current).toBeNull()
    expect(finished.completed).toBe(actions.length)
    expect(finished.head).not.toBeNull()
  })

  it('returns an empty state for a sheet without timeline', async () => {
    const scene = buildReviewScene({ artifact: (await smallFixture()).artifact })

    expect(stateAt(scene, { sheetId: 'sheet-1', actionIndex: 0, progress: 0 })).toEqual({ head: null, completed: 0, current: null })
  })

  it('clamps an out-of-range action index', async () => {
    const scene = await sceneOf()
    const total = scene.sheets[0].timeline?.actions.length ?? 0

    expect(stateAt(scene, { sheetId: 'sheet-1', actionIndex: total + 50, progress: 0 }).completed).toBe(total)
    expect(stateAt(scene, { sheetId: 'sheet-1', actionIndex: -4, progress: 0 }).completed).toBe(0)
  })
})

describe('review/positionAtDistance and distanceAtPosition', () => {
  it('maps the start length of every action back to that action (seek equals play-to)', async () => {
    const scene = await sceneOf()
    const timeline = scene.sheets[0].timeline
    if (!timeline) throw new Error('fixture without timeline')

    for (const action of timeline.actions) {
      const reached = positionAtDistance(timeline, 'sheet-1', action.playStart)
      const sought = { sheetId: 'sheet-1', actionIndex: action.index, progress: 0 }

      expect(reached).toEqual(sought)
      expect(stateAt(scene, reached)).toEqual(stateAt(scene, sought))
    }
  })

  it('is the inverse of distanceAtPosition inside an action and finishes at the total length', async () => {
    const scene = await sceneOf()
    const timeline = scene.sheets[0].timeline
    if (!timeline) throw new Error('fixture without timeline')
    const cut = timeline.actions.find((a) => a.kind === 'cut')
    if (!cut) throw new Error('fixture without cut')
    const position = { sheetId: 'sheet-1', actionIndex: cut.index, progress: 0.4 }

    const distance = distanceAtPosition(timeline, position)
    const back = positionAtDistance(timeline, 'sheet-1', distance)

    expect(distance).toBeCloseTo(cut.playStart + cut.playSpan * 0.4)
    expect(back.actionIndex).toBe(cut.index)
    expect(back.progress).toBeCloseTo(0.4)
    expect(positionAtDistance(timeline, 'sheet-1', timeline.playTotal + 5)).toEqual({
      sheetId: 'sheet-1', actionIndex: timeline.actions.length, progress: 0,
    })
  })

  it('is deterministic for the 500-part reference sheet at sampled positions', async () => {
    const scene = buildReviewScene((await referenceFixture()).input)
    const timeline = scene.sheets[0].timeline
    if (!timeline) throw new Error('fixture without timeline')
    const step = Math.floor(timeline.actions.length / 40)

    for (let index = 0; index < timeline.actions.length; index += step) {
      const action = timeline.actions[index]
      const reached = positionAtDistance(timeline, 'sheet-1', action.playStart)
      expect(stateAt(scene, reached)).toEqual(stateAt(scene, { sheetId: 'sheet-1', actionIndex: index, progress: 0 }))
    }
  })
})

describe('review/nextPierce', () => {
  it('moves to the next pierce after the current action and returns null after the last', async () => {
    const scene = await sceneOf()
    const timeline = scene.sheets[0].timeline
    if (!timeline) throw new Error('fixture without timeline')
    const [first, second] = timeline.pierceIndices

    expect(nextPierce(scene, { sheetId: 'sheet-1', actionIndex: 0, progress: 0 })).toEqual({ sheetId: 'sheet-1', actionIndex: first, progress: 0 })
    expect(nextPierce(scene, { sheetId: 'sheet-1', actionIndex: first, progress: 0.3 })?.actionIndex).toBe(second)
    expect(nextPierce(scene, { sheetId: 'sheet-1', actionIndex: timeline.pierceIndices[timeline.pierceIndices.length - 1], progress: 0 })).toBeNull()
  })
})
