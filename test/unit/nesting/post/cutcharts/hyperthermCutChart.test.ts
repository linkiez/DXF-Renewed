import { strict as assert } from 'node:assert'
import { generateMachineProgram } from '../../../../../src/nesting/post'
import { cutChartSettings } from '../../../../../src/nesting/post/cutcharts/cutChartSettings'
import { findCutChartEntry } from '../../../../../src/nesting/post/cutcharts/findCutChartEntry'
import { importCutChartTable } from '../../../../../src/nesting/post/cutcharts/importCutChartTable'
import { toMachineProfile } from '../../../../../src/nesting/post/machine/toMachineProfile'
import { cutChartExcerpt } from '../../../../resources/post-references/cutchart-excerpt'
import { approvedHypertherm } from '../machine/fixtures'
import { referencePlan } from '../reference-plan'

const table = importCutChartTable(cutChartExcerpt).table!
const found = findCutChartEntry(table, { material: 'MS', thickness: 6, class: '130Amp O2/Air' }, 'mm')
const settings = 'entry' in found ? cutChartSettings(found.entry) : {}
const program = (processSettings: Record<string, boolean | number | string>) =>
  generateMachineProgram(
    referencePlan({ metadata: { kerfSide: 'left' } }),
    toMachineProfile(approvedHypertherm(), { sheet: { width: 1500, height: 3000, margin: 0 }, processSettings }),
  )

describe('Hypertherm program from a cut chart entry', () => {
  it('carries every code and height control value of the row and no unverified warning', () => {
    const result = program(settings)
    const lines = result.gcode.split('\n')
    for (const expected of ['G59 V502 F34', 'G59 V503 F1', 'G59 V504 F130', 'G59 V505 F2', 'G59 V507 F29',
      'G59 V600 F127', 'G59 V601 F0.3', 'G59 V602 F200', 'G59 V603 F2.8', 'G59 V604 F200', 'G43 X1.81', 'F4035']) {
      assert.ok(lines.includes(expected), expected)
    }
    assert.ok(!lines.includes('G59 V506 F1'))
    assert.ok(!result.validationIssues.some((i) => i.code === 'CUTCHART_UNVERIFIED'))
  })

  it('warns when the same values are typed by hand', () => {
    const { chartSource: _omit, ...manual } = settings as Record<string, boolean | number | string>
    assert.ok(program(manual).validationIssues.some((i) => i.code === 'CUTCHART_UNVERIFIED'))
  })
})
