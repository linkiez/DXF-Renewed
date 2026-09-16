import { strict as assert } from 'node:assert'
import { canonicalizeGcode } from '../../../../src/nesting/post'

describe('canonicalizeGcode', () => {
  it('normalizes line endings, trailing whitespace, and final newline only', () => {
    assert.equal(canonicalizeGcode('G00 X1  \r\nG01 X2\r'), 'G00 X1\nG01 X2\n')
  })
  it('preserves order, comments, and numeric tokens', () => {
    assert.equal(canonicalizeGcode('G01 X01.0\nG00 X1'), 'G01 X01.0\nG00 X1\n')
  })
})
