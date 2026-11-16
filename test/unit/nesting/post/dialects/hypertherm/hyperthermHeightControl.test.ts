import { strict as assert } from 'node:assert'
import { hyperthermHeightControl } from '../../../../../../src/nesting/post/dialects/hypertherm/hyperthermHeightControl'

const full = { arcVoltage: 127, pierceTime: 0.3, pierceHeightFactor: 200, cutHeight: 2.8, transferHeightFactor: 200 }

describe('hyperthermHeightControl', () => {
  it('writes the overrides in the variable order', () => {
    assert.deepEqual(hyperthermHeightControl(full, 'mm').lines, [
      'G59 V600 F127', 'G59 V601 F0.3', 'G59 V602 F200', 'G59 V603 F2.8', 'G59 V604 F200',
    ])
  })

  it('writes the optional delay and kerf detect time only when present', () => {
    const lines = hyperthermHeightControl({ ...full, cutHeightDelay: 0.5, kerfDetectTime: 3 }, 'mm').lines
    assert.deepEqual(lines.slice(-2), ['G59 V605 F0.5', 'G59 V606 F3'])
    assert.deepEqual(hyperthermHeightControl({}, 'mm').lines, [])
  })

  it('accepts the boundary values and rejects values outside the vendor range', () => {
    const edges = { arcVoltage: 10, pierceTime: 9, pierceHeightFactor: 400, cutHeight: 25.4, transferHeightFactor: 50, cutHeightDelay: 5, kerfDetectTime: 10 }
    assert.deepEqual(hyperthermHeightControl(edges, 'mm').issues, [])
    const cases: Array<[string, number, string]> = [
      ['arcVoltage', 350, 'V600'], ['arcVoltage', 9, 'V600'], ['pierceTime', 9.5, 'V601'], ['pierceHeightFactor', 49, 'V602'],
      ['cutHeight', 25.5, 'V603'], ['transferHeightFactor', 401, 'V604'], ['cutHeightDelay', 5.1, 'V605'], ['kerfDetectTime', -1, 'V606'],
    ]
    for (const [key, value, variable] of cases) {
      const issues = hyperthermHeightControl({ ...full, [key]: value }, 'mm').issues
      assert.equal(issues.length, 1, key)
      assert.equal(issues[0].code, 'HEIGHT_CONTROL_OUT_OF_RANGE')
      assert.ok(issues[0].message.includes(variable) && issues[0].message.includes(String(value)), key)
    }
  })

  it('writes nothing for a zero voltage, pierce time or height, as the vendor post does', () => {
    const zeros = { arcVoltage: 0, pierceTime: 0, pierceHeightFactor: 0, cutHeight: 0, transferHeightFactor: 0 }
    assert.deepEqual(hyperthermHeightControl(zeros, 'mm'), { lines: [], issues: [] })
    assert.deepEqual(hyperthermHeightControl({ ...zeros, cutHeightDelay: 0 }, 'mm').lines, ['G59 V605 F0'])
  })

  it('applies the cut height range in the program units', () => {
    assert.deepEqual(hyperthermHeightControl({ cutHeight: 1 }, 'inch').issues, [])
    assert.equal(hyperthermHeightControl({ cutHeight: 1.5 }, 'inch').issues.length, 1)
    assert.deepEqual(hyperthermHeightControl({ cutHeight: 1.5 }, 'mm').issues, [])
  })
})
