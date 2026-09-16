import { expect } from 'expect'
import { firstValueFrom } from 'rxjs'
import { calculateErpNesting } from '../../../../src/nesting/erp/flow'

describe('ERP statelessness', () => {
  it('does not mutate caller-owned requests', async () => {
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
    } as const
    const snapshot = structuredClone(request)

    await firstValueFrom(calculateErpNesting(request))

    expect(request).toEqual(snapshot)
  })
})
