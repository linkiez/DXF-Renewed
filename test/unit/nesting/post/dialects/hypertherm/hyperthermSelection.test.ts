import { strict as assert } from 'node:assert'
import { hyperthermSelection } from '../../../../../../src/nesting/post/dialects/hypertherm/hyperthermSelection'

const ORDER = ['type', 'material', 'current', 'gas', 'thickness', 'surface']
const settings = { torchType: 34, materialType: 1, current: 130, shieldGas: 2, thickness: 29, cuttingSurface: 1, chartSource: 'table' }

describe('hyperthermSelection', () => {
  it('writes the selection codes in the vendor order, thickness before surface', () => {
    assert.deepEqual(hyperthermSelection(settings, ORDER).lines, [
      'G59 V502 F34', 'G59 V503 F1', 'G59 V504 F130', 'G59 V505 F2', 'G59 V507 F29', 'G59 V506 F1',
    ])
  })

  it('writes the cutting surface only when the settings have it', () => {
    const { cuttingSurface: _omit, ...without } = settings
    assert.deepEqual(hyperthermSelection(without, ORDER).lines.map((l) => l.split(' ')[1]), ['V502', 'V503', 'V504', 'V505', 'V507'])
  })

  it('writes the specific-material decimal without trailing zeros', () => {
    assert.equal(hyperthermSelection({ ...settings, materialType: 1.99 }, ORDER).lines[1], 'G59 V503 F1.99')
  })

  it('reports each missing required key', () => {
    for (const key of ['torchType', 'materialType', 'current', 'shieldGas', 'thickness']) {
      const { [key]: _omit, ...without } = settings as Record<string, string | number>
      const result = hyperthermSelection(without, ORDER)
      assert.equal(result.issues.filter((i) => i.code === 'PROCESS_SETTING_REQUIRED').length, 1, key)
      assert.ok(result.issues[0].message.includes(key), key)
    }
  })

  it('warns that hand-supplied settings were not verified against a cut chart', () => {
    const { chartSource: _omit, ...manual } = settings
    const issues = hyperthermSelection(manual, ORDER).issues
    assert.deepEqual(issues.map((i) => [i.code, i.severity]), [['CUTCHART_UNVERIFIED', 'warning']])
    assert.deepEqual(hyperthermSelection(settings, ORDER).issues, [])
  })
})
