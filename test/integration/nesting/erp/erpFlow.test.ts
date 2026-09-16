import { expect } from 'expect'
import { firstValueFrom } from 'rxjs'
import { calculateErpNesting } from '../../../../src/nesting/erp/flow'
import { erpNestingArtifactSchema } from '../../../../src/nesting/erp/schemas'

describe('ERP nesting contract', () => {
  it('emits one complete artifact for a valid request', async () => {
    const artifact = await firstValueFrom(
      calculateErpNesting({
        contractVersion: 1,
        correlation: { orderId: 'order-1', revisionId: 'rev-1', requestId: 'req-1' },
        job: {
          parts: [],
          stock: [],
          machine: { id: 'machine-1', revision: '1', capabilities: {} },
          processProfile: { id: 'profile-1', revision: '1', settings: {} },
          nesting: { edgeClearance: 0, partToPartClearance: 0 },
        },
        seed: 42,
      }),
    )

    expect(artifact.correlation.orderId).toBe('order-1')
    expect(artifact.snapshots.machine.id).toBe('machine-1')
    expect(artifact.inputDigest.algorithm).toBe('sha256')
    expect(artifact.outputDigest.algorithm).toBe('sha256')
    expect(erpNestingArtifactSchema.safeParse(artifact).success).toBe(true)
  })

  it('preserves overrides while excluding request timestamps from the input digest', async () => {
    const request = {
      contractVersion: 1,
      correlation: { orderId: 'order-1', revisionId: 'rev-1', requestId: 'req-1' },
      job: {
        parts: [],
        stock: [],
        machine: { id: 'machine-1', revision: '1', capabilities: {} },
        processProfile: { id: 'profile-1', revision: '1', settings: {} },
        nesting: { edgeClearance: 0, partToPartClearance: 0 },
      },
      seed: 42,
      overrides: { kerf: 1.2 },
      requestedAt: '2026-01-01T00:00:00.000Z',
    } as const

    const first = await firstValueFrom(calculateErpNesting(request))
    const second = await firstValueFrom(
      calculateErpNesting({ ...request, requestedAt: '2027-01-01T00:00:00.000Z' }),
    )

    expect(first.overrides).toEqual({ kerf: 1.2 })
    expect(first.inputDigest).toEqual(second.inputDigest)
  })
})
