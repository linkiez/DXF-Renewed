import { strict as assert } from 'node:assert'
import { splitContours } from '../../../../../../src/nesting/post/dialects/contourBlocks'
import { talviSelector } from '../../../../../../src/nesting/post/dialects/talvi/talviSelector'
import type { ProcessMapping } from '../../../../../../src/nesting/post/machine/types'
import { referencePlan } from '../../reference-plan'

const [contour] = splitContours(referencePlan()).contours
const mapping = (overrides: Partial<ProcessMapping> = {}): ProcessMapping => ({
  key: 'quality',
  entries: [{ value: 'standard', p: 1, q: 1 }],
  omitQ: 'never',
  ...overrides,
})

describe('talviSelector', () => {
  it('writes P and Q from the mapping entry', () => {
    assert.deepEqual(talviSelector(contour, mapping()), { line: 'M101 P1 Q1', issues: [] })
  })

  it('omits Q only when the mapping says so', () => {
    const entries = [{ value: 'standard', p: 2 }]
    assert.equal(talviSelector(contour, mapping({ entries, omitQ: 'when-undefined' })).line, 'M101 P2')
    const never = talviSelector(contour, mapping({ entries, omitQ: 'never' }))
    assert.equal(never.issues[0].code, 'PROCESS_MAPPING_MISSING')
    assert.equal(never.line, '(PROCESS_MAPPING_MISSING standard)')
  })

  it('never invents a selector for an unmapped value or a missing mapping', () => {
    const unmapped = talviSelector(contour, mapping({ entries: [{ value: 'other', p: 1, q: 1 }] }))
    assert.equal(unmapped.line, '(PROCESS_MAPPING_MISSING standard)')
    assert.equal(unmapped.issues[0].code, 'PROCESS_MAPPING_MISSING')
    assert.equal(unmapped.issues[0].contourId, 'c-hole')
    const none = talviSelector(contour, undefined)
    assert.equal(none.issues[0].code, 'PROCESS_MAPPING_MISSING')
    assert.ok(!none.line.includes('P1 Q1'))
  })
})
