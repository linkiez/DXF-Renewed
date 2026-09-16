import { strict as assert } from 'node:assert'
import { GcodeWriter } from '../../../../src/nesting/post'

describe('GcodeWriter', () => {
  it('writes deterministic words, comments, numeric values, and negative zero', () => {
    const writer = new GcodeWriter({ precision: 3 })
    writer.beginLine(10).word('g', '01').word('X', -0).word('Y', 1.2).comment('ok').endLine()
    assert.equal(writer.toString(), 'N10 G01 X0 Y1.2 (ok)\n')
  })
})
