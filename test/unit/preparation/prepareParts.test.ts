import assert from 'node:assert'
import { prepareParts } from '../../../src/nesting/pro/partPrep/index'
import { fixture, deepEqual } from './helpers'

const dxf = fixture('arrayed-holes.dxf')
const options = { tolerance: 0.01, cutWidthAllowance: 0 }

describe('prepareParts pipeline', () => {
  it('returns the contract result shape', () => {
    const result = prepareParts(dxf, options)
    assert.ok(Array.isArray(result.parts))
    assert.ok(Array.isArray(result.issues))
    assert.equal(result.unit, 'mm')
  })

  it('rejects an unsupported declared unit with no parts', () => {
    const result = prepareParts(dxf, { ...options, unit: 'in' })
    assert.equal(result.parts.length, 0)
    assert.ok(result.issues.some((issue) => issue.code === 'UNSUPPORTED_UNIT'))
  })

  it('tags every boundary with its depth and source', () => {
    const result = prepareParts(dxf, options)
    for (const part of result.parts) {
      assert.equal(part.outer.depth, 0)
      assert.equal(part.outer.classification, 'outer')
      assert.ok(part.outer.source.handle.length > 0)
      for (const hole of part.holes) {
        assert.ok(hole.depth % 2 === 1)
        assert.ok(hole.source.handle.length > 0)
      }
      for (const island of part.islands) {
        assert.ok(island.depth % 2 === 0 && island.depth >= 2)
        assert.ok(island.source.handle.length > 0)
      }
    }
  })

  it('is deterministic across 100 runs', () => {
    const first = prepareParts(dxf, options)
    for (let i = 0; i < 99; i++) {
      deepEqual(prepareParts(dxf, options), first)
    }
  })
})
