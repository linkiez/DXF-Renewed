import { expect } from 'expect'
import { firstValueFrom } from 'rxjs'
import { calculateErpNesting } from '../../../../src/nesting/erp/flow'

describe('ERP partial resources', () => {
  it('returns a partial artifact with explicit unplaced reasons when stock is unavailable', async () => {
    const artifact = await firstValueFrom(
      calculateErpNesting({
        contractVersion: 1,
        correlation: { orderId: 'order-1', revisionId: 'rev-1', requestId: 'req-1' },
        job: {
          parts: [{
            shape: {
              id: 'part-1',
              layer: 'CUT',
              vertices: [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
                { x: 0, y: 10 },
                { x: 0, y: 0 },
              ],
              bbox: { minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10 },
              area: 100,
              perimeter: 40,
              centroid: { x: 5, y: 5 },
              allowedRotations: [0],
              kerf: 0,
              isHole: false,
            },
            quantity: 1,
          }],
          stock: [{ id: 'sheet-1', kind: 'sheet', width: 5, height: 5 }],
          machine: { id: 'machine-1', revision: '1', capabilities: {} },
          processProfile: { id: 'profile-1', revision: '1', settings: {} },
          nesting: { edgeClearance: 0, partToPartClearance: 0 },
        },
        seed: 42,
      }),
    )

    expect(artifact.status).toBe('partial')
    expect(artifact.unplaced).toEqual([{
      itemId: 'part-1',
      quantity: 1,
      reasonCode: 'UNPLACED',
      reason: 'no feasible placement on the supplied stock within the clearances and permitted rotations',
    }])
  })
})
