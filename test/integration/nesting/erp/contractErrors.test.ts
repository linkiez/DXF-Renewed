import { expect } from 'expect'
import { firstValueFrom } from 'rxjs'
import { calculateErpNesting } from '../../../../src/nesting/erp/flow'

describe('ERP contract errors', () => {
  it('rejects unsupported contract versions through the Observable error channel', async () => {
    await expect(
      firstValueFrom(
        calculateErpNesting({
          contractVersion: 99,
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
      ),
    ).rejects.toThrow()
  })

  it('reports malformed runtime input through the Observable error channel', async () => {
    const malformedRequest = null as never

    await expect(
      firstValueFrom(calculateErpNesting(malformedRequest)),
    ).rejects.toThrow('unsupported ERP contract version')
  })
})
