import { strict as assert } from 'node:assert'
import { generateMachineProgram } from '../../../../src/nesting/post'
import { importCutChartTable } from '../../../../src/nesting/post/cutcharts/importCutChartTable'
import { toMachineProfile } from '../../../../src/nesting/post/machine/toMachineProfile'
import { cutChartExcerpt, generatedCutChartRows } from '../../../resources/post-references/cutchart-excerpt'
import { approvedTalvi } from './machine/fixtures'
import { generatedPlan } from './reference-plan'

const worstOf = (runs: number, work: () => void): number => {
  let worst = 0
  for (let run = 0; run < runs; run++) {
    const start = process.hrtime.bigint()
    work()
    worst = Math.max(worst, Number(process.hrtime.bigint() - start) / 1e6)
  }
  return worst
}

describe('post-processing volume', function () {
  this.timeout(60_000)

  it('generates a 500-contour Talvi program in under 2 s (SC-008)', () => {
    const plan = generatedPlan(500)
    const profile = toMachineProfile(approvedTalvi(), { sheet: { width: 1500, height: 3000, margin: 0 } })
    let contours = 0
    const worst = worstOf(5, () => {
      contours = generateMachineProgram(plan, profile).gcode.split('\n').filter((l) => /^N\d{4}$/.test(l)).length
    })
    assert.equal(contours, 500)
    assert.ok(worst < 2000, `worst run ${worst.toFixed(0)} ms`)
  })

  it('imports a 7,000-row cut chart table in under 1 s and reports each unreadable row once (SC-010)', () => {
    const rows = generatedCutChartRows(6995)
    const broken = [3, 1500, 3000, 5000, 6900]
    const input = { ...cutChartExcerpt, rows: [...rows.map((row, i) => (broken.includes(i) ? { ...row, Feedrate: 'bad' } : row)), ...rows.slice(0, 5).map((row, i) => ({ ...row, Class: `extra-${i}` }))] }
    assert.equal(input.rows.length, 7000)
    let issues = 0
    const worst = worstOf(5, () => {
      issues = importCutChartTable(input).issues.length
    })
    assert.equal(issues, broken.length)
    assert.ok(worst < 1000, `worst run ${worst.toFixed(0)} ms`)
  })
})
