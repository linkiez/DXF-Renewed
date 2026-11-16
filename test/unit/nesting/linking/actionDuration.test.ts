import { expect } from 'expect'
import { actionCategory } from '../../../../src/nesting/linking/actionCategory'
import { actionDuration } from '../../../../src/nesting/linking/actionDuration'

const speeds = { cutting: 6, rapid: 30, pierceDwellSeconds: 0.5 }

describe('linking/actionCategory', () => {
  it('maps the cutting-like kinds to cut, rapid to travel, pierce to pierce and end to nothing', () => {
    for (const kind of ['cut', 'lead-in', 'lead-out', 'overcut', 'tab', 'common-line'] as const) {
      expect(actionCategory(kind)).toBe('cut')
    }
    expect(actionCategory('rapid')).toBe('travel')
    expect(actionCategory('pierce')).toBe('pierce')
    expect(actionCategory('end')).toBeUndefined()
  })
})

describe('linking/actionDuration', () => {
  it('divides the length in meters by the speed in meters per minute', () => {
    const seconds = actionDuration({ category: 'cut', length: 1000, feed: null, dwell: null }, speeds, 1000)
    expect(seconds).toBeCloseTo(10)
    expect(actionDuration({ category: 'travel', length: 5000, feed: null, dwell: null }, speeds, 1000)).toBeCloseTo(10)
  })

  it('lets the action feed take precedence over the cutting and rapid speeds', () => {
    expect(actionDuration({ category: 'cut', length: 1000, feed: 12, dwell: null }, speeds, 1000)).toBeCloseTo(5)
    expect(actionDuration({ category: 'travel', length: 1000, feed: 60, dwell: null }, speeds, 1000)).toBeCloseTo(1)
  })

  it('uses the dwell of the action over the profile dwell for a pierce', () => {
    expect(actionDuration({ category: 'pierce', length: 0, feed: null, dwell: 2 }, speeds, 1000)).toBe(2)
    expect(actionDuration({ category: 'pierce', length: 0, feed: null, dwell: null }, speeds, 1000)).toBe(0.5)
  })

  it('is zero for a zero length and null when the needed speed or dwell is absent or not positive', () => {
    expect(actionDuration({ category: 'cut', length: 0, feed: null, dwell: null }, {}, 1000)).toBe(0)
    expect(actionDuration({ category: 'cut', length: 10, feed: null, dwell: null }, {}, 1000)).toBeNull()
    expect(actionDuration({ category: 'cut', length: 10, feed: null, dwell: null }, { cutting: 0 }, 1000)).toBeNull()
    expect(actionDuration({ category: 'travel', length: 10, feed: null, dwell: null }, { cutting: 6 }, 1000)).toBeNull()
    expect(actionDuration({ category: 'pierce', length: 0, feed: null, dwell: null }, {}, 1000)).toBeNull()
  })
})
