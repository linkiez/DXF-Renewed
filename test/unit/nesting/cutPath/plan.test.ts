import { expect } from 'expect'
import { planCutPath } from '../../../../src/nesting'
import type { CutLayout } from '../../../../src/nesting'
import { basicLayout, clone, contour, placementFor, profile, sheet, square } from './fixtures'

describe('cutPath/plan — public contract', () => {
  it('returns a structured valid result with a plan and travel metrics', () => {
    const result = planCutPath(basicLayout(), profile({
      sequence: { strategy: 'input' },
    }))

    expect(result.valid).toBe(true)
    expect(result.plan).toBeDefined()
    expect(result.problems).toEqual([])
    expect(result.metrics.baselineRapidLength).toBeGreaterThanOrEqual(0)
    expect(result.metrics.optimizedRapidLength).toBeGreaterThanOrEqual(0)
    expect(result.metrics.improvementRatio).toBeLessThan(0)
  })

  it('does not mutate either caller-owned planning input', () => {
    const layout = basicLayout()
    const processProfile = profile()
    const beforeLayout = clone(layout)
    const beforeProfile = clone(processProfile)

    planCutPath(layout, processProfile)

    expect(layout).toEqual(beforeLayout)
    expect(processProfile).toEqual(beforeProfile)
  })

  it('throws for structurally invalid contour references but returns validation failures', () => {
    const layout = basicLayout()
    layout.contours[0].sheetId = 'missing-sheet'

    expect(() => planCutPath(layout, profile())).toThrow()

    const invalidGeometry: CutLayout = {
      ...basicLayout(),
      contours: basicLayout().contours.map((item) => ({
        ...item,
        placement: {
          ...item.placement,
          x: item.id === 'outer' ? -2 : item.placement.x,
        },
      })),
    }
    const result = planCutPath(invalidGeometry, profile())

    expect(result.valid).toBe(false)
    expect(result.problems.length).toBeGreaterThan(0)
    expect(result.problems.every((problem) => problem.code && problem.message)).toBe(true)
  })

  it('returns one complete plan per sheet with aggregated travel metrics', () => {
    const secondSheet = { ...sheet, id: 'sheet-2' }
    const firstShape = square('first-shape', 10, 10, 5)
    const secondShape = square('second-shape', 20, 20, 5)
    const layout = {
      sheets: [sheet, secondSheet],
      startPoint: { x: 0, y: 0 },
      contours: [
        contour('first', 'part-1', firstShape, placementFor(firstShape, sheet.id), true),
        {
          ...contour('second', 'part-2', secondShape, placementFor(secondShape, secondSheet.id), true),
          sheetId: secondSheet.id,
          placement: placementFor(secondShape, secondSheet.id),
        },
      ],
    }

    const result = planCutPath(layout, profile({ lead: { type: 'none', length: 0, angle: 0, placement: 'automatic' } }))

    expect(result.valid).toBe(true)
    expect(result.plans).toHaveLength(2)
    expect(result.plan!.sheetId).toBe(sheet.id)
    expect(result.metrics.baselineRapidLength).toBe(
      result.plans!.reduce((total, plan) => total + plan.baselineRapidLength, 0),
    )
    expect(result.metrics.optimizedRapidLength).toBe(
      result.plans!.reduce((total, plan) => total + plan.optimizedRapidLength, 0),
    )
  })
})
