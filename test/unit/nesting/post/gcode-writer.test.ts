import { strict as assert } from 'node:assert'
import { GcodeWriter } from '../../../../src/nesting/post'

describe('GcodeWriter', () => {
  it('writes deterministic words, comments, numeric values, and negative zero', () => {
    const writer = new GcodeWriter({ precision: 3 })
    writer.beginLine(10).word('g', '01').word('X', -0).word('Y', 1.2).comment('ok').endLine()
    assert.equal(writer.toString(), 'N10 G01 X0 Y1.2 (ok)\n')
  })

  it('keeps trailing zeros off by default', () => {
    const writer = new GcodeWriter({ precision: 4 })
    writer.beginLine().word('X', 1.5).word('Y', 0).endLine()
    assert.equal(writer.toString(), 'X1.5 Y0\n')
  })

  it('writes fixed decimals when trailingZeros is on and never writes a negative zero', () => {
    const writer = new GcodeWriter({ precision: 4, trailingZeros: true })
    writer.beginLine().word('X', 1.5).word('Y', 0).word('Z', -63.8322).word('I', -0).word('J', -0.00004).endLine()
    assert.equal(writer.toString(), 'X1.5000 Y0.0000 Z-63.8322 I0.0000 J0.0000\n')
  })

  it('writes three fixed decimals', () => {
    const writer = new GcodeWriter({ precision: 3, trailingZeros: true })
    writer.beginLine().word('D', 80.767).word('E', 80).endLine()
    assert.equal(writer.toString(), 'D80.767 E80.000\n')
  })

  it('writes raw lines between built lines', () => {
    const writer = new GcodeWriter()
    writer.beginLine().word('G', '00').endLine()
    writer.line('#<_openslag>=1')
    writer.beginLine().word('M', '2')
    writer.line('o<endpos> call')
    assert.equal(writer.toString(), 'G00\n#<_openslag>=1\nM2\no<endpos> call\n')
  })
})
