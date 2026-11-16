import { strict as assert } from 'node:assert'
import { findCutChartEntry } from '../../../../../src/nesting/post/cutcharts/findCutChartEntry'
import { importCutChartTable } from '../../../../../src/nesting/post/cutcharts/importCutChartTable'
import { cutChartExcerpt } from '../../../../resources/post-references/cutchart-excerpt'

const table = importCutChartTable(cutChartExcerpt).table!

describe('findCutChartEntry', () => {
  it('returns exactly the matching row and its separation rule', () => {
    const found = findCutChartEntry(table, { material: 'MS', thickness: 6, class: '130Amp O2/Air' }, 'mm')
    assert.ok('entry' in found)
    if (!('entry' in found)) return
    assert.equal(found.entry.feed.value, 4035)
    assert.equal(found.entry.kerf.value, 1.81)
    assert.equal(found.entry.rowNumber, 2)
    assert.deepEqual(found.separation, { material: '*', thickness: 6, part: 4.8, plate: 4.8, pierce: 4.8 })
  })

  it('selects the true hole row by its toggle and by its class', () => {
    const found = findCutChartEntry(table, { material: 'MS', thickness: 8, class: '130Amp O2/Air (True Hole)', toggles: { trueHole: true } }, 'mm')
    assert.ok('entry' in found && found.entry.toggles.trueHole)
    const wrong = findCutChartEntry(table, { material: 'MS', thickness: 8, class: '130Amp O2/Air (True Hole)', toggles: { trueHole: false } }, 'mm')
    assert.ok('code' in wrong && wrong.code === 'CUTCHART_ABSENT')
  })

  it('reports an absent thickness or class and never uses a neighbour', () => {
    const thickness = findCutChartEntry(table, { material: 'MS', thickness: 7, class: '130Amp O2/Air' }, 'mm')
    assert.ok('code' in thickness && thickness.code === 'CUTCHART_ABSENT')
    assert.ok(thickness.message.includes('MS') && thickness.message.includes('7') && thickness.message.includes('130Amp O2/Air'))
    const cls = findCutChartEntry(table, { material: 'MS', thickness: 6, class: '200Amp O2/Air' }, 'mm')
    assert.ok('code' in cls && cls.code === 'CUTCHART_ABSENT')
  })

  it('returns a unit mismatch result and converts nothing', () => {
    const result = findCutChartEntry(table, { material: 'MS', thickness: 6, class: '130Amp O2/Air' }, 'in')
    assert.ok('code' in result && result.code === 'CUTCHART_UNIT_MISMATCH')
  })

  it('matches the thickness with EPSILON', () => {
    assert.ok('entry' in findCutChartEntry(table, { material: 'MS', thickness: 6 + 1e-9, class: '130Amp O2/Air' }, 'mm'))
  })

  it('has no separation when the table lacks the thickness rule', () => {
    const found = findCutChartEntry(table, { material: 'MS', thickness: 0.5, class: '30Amp O2/O2' }, 'mm')
    assert.ok('entry' in found)
    assert.equal(found.separation, undefined)
  })
})
