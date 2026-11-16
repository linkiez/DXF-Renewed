import { strict as assert } from 'node:assert'
import { toMachineProfile } from '../../../../../src/nesting/post/machine/toMachineProfile'
import { baseConfiguration } from './fixtures'

describe('toMachineProfile', () => {
  const request = { sheet: { width: 1500, height: 3000, margin: 0 }, processSettings: { feed: 1000 }, expectedOutput: 'G21\n' }

  it('builds the profile from the configuration and the request', () => {
    const configuration = baseConfiguration()
    const profile = toMachineProfile(configuration, request)
    assert.equal(profile.machineId, 'fixture-machine')
    assert.equal(profile.machineKind, 'laser')
    assert.equal(profile.processorId, 'generic-laser')
    assert.equal(profile.processorRevision, '1')
    assert.equal(profile.units, 'mm')
    assert.deepEqual(profile.sheet, request.sheet)
    assert.equal(profile.maxFeed, 26000)
    assert.equal(profile.arcSupport, true)
    assert.deepEqual(profile.capabilities, { rapid: true, pierce: true, cut: true, end: true })
    assert.equal(profile.profileRevision, 'rev-1')
    assert.deepEqual(profile.processSettings, { feed: 1000 })
    assert.equal(profile.expectedOutput, 'G21\n')
    assert.equal(profile.configuration, configuration)
  })

  it('honours the profile revision and the feed limit of the request', () => {
    const profile = toMachineProfile(baseConfiguration(), { ...request, profileRevision: 'p-9', maxFeed: 5000 })
    assert.equal(profile.profileRevision, 'p-9')
    assert.equal(profile.maxFeed, 5000)
  })

  it('does not mutate its inputs and passes a bad sheet through for profile validation', () => {
    const configuration = Object.freeze(baseConfiguration())
    const frozen = Object.freeze({ ...request, sheet: Object.freeze({ width: 0, height: 3000, margin: 0 }) })
    assert.doesNotThrow(() => toMachineProfile(configuration, frozen))
    assert.equal(toMachineProfile(configuration, frozen).sheet.width, 0)
  })
})
