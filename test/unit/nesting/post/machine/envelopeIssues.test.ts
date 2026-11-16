import { strict as assert } from 'node:assert'
import { envelopeIssues } from '../../../../../src/nesting/post/machine/envelopeIssues'
import { referencePlan } from '../reference-plan'
import { baseConfiguration } from './fixtures'
import type { CutPlan } from '../../../../../src/nesting/cutPath'

const sheet = { width: 1500, height: 3000 }
const planWith = (x: number, y: number): CutPlan => ({
  ...referencePlan(),
  actions: [
    { kind: 'rapid', points: [{ x: 0, y: 0 }, { x, y }], contourId: 'c-x' },
    { kind: 'pierce', points: [{ x, y }], contourId: 'c-x' },
  ],
})

describe('envelopeIssues', () => {
  it('accepts the reference plan inside the Talvi envelope', () => {
    assert.deepEqual(envelopeIssues(referencePlan(), baseConfiguration(), sheet), [])
  })

  it('names the contour, the axis and the bound of a point outside', () => {
    const issues = envelopeIssues(planWith(1600, 100), baseConfiguration(), sheet)
    const found = issues.find((issue) => issue.code === 'OUT_OF_ENVELOPE')
    assert.ok(found)
    assert.equal(found?.contourId, 'c-x')
    assert.ok(found?.message.includes('X'))
    assert.ok(found?.message.includes('c-x'))
  })

  it('accepts a point exactly on the bound and tolerates EPSILON', () => {
    assert.deepEqual(envelopeIssues(planWith(1500, 3000), baseConfiguration(), sheet).filter((i) => i.code === 'OUT_OF_ENVELOPE'), [])
    assert.deepEqual(envelopeIssues(planWith(1500 + 1e-9, 3000), baseConfiguration(), sheet).filter((i) => i.code === 'OUT_OF_ENVELOPE'), [])
  })

  it('reports one SHEET_DOES_NOT_FIT when a mapped corner is outside the envelope', () => {
    const issues = envelopeIssues(referencePlan(), baseConfiguration(), { width: 1600, height: 3000 })
    assert.equal(issues.filter((i) => i.code === 'SHEET_DOES_NOT_FIT').length, 1)
  })

  it('has no envelope issue for an empty plan', () => {
    assert.deepEqual(envelopeIssues({ ...referencePlan(), actions: [] }, baseConfiguration(), sheet), [])
  })
})
