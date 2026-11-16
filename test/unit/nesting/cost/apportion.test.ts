import { expect } from 'expect'
import { apportion } from '../../../../src/nesting/cost/apportion'

const total = (values: readonly number[]): number => values.reduce((sum, value) => sum + value, 0)

describe('cost/apportion', () => {
  it('returns integers that add up exactly to the rounded sum of the exact shares', () => {
    const exact = [10.4, 20.4, 30.4, 40.4]

    const result = apportion(exact)

    expect(result.every(Number.isInteger)).toBe(true)
    expect(total(result)).toBe(Math.round(total(exact)))
    expect(total(result)).toBe(102)
  })

  it('gives the remaining units to the largest remainders, ties to the earlier index', () => {
    expect(apportion([0.5, 0.5, 0.5, 0.5])).toEqual([1, 1, 0, 0])
    expect(apportion([1.2, 1.7, 1.1])).toEqual([1, 2, 1])
  })

  it('handles zero shares, one share and a total smaller than the number of shares', () => {
    expect(apportion([])).toEqual([])
    expect(apportion([0, 0, 0])).toEqual([0, 0, 0])
    expect(apportion([7.6])).toEqual([8])
    expect(apportion([0.2, 0.2, 0.2, 0.2, 0.2])).toEqual([1, 0, 0, 0, 0])
  })

  it('reconciles a 500-share case and is identical for identical input', () => {
    const exact = Array.from({ length: 500 }, (_, index) => ((index * 7919) % 1000) / 37)

    const first = apportion(exact)

    expect(total(first)).toBe(Math.round(total(exact)))
    expect(apportion(exact)).toEqual(first)
  })

  it('does not mutate its input', () => {
    const exact = Object.freeze([1.5, 2.5, 3.5])

    expect(() => apportion(exact)).not.toThrow()
    expect(exact).toEqual([1.5, 2.5, 3.5])
  })
})
