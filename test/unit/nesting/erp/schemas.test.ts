import { expect } from 'expect'
import {
  erpNestingRequestSchema,
  getErpNestingRequestSchema,
} from '../../../../src/nesting/erp/schemas'

const validShape = {
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
  allowedRotations: [0, 90],
  kerf: 0,
  isHole: false,
}

describe('ERP nesting contract schemas', () => {
  it('accepts a versioned request with required correlation and job data', () => {
    const result = erpNestingRequestSchema.safeParse({
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
    })

    expect(result.success).toBe(true)
  })

  it('rejects missing correlation fields and invalid scalar values', () => {
    const result = erpNestingRequestSchema.safeParse({
      contractVersion: 0,
      correlation: { orderId: '', revisionId: 'rev-1' },
      job: {},
      seed: Number.NaN,
    })

    expect(result.success).toBe(false)
  })

  it('rejects malformed nested parts and invalid nesting algorithms', () => {
    const result = erpNestingRequestSchema.safeParse({
      contractVersion: 1,
      correlation: { orderId: 'order-1', revisionId: 'rev-1', requestId: 'req-1' },
      job: {
        parts: [{ shape: { id: 'part-1' }, quantity: 1 }],
        stock: [{ id: 'sheet-1', kind: 'sheet', width: 100, height: 100 }],
        machine: { id: 'machine-1', revision: '1', capabilities: {} },
        processProfile: { id: 'profile-1', revision: '1', settings: {} },
        nesting: { edgeClearance: 0, partToPartClearance: 0, algorithm: 'invalid' },
      },
      seed: 42,
    })

    expect(result.success).toBe(false)
  })

  it('dispatches only supported contract versions', () => {
    expect(getErpNestingRequestSchema(1)).toBe(erpNestingRequestSchema)
    expect(getErpNestingRequestSchema(99)).toBeUndefined()
    expect(validShape.bbox.width).toBe(10)
  })
})
