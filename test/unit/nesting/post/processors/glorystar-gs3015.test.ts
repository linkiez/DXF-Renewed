import { strict as assert } from 'node:assert'
import '../../../../../src/nesting/post'
import { generateMachineProgram } from '../../../../../src/nesting/post'
import { toMachineProfile } from '../../../../../src/nesting/post/machine/toMachineProfile'
import { gloryStarGs3015 } from '../../../../../src/nesting/post/processors/glorystar-gs3015'
import { approvedGloryStar, gloryStarSettings, withClassification } from '../machine/fixtures'
import { referencePlan } from '../reference-plan'
import type { CutPlan } from '../../../../../src/nesting/cutPath'

const sheet = { width: 1500, height: 3000, margin: 0 }
const plan = () => referencePlan({ quality: '1' })
const profile = (configuration = approvedGloryStar(), processSettings: Record<string, boolean | number | string> = gloryStarSettings) =>
  toMachineProfile(configuration, { sheet, processSettings })
const issues = (p: CutPlan, configuration = approvedGloryStar(), settings: Record<string, boolean | number | string> = gloryStarSettings) =>
  gloryStarGs3015.validate(p, { profile: profile(configuration, settings), linearizedPlan: p })

describe('glorystar-gs3015 processor validate', () => {
  it('has the registered identity', () => {
    assert.equal(gloryStarGs3015.id, 'glorystar-gs3015')
    assert.equal(gloryStarGs3015.revision, 'sigmanest-23.2-1')
    assert.equal(gloryStarGs3015.machineKind, 'laser')
  })

  it('has no issue for the approved configuration', () => {
    assert.deepEqual(issues(plan()), [])
  })

  it('blocks the release of every non-approved critical value', () => {
    const changed = withClassification(approvedGloryStar(), 'dialect.headDownMaxDistance', 'observed')
    assert.equal(issues(plan(), changed).filter((i) => i.code === 'UNAPPROVED_VALUE').length, 1)
  })

  it('reports a missing configuration without throwing', () => {
    const bare = { ...profile(), configuration: undefined }
    assert.deepEqual(gloryStarGs3015.validate(plan(), { profile: bare, linearizedPlan: plan() }).map((i) => i.code), ['CONFIG_FIELD_MISSING'])
    assert.equal(gloryStarGs3015.emit(plan(), { profile: bare, linearizedPlan: plan() }), '')
    const program = generateMachineProgram(plan(), bare)
    assert.equal(program.gcode, '')
    assert.ok(program.validationIssues.some((i) => i.code === 'CONFIG_FIELD_MISSING'))
  })

  it('reports the missing feed or piercing type, a missing quality, a tab and an empty plan', () => {
    const { feed: _feed, ...noFeed } = gloryStarSettings as Record<string, number>
    assert.ok(issues(plan(), approvedGloryStar(), noFeed).some((i) => i.code === 'PROCESS_SETTING_REQUIRED' && i.message.includes('feed')))
    const { piercingType: _pt, ...noPierce } = gloryStarSettings as Record<string, number>
    assert.ok(issues(plan(), approvedGloryStar(), noPierce).some((i) => i.message.includes('piercingType')))
    assert.ok(issues(referencePlan({ quality: '' })).some((i) => i.message.includes('quality') && i.contourId))
    const p = plan()
    const withTab: CutPlan = { ...p, actions: [p.actions[0], p.actions[1], { kind: 'tab', points: [{ x: 1, y: 1 }] }, ...p.actions.slice(2)] }
    assert.ok(issues(withTab).some((i) => i.code === 'ACTION_UNSUPPORTED'))
    assert.ok(issues({ ...p, actions: [] }).some((i) => i.code === 'EMPTY_PROGRAM'))
  })

  it('reports an overflow of the envelope with the contour and the axis', () => {
    const narrow = { ...approvedGloryStar(), envelope: { ...approvedGloryStar().envelope, value: { minX: 0, maxX: 2000, minY: 0, maxY: 1500 } } }
    const found = issues(plan(), narrow).find((i) => i.code === 'OUT_OF_ENVELOPE')
    assert.ok(found?.contourId)
    assert.ok(found?.message.includes('X'))
  })

  it('does not mutate the plan or the configuration', () => {
    const p = Object.freeze(plan()) as CutPlan
    const configuration = Object.freeze(approvedGloryStar())
    assert.doesNotThrow(() => gloryStarGs3015.emit(p, { profile: profile(configuration), linearizedPlan: p }))
  })
})
