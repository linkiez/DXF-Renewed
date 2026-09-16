import { expect } from 'expect'
import type {
  CutAction,
  CutContour,
  CutLayout,
  CutPlan,
  CutPlanResult,
  CutProcessProfile,
} from '../../../../src/nesting/cutPath/types'
import type { Point2D } from '../../../../src/nesting/types'

const point: Point2D = { x: 0, y: 0 }

const contour: CutContour = {
  id: 'outer-1',
  partId: 'part-1',
  sheetId: 'sheet-1',
  shape: {
    id: 'shape-1',
    layer: 'CUT',
    vertices: [point, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, point],
    bbox: { minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10 },
    area: 100,
    perimeter: 40,
    centroid: { x: 5, y: 5 },
    allowedRotations: [0],
    kerf: 0,
    isHole: false,
  },
  placement: {
    shapeId: 'shape-1',
    x: 0,
    y: 0,
    rotation: 0,
    bbox: { minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10 },
  },
  isOuter: true,
}

const profile: CutProcessProfile = {
  sequence: { strategy: 'nearest-neighbour' },
  lead: { type: 'straight', length: 2, angle: 0, placement: 'outside' },
  pierce: { clearance: 1, smallHoleThreshold: 4 },
  tabs: { enabled: true, width: 1, count: 2 },
  overcut: { enabled: true, length: 0.5 },
  clearance: { contour: 1, tab: 1, keptMaterial: 1 },
  commonLine: { enabled: false, tolerance: 0.001 },
}

const action: CutAction = {
  kind: 'cut',
  points: [point],
  contourId: contour.id,
  partId: contour.partId,
}

const plan: CutPlan = {
  sheetId: 'sheet-1',
  actions: [action],
  stats: { cutLength: 10, rapidLength: 2, pierceCount: 1, tabCount: 0 },
  baselineRapidLength: 4,
  optimizedRapidLength: 2,
}

describe('cut-path public types', () => {
  it('composes layout, profile, actions, plan and structured result contracts', () => {
    const layout: CutLayout = {
      sheets: [{ id: 'sheet-1', kind: 'sheet', width: 100, height: 100 }],
      contours: [contour],
      startPoint: point,
    }
    const result: CutPlanResult = {
      valid: true,
      plan,
      problems: [],
      metrics: {
        baselineRapidLength: plan.baselineRapidLength,
        optimizedRapidLength: plan.optimizedRapidLength,
        improvementRatio: 0.5,
      },
    }

    expect(layout.contours[0]?.id).toBe('outer-1')
    expect(profile.sequence.strategy).toBe('nearest-neighbour')
    expect(result.plan?.stats.pierceCount).toBe(1)
  })

  it('supports every machine-independent action marker', () => {
    const kinds: CutAction['kind'][] = [
      'rapid',
      'pierce',
      'lead-in',
      'cut',
      'lead-out',
      'overcut',
      'tab',
      'end',
    ]

    expect(kinds).toHaveLength(8)
  })
})
