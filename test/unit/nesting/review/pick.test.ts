import { expect } from 'expect'
import { buildReviewScene } from '../../../../src/nesting/review/buildScene'
import { pickAt } from '../../../../src/nesting/review/pick'
import type { ReviewScene, ReviewSelection } from '../../../../src/nesting/review/types'
import { smallFixture } from './fixtures'

const sceneOf = async (): Promise<ReviewScene> => buildReviewScene((await smallFixture()).input)

describe('review/pick — hit testing', () => {
  it('selects the part when the point is inside it and away from any action', async () => {
    const scene = await sceneOf()

    expect(pickAt(scene, 'sheet-1', { x: 5, y: 18 }, 1)).toEqual({ kind: 'part', sheetId: 'sheet-1', partKey: 'part-1#0' })
  })

  it('selects an action before the part when the point is within tolerance of its path', async () => {
    const scene = await sceneOf()
    const actions = scene.sheets[0].timeline?.actions ?? []
    const outerCut = actions.find((a) => a.kind === 'cut' && a.contourId === 'part-1-outer')

    const hit = pickAt(scene, 'sheet-1', { x: 2.2, y: 12 }, 0.5)

    expect(hit).toEqual({ kind: 'action', sheetId: 'sheet-1', actionIndex: outerCut?.index })
  })

  it('selects a pierce by its point', async () => {
    const scene = await sceneOf()
    const pierce = scene.sheets[0].timeline?.actions.find((a) => a.kind === 'pierce')

    const hit = pickAt(scene, 'sheet-1', pierce?.points[0] as { x: number; y: number }, 0.1)

    expect(hit?.kind).toBe('action')
  })

  it('lets the planner reach every overlapping item by passing the previous selection', async () => {
    const scene = await sceneOf()
    const seen: ReviewSelection[] = []
    let current: ReviewSelection | null = null
    for (let step = 0; step < 12; step += 1) {
      current = pickAt(scene, 'sheet-1', { x: 2.2, y: 12 }, 0.5, current)
      if (!current || seen.some((s) => JSON.stringify(s) === JSON.stringify(current))) break
      seen.push(current)
    }

    expect(seen.length).toBeGreaterThanOrEqual(2)
    expect(seen.some((s) => s.kind === 'part')).toBe(true)
    expect(seen.some((s) => s.kind === 'action')).toBe(true)
    expect(seen[0].kind).toBe('action')
  })

  it('returns null outside every part and action, and for unknown sheets', async () => {
    const scene = await sceneOf()

    expect(pickAt(scene, 'sheet-1', { x: 95, y: 95 }, 1)).toBeNull()
    expect(pickAt(scene, 'sheet-1', { x: 500, y: 500 }, 1)).toBeNull()
    expect(pickAt(scene, 'nope', { x: 5, y: 18 }, 1)).toBeNull()
  })

  it('is deterministic for identical input', async () => {
    const scene = await sceneOf()

    expect(pickAt(scene, 'sheet-1', { x: 2.2, y: 12 }, 0.5)).toEqual(pickAt(scene, 'sheet-1', { x: 2.2, y: 12 }, 0.5))
  })

  it('does not pick parts of another sheet', async () => {
    const scene = await sceneOf()

    expect(pickAt(scene, 'sheet-2', { x: 5, y: 18 }, 1)).toEqual({ kind: 'part', sheetId: 'sheet-2', partKey: 'part-3#0' })
  })
})
