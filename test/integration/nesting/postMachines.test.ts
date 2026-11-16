import { expect } from 'expect'
import { generateMachineProgram, getMachineConfiguration, planCutPath, toMachineProfile } from '../../../src/nesting'
import type { CutPlan, MachineConfiguration } from '../../../src/nesting'
import { checkTalviStructure } from '../../unit/nesting/post/dialects/talviStructure'
import { approveAll } from '../../unit/nesting/post/machine/fixtures'
import { cutChartExcerpt } from '../../resources/post-references/cutchart-excerpt'
import { cutChartSettings, findCutChartEntry, importCutChartTable } from '../../../src/nesting'
import { buildRealJob, REAL_PROFILE } from './fixtures/realJob'

/** The host supplies the process attributes; the nest plan carries none. */
const annotate = (plan: CutPlan): CutPlan => ({
  ...plan,
  actions: plan.actions.map((action) =>
    action.kind === 'rapid' || action.kind === 'end'
      ? action
      : { ...action, metadata: { ...action.metadata, quality: 'standard', kerfSide: 'left', feed: 1000 } }),
})

const extents = (plan: CutPlan): { width: number; height: number } => {
  const points = plan.actions.flatMap((a) => a.points)
  return { width: Math.ceil(Math.max(...points.map((p) => p.x))) + 10, height: Math.ceil(Math.max(...points.map((p) => p.y))) + 10 }
}

describe('post-processing of the real drawings on the three machines', function () {
  this.timeout(180_000)
  let plans: CutPlan[]

  before(async () => {
    const job = await buildRealJob()
    const result = planCutPath(job.layout, REAL_PROFILE)
    plans = (result.plans ?? (result.plan ? [result.plan] : [])).map(annotate)
  })

  const approved = (id: string, envelope: MachineConfiguration['envelope']['value']): MachineConfiguration => {
    const config = approveAll(getMachineConfiguration(id) as MachineConfiguration)
    return { ...config, envelope: { ...config.envelope, value: envelope } }
  }

  it('writes a Talvi program inside the envelope that passes the structure checks', () => {
    expect(plans.length).toBeGreaterThan(0)
    for (const plan of plans) {
      const { width, height } = extents(plan)
      const base = approved('talvi-6000w', { minX: -width, maxX: 0, minY: 0, maxY: height })
      const configuration = {
        ...base,
        processMapping: { value: { key: 'quality', entries: [{ value: 'standard', p: 1, q: 1 }], omitQ: 'never' as const }, source: base.rapidFeed.source },
      }
      const program = generateMachineProgram(plan, toMachineProfile(configuration, { sheet: { width, height, margin: 0 } }))
      expect(program.validationIssues.filter((i) => i.code !== 'EXPECTED_OUTPUT_REQUIRED')).toEqual([])
      expect(program.gcode).toContain('N0001')
      expect(checkTalviStructure(program.gcode)).toEqual([])
    }
  })

  it('writes a GloryStar program without issues', () => {
    for (const plan of plans) {
      const { width, height } = extents(plan)
      const configuration = approved('glorystar-gs3015', { minX: 0, maxX: height, minY: 0, maxY: width })
      const program = generateMachineProgram(plan, toMachineProfile(configuration, {
        sheet: { width, height, margin: 0 },
        processSettings: { feed: 3000, piercingType: 1, thickness: 6 },
      }))
      expect(program.validationIssues.filter((i) => i.code !== 'EXPECTED_OUTPUT_REQUIRED')).toEqual([])
      expect(program.gcode).toContain('G800,')
      expect(program.gcode).toContain('N1')
    }
  })

  it('writes a Hypertherm program from settings looked up in the cut chart excerpt', () => {
    const table = importCutChartTable(cutChartExcerpt).table
    const found = table ? findCutChartEntry(table, { material: 'MS', thickness: 6, class: '130Amp O2/Air' }, 'mm') : undefined
    expect(found && 'entry' in found).toBe(true)
    const settings = found && 'entry' in found ? cutChartSettings(found.entry) : {}
    for (const plan of plans) {
      const { width, height } = extents(plan)
      const configuration = approved('hypertherm-edge-pro-hpr400xda', { minX: 0, maxX: width, minY: 0, maxY: height })
      const program = generateMachineProgram(plan, toMachineProfile(configuration, { sheet: { width, height, margin: 0 }, processSettings: settings }))
      expect(program.validationIssues.filter((i) => i.code !== 'EXPECTED_OUTPUT_REQUIRED')).toEqual([])
      const lines = program.gcode.split('\n')
      expect(lines.filter((l) => l.startsWith('M07')).length).toBeGreaterThan(0)
      expect(lines.filter((l) => l.startsWith('M07')).length).toBe(lines.filter((l) => l.startsWith('M08')).length)
    }
  })
})
