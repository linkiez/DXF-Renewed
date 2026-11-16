import { expect } from 'expect'
import type { ActionUsage } from '../../../../src/nesting/cost/collectUsage'
import { estimateTimes } from '../../../../src/nesting/cost/estimateTimes'
import { completeModel, withoutField } from './fixtures'

const cut = (length: number, feed: number | null = null): ActionUsage => ({ category: 'cut', length, feed, dwell: null })
const travel = (length: number): ActionUsage => ({ category: 'travel', length, feed: null, dwell: null })
const pierce = (dwell: number | null = null): ActionUsage => ({ category: 'pierce', length: 0, feed: null, dwell })

describe('cost/estimateTimes', () => {
  it('converts geometry length and meters per minute into seconds', () => {
    const result = estimateTimes([cut(1000), travel(5000), pierce(), pierce()], completeModel())

    expect(result.cuttingSeconds).toBeCloseTo(30)
    expect(result.travelSeconds).toBeCloseTo(30)
    expect(result.pierceSeconds).toBeCloseTo(1)
    expect(result.cutLength).toBe(1000)
    expect(result.travelLength).toBe(5000)
    expect(result.pierceCount).toBe(2)
  })

  it('lets the feed of an action take precedence over the model cutting speed', () => {
    const result = estimateTimes([cut(1000, 4)], completeModel())

    expect(result.cuttingSeconds).toBeCloseTo(15)
  })

  it('lets the dwell of an action take precedence over the model pierce dwell', () => {
    const result = estimateTimes([pierce(2), pierce()], completeModel())

    expect(result.pierceSeconds).toBeCloseTo(2.5)
  })

  it('gives null when the speed or dwell it needs is absent', () => {
    expect(estimateTimes([cut(1000)], withoutField(completeModel(), 'speeds.cutting')).cuttingSeconds).toBeNull()
    expect(estimateTimes([travel(1000)], withoutField(completeModel(), 'speeds.rapid')).travelSeconds).toBeNull()
    expect(estimateTimes([pierce()], withoutField(completeModel(), 'speeds.pierceDwellSeconds')).pierceSeconds).toBeNull()
  })

  it('does not need a speed when a feed is carried, and gives zero for zero length or no actions', () => {
    const model = withoutField(completeModel(), 'speeds.cutting')

    expect(estimateTimes([cut(1000, 2)], model).cuttingSeconds).toBeCloseTo(30)
    expect(estimateTimes([cut(0)], model).cuttingSeconds).toBe(0)
    expect(estimateTimes([], model)).toEqual({
      cutLength: 0, travelLength: 0, pierceCount: 0, cuttingSeconds: 0, travelSeconds: 0, pierceSeconds: 0,
    })
  })
})
