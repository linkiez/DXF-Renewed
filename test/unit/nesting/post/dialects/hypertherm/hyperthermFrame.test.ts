import { strict as assert } from 'node:assert'
import { hyperthermEnding } from '../../../../../../src/nesting/post/dialects/hypertherm/hyperthermEnding'
import { hyperthermPreparation } from '../../../../../../src/nesting/post/dialects/hypertherm/hyperthermPreparation'
import { hyperthermProcessSelect } from '../../../../../../src/nesting/post/dialects/hypertherm/hyperthermProcessSelect'

describe('Hypertherm preparation, process select and ending', () => {
  it('writes the units, the absolute mode, the material comment and the controller preconditions', () => {
    const preconditions = ['EIA G59 code override must be enabled', 'Kerf override must be enabled']
    assert.deepEqual(hyperthermPreparation({ units: 'mm', materialComment: 'MS 6mm', preconditions }), [
      'G21', 'G90', '(MATERIAL : MS 6mm)', '(PRECONDITION: EIA G59 code override must be enabled)', '(PRECONDITION: Kerf override must be enabled)',
    ])
    assert.equal(hyperthermPreparation({ units: 'inch', preconditions: [] })[0], 'G20')
    assert.deepEqual(hyperthermPreparation({ units: 'inch', preconditions: [] }), ['G20', 'G90'])
  })

  it('writes the vendor True Hole comment first and the axis preset after the absolute mode', () => {
    assert.deepEqual(
      hyperthermPreparation({ units: 'mm', preconditions: [], trueHole: true, axisPreset: true }),
      ['(EMBEDDED HYPERTHERM PATENT-PENDING TRUE HOLE TECHNOLOGY)', 'G21', 'G90', 'G92 X0 Y0'],
    )
  })

  it('selects the station and the process, then ends with the station cancel and the end of program', () => {
    assert.deepEqual(hyperthermProcessSelect(1, 1), ['M37 T1', 'M36 T1'])
    assert.deepEqual(hyperthermEnding(), ['M19', 'M02'])
    for (const line of [...hyperthermProcessSelect(1, 1), ...hyperthermEnding()]) assert.equal(line, line.trimEnd())
  })
})
