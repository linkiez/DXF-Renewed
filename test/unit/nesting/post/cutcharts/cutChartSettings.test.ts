import { strict as assert } from 'node:assert'
import { cutChartSettings } from '../../../../../src/nesting/post/cutcharts/cutChartSettings'
import { findCutChartEntry } from '../../../../../src/nesting/post/cutcharts/findCutChartEntry'
import { importCutChartTable } from '../../../../../src/nesting/post/cutcharts/importCutChartTable'
import { cutChartExcerpt } from '../../../../resources/post-references/cutchart-excerpt'

const table = importCutChartTable(cutChartExcerpt).table!
const entryOf = (query: Parameters<typeof findCutChartEntry>[1]) => {
  const found = findCutChartEntry(table, query, 'mm')
  if (!('entry' in found)) throw new Error('missing entry')
  return found.entry
}

describe('cutChartSettings', () => {
  it('turns an entry into the process settings of the Hypertherm processor', () => {
    assert.deepEqual(cutChartSettings(entryOf({ material: 'MS', thickness: 6, class: '130Amp O2/Air' })), {
      torchType: 34, materialType: 1, current: 130, shieldGas: 2, thickness: 29, cuttingSurface: 1,
      arcVoltage: 127, pierceTime: 0.3, pierceHeightFactor: 200, cutHeight: 2.8, transferHeightFactor: 200,
      cutHeightDelay: 0.1133085501858736, kerf: 1.81, feed: 4035, leadInFeed: 4035, trueHole: false, m50n: true, rt: true, hs: true, chartSource: 'table',
    })
  })

  it('leaves the cutting surface out when the entry has none', () => {
    const entry = entryOf({ material: 'MS', thickness: 6, class: '130Amp O2/Air' })
    const { surface: _omit, ...chart } = entry.chart
    assert.equal('cuttingSurface' in cutChartSettings({ ...entry, chart }), false)
  })
})
