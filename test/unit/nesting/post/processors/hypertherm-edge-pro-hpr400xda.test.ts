import { strict as assert } from 'node:assert'
import '../../../../../src/nesting/post'
import { generateMachineProgram } from '../../../../../src/nesting/post'
import { toMachineProfile } from '../../../../../src/nesting/post/machine/toMachineProfile'
import { hyperthermEdgeProHpr400xda } from '../../../../../src/nesting/post/processors/hypertherm-edge-pro-hpr400xda'
import { approvedHypertherm, hyperthermSettings, withClassification } from '../machine/fixtures'
import { referencePlan } from '../reference-plan'
import type { CutPlan } from '../../../../../src/nesting/cutPath'

const sheet = { width: 1500, height: 3000, margin: 0 }
const plan = () => referencePlan({ metadata: { kerfSide: 'left' } })
const profile = (configuration = approvedHypertherm(), settings: Record<string, boolean | number | string> = hyperthermSettings) =>
  toMachineProfile(configuration, { sheet, processSettings: settings })
const issues = (p: CutPlan, configuration = approvedHypertherm(), settings: Record<string, boolean | number | string> = hyperthermSettings) =>
  hyperthermEdgeProHpr400xda.validate(p, { profile: profile(configuration, settings), linearizedPlan: p })

describe('hypertherm-edge-pro-hpr400xda processor validate', () => {
  it('has the registered identity', () => {
    assert.equal(hyperthermEdgeProHpr400xda.id, 'hypertherm-edge-pro-hpr400xda')
    assert.equal(hyperthermEdgeProHpr400xda.revision, 'edge-connect-809550-6')
    assert.equal(hyperthermEdgeProHpr400xda.machineKind, 'plasma')
  })

  it('has no issue for the approved configuration and table settings', () => {
    assert.deepEqual(issues(plan()), [])
  })

  it('blocks the release of every non-approved critical value, so the shipped configuration is never releasable', () => {
    const changed = withClassification(approvedHypertherm(), 'frame', 'inferred')
    assert.equal(issues(plan(), changed).filter((i) => i.code === 'UNAPPROVED_VALUE').length, 1)
  })

  it('reports a missing configuration without throwing', () => {
    const bare = { ...profile(), configuration: undefined }
    assert.deepEqual(hyperthermEdgeProHpr400xda.validate(plan(), { profile: bare, linearizedPlan: plan() }).map((i) => i.code), ['CONFIG_FIELD_MISSING'])
    assert.equal(hyperthermEdgeProHpr400xda.emit(plan(), { profile: bare, linearizedPlan: plan() }), '')
    const program = generateMachineProgram(plan(), bare)
    assert.equal(program.gcode, '')
    assert.ok(program.validationIssues.some((i) => i.code === 'CONFIG_FIELD_MISSING'))
  })

  it('reports each missing required setting, an out-of-range override, a tab and an empty plan', () => {
    const { current: _omit, ...withoutCurrent } = hyperthermSettings as Record<string, boolean | number | string>
    assert.ok(issues(plan(), approvedHypertherm(), withoutCurrent).some((i) => i.code === 'PROCESS_SETTING_REQUIRED' && i.message.includes('current')))
    assert.ok(issues(plan(), approvedHypertherm(), { ...hyperthermSettings, arcVoltage: 350 }).some((i) => i.code === 'HEIGHT_CONTROL_OUT_OF_RANGE'))
    const p = plan()
    const withTab: CutPlan = { ...p, actions: [p.actions[0], p.actions[1], { kind: 'tab', points: [{ x: 1, y: 1 }] }, ...p.actions.slice(2)] }
    assert.ok(issues(withTab).some((i) => i.code === 'ACTION_UNSUPPORTED'))
    assert.ok(issues({ ...p, actions: [] }).some((i) => i.code === 'EMPTY_PROGRAM'))
  })

  it('reports an overflow of the envelope with the contour and the axis', () => {
    const narrow = { ...approvedHypertherm(), envelope: { ...approvedHypertherm().envelope, value: { minX: 0, maxX: 200, minY: 0, maxY: 3657.6 } } }
    const found = issues(plan(), narrow).find((i) => i.code === 'OUT_OF_ENVELOPE')
    assert.ok(found?.contourId)
    assert.ok(found?.message.includes('X'))
  })

  it('does not mutate the plan or the configuration', () => {
    const p = Object.freeze(plan()) as CutPlan
    const configuration = Object.freeze(approvedHypertherm())
    assert.doesNotThrow(() => hyperthermEdgeProHpr400xda.emit(p, { profile: profile(configuration), linearizedPlan: p }))
  })
})
