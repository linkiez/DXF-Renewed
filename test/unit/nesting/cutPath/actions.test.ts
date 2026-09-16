import { expect } from 'expect'
import { planCutPath } from '../../../../src/nesting'
import { basicLayout, contour, placementFor, profile, sheet, square } from './fixtures'

describe('cutPath/actions — machine-independent action kinds', () => {
  it('emits every process action selected by the profile in a deterministic order', () => {
    const result = planCutPath(basicLayout(), profile({
      tabs: {
        enabled: true,
        width: 0.5,
        count: 2,
      },
      overcut: {
        enabled: true,
        length: 0.25,
      },
    }))

    expect(result.valid).toBe(true)
    const kinds = result.plan!.actions.map((action) => action.kind)
    for (const kind of ['rapid', 'pierce', 'lead-in', 'cut', 'lead-out', 'overcut', 'tab', 'end']) {
      expect(kinds).toContain(kind)
    }
    expect(result.plan!.stats.pierceCount).toBeGreaterThan(0)
    expect(result.plan!.stats.tabCount).toBe(2)
  })

  it('emits a common-line action only for a verified shared edge', () => {
    const first = square('first-shape', 10, 10, 10)
    const second = square('second-shape', 20, 10, 10)
    const layout = {
      sheets: [sheet],
      contours: [
        contour('first', 'part-1', first, placementFor(first, sheet.id), true),
        contour('second', 'part-2', second, placementFor(second, sheet.id), true),
      ],
      startPoint: { x: 0, y: 0 },
    }

    const result = planCutPath(layout, profile({
      lead: { type: 'none', length: 0, angle: 0, placement: 'automatic' },
      pierce: { clearance: 0 },
      commonLine: {
        enabled: true,
        tolerance: 0.001,
        candidates: [{ firstContourId: 'first', secondContourId: 'second' }],
      },
    }))

    expect(result.valid).toBe(true)
    expect(result.plan!.actions.some((action) => action.kind === 'common-line')).toBe(true)
  })
})
