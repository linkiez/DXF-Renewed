import { expect } from 'expect'
import { planCutPath } from '../../../../src/nesting'
import {
  basicLayout,
  contour,
  placementFor,
  profile,
  sheet,
  square,
} from './fixtures'

const problemCodes = (result: ReturnType<typeof planCutPath>): string[] =>
  result.problems.map((problem) => problem.code)

describe('cutPath/validate — actionable geometric validation', () => {
  it('reports out-of-bounds travel with a stable code and correction-oriented message', () => {
    const layout = basicLayout()
    layout.startPoint = { x: -1, y: 0 }

    const result = planCutPath(layout, profile())

    expect(result.valid).toBe(false)
    expect(problemCodes(result)).toContain('OUT_OF_BOUNDS')
    expect(result.problems.find((problem) => problem.code === 'OUT_OF_BOUNDS')!.message)
      .toMatch(/move|inside|bound/i)
  })

  it('reports a rapid crossing kept material instead of silently dropping the route', () => {
    const layout = basicLayout()
    layout.startPoint = { x: 0, y: 20 }

    const result = planCutPath(layout, profile({
      clearance: {
        contour: 0.1,
        tab: 0.1,
        keptMaterial: 0.1,
      },
    }))

    expect(result.valid).toBe(false)
    expect(problemCodes(result)).toContain('RAPID_OVER_PART')
  })

  it('reports invalid leads and over-wide tabs as structured problems', () => {
    const leadResult = planCutPath(basicLayout(), profile({
      lead: {
        type: 'straight',
        length: 100,
        angle: 0,
        placement: 'outside',
      },
    }))
    const tabResult = planCutPath(basicLayout(), profile({
      tabs: {
        enabled: true,
        width: 100,
        count: 1,
      },
    }))

    expect(leadResult.valid).toBe(false)
    expect(problemCodes(leadResult)).toContain('LEAD_CROSSES_GEOMETRY')
    expect(tabResult.valid).toBe(false)
    expect(problemCodes(tabResult)).toContain('TAB_TOO_WIDE')
    expect(leadResult.problems.every((problem) => problem.message.length > 10)).toBe(true)
    expect(tabResult.problems.every((problem) => problem.message.length > 10)).toBe(true)
  })

  it('reports a pierce point that violates configured clearance', () => {
    const first = square('first-shape', 10, 10, 5)
    const second = square('second-shape', 16, 10, 5)
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
      pierce: { clearance: 2 },
      sequence: { strategy: 'input' },
    }))

    expect(result.valid).toBe(false)
    expect(problemCodes(result)).toContain('ENTRY_INVALID')
    expect(result.problems.find((problem) => problem.code === 'ENTRY_INVALID')!.message)
      .toMatch(/pierce|clearance/i)
  })

  it('accepts a common-line candidate when contours share a verified edge', () => {
    const first = square('first-shape', 10, 10, 10)
    const second = square('second-shape', 20, 10, 10)
    const layout = basicLayout()
    layout.contours = [
      contour('first', 'part-1', first, placementFor(first, sheet.id), true),
      contour('second', 'part-2', second, placementFor(second, sheet.id), true),
    ]

    const result = planCutPath(layout, profile({
      commonLine: {
        enabled: true,
        tolerance: 0.001,
        candidates: [{ firstContourId: 'first', secondContourId: 'second' }],
      },
    }))

    expect(result.problems.some((problem) => problem.code === 'COMMON_LINE_REJECTED')).toBe(false)
  })

  it('rejects a common-line candidate without verified shared geometry', () => {
    const result = planCutPath(basicLayout(), profile({
      commonLine: {
        enabled: true,
        candidates: [{ firstContourId: 'outer', secondContourId: 'hole' }],
      },
    }))

    expect(result.valid).toBe(false)
    expect(problemCodes(result)).toContain('COMMON_LINE_REJECTED')
    expect(result.problems.find((problem) => problem.code === 'COMMON_LINE_REJECTED')!.message)
      .toMatch(/common|geometry|verify/i)
  })
})
