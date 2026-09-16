import { expect } from 'expect'
import { digestCanonical } from '../../../../src/nesting/erp/digest'

describe('ERP SHA-256 digests', () => {
  it('returns the same digest for equivalent canonical input', async () => {
    const first = await digestCanonical({ b: 2, a: 1 })
    const second = await digestCanonical({ a: 1, b: 2 })

    expect(first).toEqual(second)
    expect(first.algorithm).toBe('sha256')
    expect(first.value).toMatch(/^[a-f0-9]{64}$/)
  })
})
