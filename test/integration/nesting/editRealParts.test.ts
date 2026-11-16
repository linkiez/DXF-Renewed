import { expect } from 'expect'
import { firstValueFrom, toArray } from 'rxjs'
import { planCutPath } from '../../../src/nesting'
import type { CostModel } from '../../../src/nesting'
import { buildEditedArtifact } from '../../../src/nesting/edit/buildEditedArtifact'
import { commitEdit } from '../../../src/nesting/edit/commitEdit'
import { compareLayouts } from '../../../src/nesting/edit/compareLayouts'
import { createEditState } from '../../../src/nesting/edit/createEditState'
import { judgePlacement } from '../../../src/nesting/edit/judgePlacement'
import { markComputed } from '../../../src/nesting/edit/markComputed'
import { originalResults } from '../../../src/nesting/edit/originalResults'
import { recomputeEdited } from '../../../src/nesting/edit/recomputeEdited'
import type { CandidateEdit, EditState } from '../../../src/nesting/edit/types'
import { erpNestingArtifactSchema } from '../../../src/nesting/erp/schemas'
import type { CutRiskProfile } from '../../../src/nesting/risk/types'
import type { RealJob } from './fixtures/realJob'
import { buildRealJob, REAL_PROFILE } from './fixtures/realJob'

const COST: CostModel = {
  contractVersion: 1,
  currency: { code: 'BRL', minorUnitDigits: 2 },
  geometryUnitsPerMeter: 1000,
  material: { fullSheet: { 'real-sheet-1': { value: 800 }, 'real-sheet-2': { value: 800 } }, remnant: {} },
  speeds: { cutting: { value: 3 }, rapid: { value: 20 }, pierceDwellSeconds: { value: 0.8 } },
  rates: { cuttingPerHour: { value: 90 }, travelPerHour: { value: 45 }, piercePerUnit: { value: 0.15 }, labourPerHour: { value: 55 } },
  handling: { secondsPerSheet: { value: 120 }, secondsPerJob: { value: 300 } },
  consumables: [{ id: 'nozzle', cost: { value: 60 }, life: { value: { unit: 'pierces', amount: 800 } } }],
}

const RISK: CutRiskProfile = {
  contractVersion: 1,
  geometryUnitsPerMeter: 1000,
  speeds: { cutting: { value: 3 }, rapid: { value: 20 }, pierceDwellSeconds: { value: 0.8 } },
  heat: { radius: { value: 0.05 }, windowSeconds: { value: 60 }, maxCutLength: { value: 0.4 } },
  web: { minimum: { value: 0.002 } },
  loosePart: { maxArea: { value: 0.0005 } },
  headStrike: { clearance: { value: 0.004 } },
  criticalFactor: { value: 1.5 },
}

const STEPS = [2, -2, 4, -4]

const firstValidMove = (state: EditState): CandidateEdit => {
  for (const key of state.working.order) {
    for (const delta of STEPS.flatMap((d) => [{ dx: d, dy: 0 }, { dx: 0, dy: d }])) {
      const candidate: CandidateEdit = { partKey: key, kind: 'move', delta }
      if (judgePlacement(state, candidate).valid) return candidate
    }
  }
  throw new Error('no valid move found on the real job')
}

describe('edit — real DXF parts (nest-fixtures)', function () {
  this.timeout(180_000)

  let job: RealJob
  let state: EditState

  before(async () => {
    job = await buildRealJob()
    const cutPlan = planCutPath(job.layout, REAL_PROFILE)
    state = createEditState({ artifact: job.artifact, layout: job.layout, cutPlan, constraints: { allowedRotations: [0, 90, 180, 270] } }).state as EditState
  })

  it('judges a zero move of every placed part of the real job valid, the way the nesting placed them (SC-002)', () => {
    expect(state.working.order.length).toBeGreaterThan(4)
    for (const key of state.working.order) {
      const verdict = judgePlacement(state, { partKey: key, kind: 'move', delta: { dx: 0, dy: 0 } })
      expect({ key, violations: verdict.violations.map((v) => v.code) }).toEqual({ key, violations: [] })
    }
  })

  it('refuses a position far outside the sheet and never applies it', () => {
    const key = state.working.order[0]

    const result = commitEdit(state, { partKey: key, kind: 'move', delta: { dx: 1e6, dy: 0 } })

    expect(result.state).toBe(state)
    expect(result.verdict.violations.map((v) => v.code)).toContain('OUTSIDE_USABLE_AREA')
  })

  it('edits one part, recomputes plan, cost and risk, compares with the original and builds a traceable result', async () => {
    const candidate = firstValidMove(state)
    const edited = commitEdit(state, candidate).state
    expect(edited.freshness).toEqual({ plan: 'outdated', cost: 'outdated', validation: 'outdated', risk: 'outdated' })

    const steps = await firstValueFrom(recomputeEdited({ state: edited, processProfile: REAL_PROFILE, costModel: COST, riskProfile: RISK }).pipe(toArray()))

    expect(steps.map((s) => [s.step, s.status])).toEqual([['plan', 'current'], ['cost', 'current'], ['risk', 'current']])
    let current = edited
    for (const step of steps) current = markComputed(current, step.step, step.revision).state
    expect(current.freshness.plan).toBe('current')
    expect(current.freshness.cost).toBe('current')
    expect(current.freshness.risk).toBe('current')

    const original = originalResults({ ...state.input }, COST, RISK)
    const cost = steps[1] as Extract<typeof steps[number], { step: 'cost' }>
    const risk = steps[2] as Extract<typeof steps[number], { step: 'risk' }>
    const summary = compareLayouts({ state: current, original, edited: { production: cost.result?.production, breakdown: cost.result?.breakdown, risk: risk.result } })
    expect(summary.invalidParts).toEqual({ before: 0, after: 0, delta: 0 })
    expect(summary.notices).toEqual([])

    const result = await firstValueFrom(buildEditedArtifact(edited))
    expect(erpNestingArtifactSchema.safeParse(result.artifact).success).toBe(true)
    expect(result.artifact.outputDigest).not.toEqual(job.artifact.outputDigest)
    expect(result.edit.originalOutputDigest).toEqual(job.artifact.outputDigest)
    expect(result.edit.log.map((entry) => entry.partKey)).toEqual([candidate.partKey])
    const again = await firstValueFrom(buildEditedArtifact(edited))
    expect(again).toEqual(result)
  })
})
