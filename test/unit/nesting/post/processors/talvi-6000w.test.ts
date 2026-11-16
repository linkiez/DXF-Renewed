import { strict as assert } from 'node:assert'
import '../../../../../src/nesting/post'
import { generateMachineProgram } from '../../../../../src/nesting/post'
import { talvi6000w } from '../../../../../src/nesting/post/processors/talvi-6000w'
import { toMachineProfile } from '../../../../../src/nesting/post/machine/toMachineProfile'
import { talvi6000wConfiguration } from '../../../../../src/nesting/post/machine/talvi6000w'
import { approvedTalvi, withClassification } from '../machine/fixtures'
import { referencePlan } from '../reference-plan'
import type { CutPlan } from '../../../../../src/nesting/cutPath'

const sheet = { width: 1500, height: 3000, margin: 0 }
const profile = (configuration = approvedTalvi()) => toMachineProfile(configuration, { sheet })
const context = (configuration = approvedTalvi()) => ({ profile: profile(configuration), linearizedPlan: referencePlan() })
const codes = (plan: CutPlan, configuration = approvedTalvi()) =>
  talvi6000w.validate(plan, { profile: profile(configuration), linearizedPlan: plan }).map((i) => i.code)

describe('talvi-6000w processor validate', () => {
  it('has the registered identity', () => {
    assert.equal(talvi6000w.id, 'talvi-6000w')
    assert.equal(talvi6000w.revision, 'laserahead-1')
    assert.equal(talvi6000w.machineKind, 'laser')
  })

  it('has no issue for the approved reference configuration', () => {
    assert.deepEqual(codes(referencePlan()), [])
  })

  it('reports a missing configuration without throwing', () => {
    const bare = { ...profile(), configuration: undefined }
    const issues = talvi6000w.validate(referencePlan(), { profile: bare, linearizedPlan: referencePlan() })
    assert.deepEqual(issues.map((i) => i.code), ['CONFIG_FIELD_MISSING'])
    assert.equal(talvi6000w.emit(referencePlan(), { profile: bare, linearizedPlan: referencePlan() }), '')
    const program = generateMachineProgram(referencePlan(), bare)
    assert.equal(program.gcode, '')
    assert.equal(program.releasable, false)
    assert.ok(program.validationIssues.some((i) => i.code === 'CONFIG_FIELD_MISSING'))
  })

  it('reports one UNAPPROVED_VALUE per non-approved critical value', () => {
    const changed = withClassification(withClassification(approvedTalvi(), 'frame', 'inferred'), 'dialect.lastDistance', 'inferred')
    const issues = talvi6000w.validate(referencePlan(), { profile: profile(changed), linearizedPlan: referencePlan() })
    assert.equal(issues.filter((i) => i.code === 'UNAPPROVED_VALUE').length, 2)
    assert.ok(issues.some((i) => i.message.includes('frame')))
  })

  it('reports unsupported actions, an empty program, an overflow and an unmapped quality', () => {
    const plan = referencePlan()
    const withTab: CutPlan = { ...plan, actions: [plan.actions[0], plan.actions[1], { kind: 'tab', points: [{ x: 1, y: 1 }] }, ...plan.actions.slice(2)] }
    assert.ok(codes(withTab).includes('ACTION_UNSUPPORTED'))
    assert.ok(codes({ ...plan, actions: [] }).includes('EMPTY_PROGRAM'))
    const wide = { ...approvedTalvi(), envelope: { ...approvedTalvi().envelope, value: { minX: -1500, maxX: -1300, minY: 0, maxY: 3000 } } }
    const overflow = talvi6000w.validate(plan, { profile: profile(wide), linearizedPlan: plan }).find((i) => i.code === 'OUT_OF_ENVELOPE')
    assert.ok(overflow?.contourId)
    assert.ok(overflow?.message.includes('X'))
    assert.ok(codes(referencePlan({ quality: 'unknown' })).includes('PROCESS_MAPPING_MISSING'))
  })

  it('does not mutate the plan or the configuration', () => {
    const plan = Object.freeze(referencePlan()) as CutPlan
    const configuration = Object.freeze(approvedTalvi())
    assert.doesNotThrow(() => talvi6000w.emit(plan, { profile: profile(configuration), linearizedPlan: plan }))
    assert.doesNotThrow(() => talvi6000w.validate(plan, { profile: profile(configuration), linearizedPlan: plan }))
  })

  it('writes a draft for the shipped configuration without mapping', () => {
    const program = generateMachineProgram(referencePlan(), toMachineProfile(talvi6000wConfiguration, { sheet }))
    assert.ok(program.gcode.length > 0)
    assert.equal(program.releasable, false)
    assert.ok(program.validationIssues.some((i) => i.code === 'PROCESS_MAPPING_MISSING'))
  })
  void context
})
