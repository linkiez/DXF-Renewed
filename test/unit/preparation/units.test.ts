import assert from 'node:assert'
import { resolveUnit } from '../../../src/nesting/pro/partPrep/units'

describe('unit resolution', () => {
  it('defaults to mm when unit is absent', () => {
    const result = resolveUnit(undefined)
    assert.equal(result.ok, true)
    if (result.ok) assert.equal(result.unit, 'mm')
  })

  it('accepts declared mm', () => {
    assert.deepStrictEqual(resolveUnit('mm'), { ok: true, unit: 'mm' })
  })

  it('rejects other declared units', () => {
    assert.equal(resolveUnit('in').ok, false)
  })
})
