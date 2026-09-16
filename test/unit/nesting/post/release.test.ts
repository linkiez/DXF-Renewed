import { strict as assert } from 'node:assert'
import { generateMachineProgram } from '../../../../src/nesting/post'
import { plan, profile } from './fixtures'

describe('generateMachineProgram', () => {
  it('returns metadata and releasable output for a valid exact processor', () => {
    const result = generateMachineProgram(plan, profile({
      expectedOutput: `(GENERIC LASER)
G21
G90
G00 X20 Y20
M03 S100
G04 P0
G01 X30 Y30 F1000
M05
M30
`,
    }))
    assert.equal(result.processorId, 'generic-laser')
    assert.equal(result.processorRevision, '1')
    assert.equal(result.profileRevision, 'profile-1')
    assert.equal(result.releasable, true)
    assert.match(result.gcode, /G00/)
  })
  it('blocks unknown processors and expected-output mismatches', () => {
    const unknown = generateMachineProgram(plan, profile({ processorId: 'unknown' }))
    assert.equal(unknown.releasable, false)
    assert.ok(unknown.validationIssues.some((issue) => issue.code === 'UNKNOWN_PROCESSOR'))
    const mismatch = generateMachineProgram(plan, profile({ expectedOutput: 'G00 X999\n' }))
    assert.equal(mismatch.releasable, false)
    assert.ok(mismatch.validationIssues.some((issue) => issue.code === 'EXPECTED_OUTPUT_MISMATCH'))
  })
  it('blocks approved processors when reviewed output is missing', () => {
    const result = generateMachineProgram(plan, profile({ expectedOutput: undefined }))
    assert.equal(result.releasable, false)
    assert.ok(result.validationIssues.some((issue) => issue.code === 'EXPECTED_OUTPUT_REQUIRED'))
  })
  it('blocks curved movement without an approved tolerance', () => {
    const curvedPlan = {
      ...plan,
      actions: plan.actions.map((action) =>
        action.kind === 'cut' ? { ...action, metadata: { curved: true } } : action,
      ),
    }
    const result = generateMachineProgram(curvedPlan, profile({ arcSupport: false }))
    assert.equal(result.releasable, false)
    assert.ok(result.validationIssues.some((issue) => issue.code === 'CURVE_TOLERANCE_REQUIRED'))
  })

  it('rejects malformed arcs before emission with either arc-support setting', () => {
    for (const overrides of [
      { arcSupport: true },
      { arcSupport: false, curveLinearizationTolerance: 1 },
    ]) {
      const malformedPlan = {
        ...plan,
        actions: plan.actions.map((action) =>
          action.kind === 'cut'
            ? {
                ...action,
                curve: {
                  type: 'arc' as const,
                  center: { x: Number.NaN, y: 25 },
                  clockwise: false,
                },
              }
            : action,
        ),
      }
      const inputSnapshot = structuredClone(malformedPlan)
      const result = generateMachineProgram(malformedPlan, profile(overrides))

      assert.equal(result.gcode, '')
      assert.equal(result.releasable, false)
      assert.ok(result.validationIssues.some((issue) => issue.code === 'CURVE_MALFORMED'))
      assert.deepEqual(malformedPlan, inputSnapshot)
    }
  })
})
