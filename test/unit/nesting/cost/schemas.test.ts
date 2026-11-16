import { expect } from 'expect'
import { costModelSchema, costRequestSchema } from '../../../../src/nesting/cost/schemas'
import type { CostRequest } from '../../../../src/nesting/cost/types'
import { completeModel, smallRequest } from './fixtures'

describe('cost/schemas', () => {
  it('accepts the complete model and a request typed as CostRequest', async () => {
    const request: CostRequest = await smallRequest()

    expect(costModelSchema.safeParse(completeModel()).success).toBe(true)
    expect(costRequestSchema.safeParse(request).success).toBe(true)
  })

  it('rejects a missing artifact, a missing model and a wrong contract version', async () => {
    const request = await smallRequest()

    expect(costRequestSchema.safeParse({ ...request, artifact: undefined }).success).toBe(false)
    expect(costRequestSchema.safeParse({ ...request, costModel: undefined }).success).toBe(false)
    expect(costModelSchema.safeParse({ ...completeModel(), contractVersion: 2 }).success).toBe(false)
  })

  it('rejects wrongly typed fields of the model', () => {
    expect(costModelSchema.safeParse({ ...completeModel(), geometryUnitsPerMeter: '1000' }).success).toBe(false)
    expect(costModelSchema.safeParse({ ...completeModel(), consumables: 'nozzle' }).success).toBe(false)
    expect(costModelSchema.safeParse({ ...completeModel(), rates: { cuttingPerHour: 60 } }).success).toBe(false)
  })

  it('reuses the artifact schema of the ERP contract', async () => {
    const request = await smallRequest()
    const broken = { ...request, artifact: { ...request.artifact, outputDigest: { algorithm: 'sha256', value: 'xyz' } } }

    expect(costRequestSchema.safeParse(broken).success).toBe(false)
  })
})
