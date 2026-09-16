import { expect } from 'expect'
import { canonicalize } from '../../../../src/nesting/erp/canonical'

describe('ERP contract immutability', () => {
  it('does not mutate caller-owned values during canonicalization', () => {
    const input = { b: { value: 2 }, a: 1 }
    const snapshot = structuredClone(input)

    canonicalize(input)

    expect(input).toEqual(snapshot)
  })
})
