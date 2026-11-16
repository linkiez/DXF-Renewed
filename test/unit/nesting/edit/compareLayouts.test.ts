import { expect } from 'expect'
import { commitEdit } from '../../../../src/nesting/edit/commitEdit'
import { compareLayouts } from '../../../../src/nesting/edit/compareLayouts'
import { createEditState } from '../../../../src/nesting/edit/createEditState'
import type { EditState } from '../../../../src/nesting/edit/types'
import type { RiskResult } from '../../../../src/nesting/risk/types'
import { editFixture } from './fixtures'

const stateOf = async (): Promise<EditState> => createEditState((await editFixture()).input).state as EditState
const edit = { partKey: 'part-A#0', kind: 'move' as const, delta: { dx: 3, dy: 3 } }

const risk = (counts: Partial<Record<string, number>>): RiskResult => ({
  status: 'assessed', indicative: true, rules: [], freedMoments: [], notices: [],
  findings: Object.entries(counts).flatMap(([category, count]) => Array.from({ length: count ?? 0 }, (_, index) => ({
    id: `${category}${index}`, category: category as 'heat', severity: 'warning' as const, sheetId: 'sheet-1',
    measured: 1, limit: 1, unit: 'm', message: 'm', mitigation: 'm',
  }))),
})
const production = (seconds: number) => ({
  sheetsUsed: 1, yield: 1, wasteArea: 0, totalArea: 1, unplaced: [],
  time: { job: { cuttingSeconds: 1, travelSeconds: 1, pierceSeconds: 1, handlingSeconds: 0, totalSeconds: seconds }, sheets: [] },
})

describe('edit/compareLayouts', () => {
  it('gives zero deltas for an empty log and counts no invalid part in a valid layout', async () => {
    const state = await stateOf()

    const summary = compareLayouts({ state, original: {}, edited: {} })

    expect(summary.invalidParts).toEqual({ before: 0, after: 0, delta: 0 })
  })

  it('reports the cut time, the cost and the risk counts before, after and as a difference', async () => {
    const state = (await stateOf())
    const edited = commitEdit(state, edit).state
    const done = { ...edited, freshness: { plan: 'current', cost: 'current', validation: 'current', risk: 'current' } as const }

    const summary = compareLayouts({
      state: done,
      original: { production: production(100), risk: risk({ heat: 3, 'thin-web': 1 }) },
      edited: { production: production(90), risk: risk({ heat: 1 }) },
    })

    expect(summary.cutSeconds).toEqual({ before: 100, after: 90, delta: -10 })
    expect(summary.risk.heat).toEqual({ before: 3, after: 1, delta: -2 })
    expect(summary.risk['thin-web']).toEqual({ before: 1, after: 0, delta: -1 })
    expect(summary.risk['head-strike']).toEqual({ before: 0, after: 0, delta: 0 })
  })

  it('reports an outdated or unavailable side as null with a notice, never as a number', async () => {
    const state = commitEdit(await stateOf(), edit).state

    const summary = compareLayouts({
      state,
      original: { production: production(100), risk: risk({ heat: 2 }) },
      edited: { production: production(90), risk: risk({ heat: 1 }) },
    })

    expect(summary.cutSeconds).toEqual({ before: 100, after: null, delta: null })
    expect(summary.risk.heat).toEqual({ before: 2, after: null, delta: null })
    expect(summary.notices.map((n) => n.code)).toEqual(['FIGURE_OUTDATED', 'FIGURE_OUTDATED', 'FIGURE_OUTDATED'])
  })

  it('counts the parts that violate a rule in the original and in the edited layout', async () => {
    const fixture = await editFixture()
    const layout = fixture.artifact.layout as NonNullable<typeof fixture.artifact.layout>
    const overlapped = layout.placements.map((p) => (p.shapeId === 'part-B' ? { ...p, x: 25, bbox: { ...p.bbox, minX: 25, maxX: 45 }, transformedVertices: p.transformedVertices?.map((v) => ({ ...v, x: v.x - 15 })) } : p))
    const input = { ...fixture.input, artifact: { ...fixture.artifact, layout: { ...layout, placements: overlapped } } }
    const state = createEditState(input).state as EditState
    const fixed = commitEdit(state, { partKey: 'part-B#0', kind: 'move', delta: { dx: 15, dy: 0 } }).state

    const summary = compareLayouts({ state: fixed, original: {}, edited: {} })

    expect(summary.invalidParts.before).toBe(2)
    expect(summary.invalidParts.after).toBe(0)
    expect(summary.invalidParts.delta).toBe(-2)
  })
})
