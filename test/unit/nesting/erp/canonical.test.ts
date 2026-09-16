import { expect } from 'expect'
import { canonicalize } from '../../../../src/nesting/erp/canonical'

describe('ERP canonical JSON', () => {
  it('sorts object keys recursively and excludes volatile fields', () => {
    const first = canonicalize({
      requestedAt: '2026-01-01T00:00:00Z',
      b: { z: 2, a: 1 },
      a: 1,
    })
    const second = canonicalize({
      a: 1,
      b: { a: 1, z: 2 },
      requestedAt: '2027-01-01T00:00:00Z',
    })

    expect(first).toBe(second)
  })

  it('rejects non-finite numbers', () => {
    expect(() => canonicalize({ value: Number.POSITIVE_INFINITY })).toThrow()
  })
})
