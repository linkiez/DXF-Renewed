import { expect } from 'expect'
import { planCutPath } from '../../../../src/nesting'
import { basicLayout, contour, placementFor, profile, sheet, square } from './fixtures'

describe('cutPath/sequence — deterministic safe ordering', () => {
  it('always emits an associated inner contour before its outer contour', () => {
    const result = planCutPath(basicLayout(), profile())
    expect(result.valid).toBe(true)

    const contourOrder = result.plan!.actions
      .filter((action) => action.kind === 'cut')
      .map((action) => action.contourId)
    expect(contourOrder.indexOf('hole')).toBeGreaterThanOrEqual(0)
    expect(contourOrder.indexOf('outer')).toBeGreaterThanOrEqual(0)
    expect(contourOrder.indexOf('hole')).toBeLessThan(contourOrder.indexOf('outer'))
  })

  it('uses the supplied contour order as baseline and produces a stable result', () => {
    const first = planCutPath(basicLayout(), profile())
    const second = planCutPath(basicLayout(), profile())

    expect(first.metrics.baselineRapidLength).toBeGreaterThan(0)
    expect(second).toEqual(first)
  })

  it('reports the actual optimized travel even when dependency ordering increases it', () => {
    const result = planCutPath(basicLayout(), profile({ sequence: { strategy: 'input' } }))

    expect(result.valid).toBe(true)
    expect(result.metrics.optimizedRapidLength).toBeGreaterThan(
      result.metrics.baselineRapidLength,
    )
    expect(result.plan!.optimizedRapidLength).toBe(result.metrics.optimizedRapidLength)
  })

  it('meets the 20 percent rapid-travel improvement criterion on the reference layout', () => {
    const near = square('near-shape', 5, 5, 5)
    const far = square('far-shape', 80, 80, 5)
    const farHole = square('far-hole-shape', 81, 81, 1)
    const layout = {
      sheets: [sheet],
      startPoint: { x: 0, y: 0 },
      contours: [
        contour('far-outer', 'part-far', far, placementFor(far, sheet.id), true),
        contour('near-outer', 'part-near', near, placementFor(near, sheet.id), true),
        contour(
          'far-hole',
          'part-far',
          farHole,
          placementFor(farHole, sheet.id),
          false,
          'far-outer',
        ),
      ],
    }

    const result = planCutPath(layout, profile())

    expect(result.valid).toBe(true)
    expect(result.metrics.optimizedRapidLength).toBeLessThanOrEqual(
      result.metrics.baselineRapidLength * 0.8,
    )
    expect(result.metrics.improvementRatio).toBeGreaterThanOrEqual(0.2)
  })
})
