import { expect } from 'expect'
import { buildProductionReport } from '../../../../src/nesting/cost/buildProductionReport'
import { collectUsage } from '../../../../src/nesting/cost/collectUsage'
import type { CostRequest } from '../../../../src/nesting/cost/types'
import { completeModel, layoutOnlyRequest, partialRequest, smallRequest, withoutField } from './fixtures'

const report = (request: CostRequest) => buildProductionReport(request, collectUsage(request))

describe('cost/buildProductionReport', () => {
  it('states sheets used, and yield, waste and total area exactly as supplied by the artifact', async () => {
    const request = await smallRequest()
    const production = report(request)

    expect(production.sheetsUsed).toBe(2)
    expect(production.yield).toBe(request.artifact.layout?.utilization)
    expect(production.wasteArea).toBe(request.artifact.layout?.wasteArea)
    expect(production.totalArea).toBe(request.artifact.layout?.totalArea)
  })

  it('counts only sheets that have at least one placed part', async () => {
    const request = await smallRequest()
    const layout = request.artifact.layout
    if (!layout) throw new Error('fixture without layout')
    const onlyFirst = { ...request.artifact, layout: { ...layout, placements: layout.placements.filter((p) => p.sheetId === 'sheet-1') } }

    expect(report({ ...request, artifact: onlyFirst }).sheetsUsed).toBe(1)
  })

  it('reports cutting, travel, pierce and handling time per sheet and for the job', async () => {
    const production = report(await smallRequest())
    const [first, second] = production.time.sheets

    expect(first.sheetId).toBe('sheet-1')
    expect(first.cuttingSeconds).toBeGreaterThan(0)
    expect(first.travelSeconds).toBeGreaterThan(0)
    expect(first.pierceSeconds).toBeGreaterThan(0)
    expect(first.handlingSeconds).toBe(60)
    expect(first.totalSeconds).toBeCloseTo((first.cuttingSeconds as number) + (first.travelSeconds as number) + (first.pierceSeconds as number) + 60)
    expect(production.time.job.cuttingSeconds).toBeCloseTo((first.cuttingSeconds as number) + (second.cuttingSeconds as number))
    expect(production.time.job.handlingSeconds).toBe(2 * 60 + 120)
    expect(production.time.job.totalSeconds).toBeCloseTo((first.totalSeconds as number) + (second.totalSeconds as number) + 120)
  })

  it('gives null where a time cannot be calculated', async () => {
    const production = report(await smallRequest(withoutField(completeModel(), 'speeds.cutting')))

    expect(production.time.job.cuttingSeconds).toBeNull()
    expect(production.time.job.totalSeconds).toBeNull()
    expect(production.time.job.travelSeconds).not.toBeNull()
    expect(production.time.sheets[0].cuttingSeconds).toBeNull()
  })

  it('gives null cut-dependent times when there is no cut plan, keeping handling', async () => {
    const production = report(await layoutOnlyRequest())

    expect(production.time.job.cuttingSeconds).toBeNull()
    expect(production.time.job.travelSeconds).toBeNull()
    expect(production.time.job.pierceSeconds).toBeNull()
    expect(production.time.job.totalSeconds).toBeNull()
    expect(production.time.job.handlingSeconds).toBe(240)
  })

  it('lists unplaced items with their reasons and never as sheets used', async () => {
    const production = report(await partialRequest())

    expect(production.unplaced).toEqual([{ itemId: 'part-9', quantity: 1, reasonCode: 'UNPLACED', reason: 'Não cabe em nenhuma chapa' }])
    expect(production.sheetsUsed).toBe(2)
  })

  it('gives null handling when the handling times are not supplied', async () => {
    const production = report(await smallRequest(withoutField(completeModel(), 'handling.secondsPerSheet')))

    expect(production.time.sheets[0].handlingSeconds).toBeNull()
    expect(production.time.sheets[0].totalSeconds).toBeNull()
  })
})
