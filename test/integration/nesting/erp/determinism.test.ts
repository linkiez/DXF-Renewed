import { expect } from 'expect'
import { firstValueFrom } from 'rxjs'
import { calculateErpNesting } from '../../../../src/nesting/erp/flow'

describe('ERP nesting determinism', () => {
  it('repeats the same layout and output digest for equal requests', async () => {
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

    const results = await Promise.all(
      Array.from({ length: 100 }, () => firstValueFrom(calculateErpNesting(request))),
    )

      const first = results[0]
      expect(results.every((result) => result.outputDigest.value === first.outputDigest.value)).toBe(true)
      expect(results.map((result) => result.layout)).toEqual(results.map((result) => first.layout))
      expect(results.map((result) => result.layout?.placements)).toEqual(
        results.map((result) => first.layout?.placements),
      )
      expect(results.map((result) => result.layout?.utilization)).toEqual(
        results.map((result) => first.layout?.utilization),
      )
      expect(results.map((result) => result.layout?.wasteArea)).toEqual(
        results.map((result) => first.layout?.wasteArea),
      )
  })
})
