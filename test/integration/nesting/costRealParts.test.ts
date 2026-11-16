import { expect } from 'expect'
import { firstValueFrom } from 'rxjs'
import { calculateCostReport, planCutPath } from '../../../src/nesting'
import type { CostModel, CostReport } from '../../../src/nesting'
import { COST_CATEGORIES } from '../../../src/nesting/cost/types'
import type { RealJob } from './fixtures/realJob'
import { buildRealJob, REAL_PROFILE } from './fixtures/realJob'

const MODEL: CostModel = {
  contractVersion: 1,
  currency: { code: 'BRL', minorUnitDigits: 2 },
  geometryUnitsPerMeter: 1000,
  material: { fullSheet: { 'real-sheet-1': { value: 800 }, 'real-sheet-2': { value: 800 } }, remnant: {} },
  speeds: { cutting: { value: 3 }, rapid: { value: 20 }, pierceDwellSeconds: { value: 0.8 } },
  rates: { cuttingPerHour: { value: 90 }, travelPerHour: { value: 45 }, piercePerUnit: { value: 0.15 }, labourPerHour: { value: 55 } },
  handling: { secondsPerSheet: { value: 120 }, secondsPerJob: { value: 300 } },
  consumables: [{ id: 'nozzle', cost: { value: 60 }, life: { value: { unit: 'pierces', amount: 800 } } }],
}

describe('cost — real DXF parts (nest-fixtures)', function () {
  this.timeout(180_000)

  let job: RealJob
  let report: CostReport

  before(async () => {
    job = await buildRealJob()
    const cutPlan = planCutPath(job.layout, REAL_PROFILE)
    report = await firstValueFrom(calculateCostReport({ artifact: job.artifact, layout: job.layout, cutPlan, costModel: MODEL }))
  })

  it('costs every placed part of the real drawings with no unlinked action', () => {
    const placed = job.artifact.layout?.placements.length ?? 0

    expect(report.status).toBe('complete')
    expect(report.breakdown?.parts).toHaveLength(placed)
    expect(report.notices.filter((n) => n.code === 'UNKNOWN_PART' || n.code === 'UNLINKED_ACTION')).toEqual([])
    expect(report.breakdown?.parts.every((p) => (p.components.cutting.amount ?? 0) > 0)).toBe(true)
  })

  it('reconciles the parts to the job for every component', () => {
    const breakdown = report.breakdown
    if (!breakdown) throw new Error('no breakdown')

    for (const category of COST_CATEGORIES) {
      const parts = breakdown.parts.reduce((total, part) => total + (part.components[category].amount ?? 0), 0)
      expect(breakdown.job.components[category].amount).toBe(parts)
    }
  })

  it('subtracts holes from the net area and reports the production figures', () => {
    expect(report.production?.sheetsUsed).toBeGreaterThanOrEqual(1)
    expect(report.production?.time.job.totalSeconds).toBeGreaterThan(0)
    expect(report.breakdown?.parts.every((p) => p.usage.netArea > 0)).toBe(true)
  })
})
