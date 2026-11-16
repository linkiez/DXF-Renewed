import { strict as assert } from 'node:assert'
import { importCutChartTable } from '../../../../../src/nesting/post/cutcharts/importCutChartTable'
import { cutChartExcerpt, generatedCutChartRows } from '../../../../resources/post-references/cutchart-excerpt'

describe('importCutChartTable', () => {
  it('reads the unit marker', () => {
    assert.equal(importCutChartTable(cutChartExcerpt).table?.unit, 'mm')
    assert.equal(importCutChartTable({ ...cutChartExcerpt, unitMarker: 'in' }).table?.unit, 'in')
    for (const unitMarker of ['', 'cm', 'MM ']) {
      const result = importCutChartTable({ ...cutChartExcerpt, unitMarker })
      assert.equal(result.table, undefined, unitMarker)
      assert.equal(result.issues[0].code, 'CUTCHART_UNIT_MISSING')
    }
  })

  it('turns every readable row into one entry with its row number', () => {
    const { table } = importCutChartTable(cutChartExcerpt)
    assert.equal(table?.entries.length, 5)
    const entry = table?.entries[1]
    assert.equal(entry?.rowNumber, 2)
    assert.equal(entry?.material, 'MS')
    assert.equal(entry?.thickness, 6)
    assert.equal(entry?.class, '130Amp O2/Air')
    assert.deepEqual(entry?.feed, { base: 4035, percent: 100, value: 4035, leadIn: 4035 })
    assert.equal(entry?.kerf.value, 1.81)
    assert.deepEqual(entry?.chart, { type: 34, material: 1, current: 130, gas: 2, thickness: 29, surface: 1 })
    assert.equal(entry?.height.arcVoltage, 127)
    assert.equal(entry?.height.pierceTime, 0.3)
    assert.equal(entry?.height.cutHeight, 2.8)
    assert.equal(entry?.toggles.trueHole, false)
    assert.deepEqual(entry?.outputs, { v500: true, v600: true, m50n: true, rt: true, hs: true })
    assert.equal(table?.entries[2].toggles.trueHole, true)
  })

  it('reports an unreadable row once with its number and keeps the others', () => {
    const { issues } = importCutChartTable(cutChartExcerpt)
    const invalid = issues.filter((i) => i.code === 'CUTCHART_ROW_INVALID')
    assert.equal(invalid.length, 1)
    assert.equal(invalid[0].rowNumber, 6)
    assert.ok(invalid[0].message.includes('Feedrate'))
  })

  it('rejects a code that the code lists do not define and leaves the entry out', () => {
    const { issues, table } = importCutChartTable(cutChartExcerpt)
    const unknown = issues.filter((i) => i.code === 'CUTCHART_CODE_UNKNOWN')
    assert.equal(unknown.length, 1)
    assert.equal(unknown[0].rowNumber, 7)
    assert.ok(!table?.entries.some((e) => e.rowNumber === 7))
  })

  it('imports the separation rules and the table identity', () => {
    const { table } = importCutChartTable(cutChartExcerpt)
    assert.deepEqual(table?.separations[1], { material: '*', thickness: 6, part: 4.8, plate: 4.8, pierce: 4.8 })
    assert.equal(table?.software, 'Phoenix 9.761')
    assert.equal(table?.powerSupply, 'HPR260XDa')
  })

  it('does not mutate the input and is repeatable', () => {
    const frozen = JSON.parse(JSON.stringify(cutChartExcerpt))
    const first = importCutChartTable(frozen)
    assert.deepEqual(frozen, JSON.parse(JSON.stringify(cutChartExcerpt)))
    assert.deepEqual(importCutChartTable(frozen), first)
  })

  it('imports a large table', () => {
    assert.equal(importCutChartTable({ ...cutChartExcerpt, rows: generatedCutChartRows(200) }).table?.entries.length, 200)
  })
})
