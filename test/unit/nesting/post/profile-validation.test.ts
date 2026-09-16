import { strict as assert } from 'node:assert'
import { validateMachineProfile } from '../../../../src/nesting/post'
import { profile } from './fixtures'

describe('profile validation', () => {
  it('reports invalid feed and bounds', () => {
    const issues = validateMachineProfile(profile({ maxFeed: 0, sheet: { width: 0, height: 100, margin: -1 } }))
    assert.ok(issues.some((issue) => issue.code === 'FEED_INVALID'))
    assert.ok(issues.some((issue) => issue.code === 'PROFILE_BOUNDS'))
  })
})
