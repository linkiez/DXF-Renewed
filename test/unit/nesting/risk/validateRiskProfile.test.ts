import { expect } from 'expect'
import { validateRiskProfile } from '../../../../src/nesting/risk/validateRiskProfile'
import { riskProfileSchema } from '../../../../src/nesting/risk/schemas'
import { completeRiskProfile, deepFreeze, withLimit } from './fixtures'

const codes = (profile: unknown): string[] => validateRiskProfile(profile as never).map((n) => `${n.severity}:${n.code}`)

describe('risk/validateRiskProfile', () => {
  it('accepts the complete profile without notices', () => {
    expect(validateRiskProfile(completeRiskProfile())).toEqual([])
    expect(riskProfileSchema.safeParse(completeRiskProfile()).success).toBe(true)
  })

  it('rejects a geometry unit that is not finite and positive', () => {
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(codes(withLimit(completeRiskProfile(), 'geometryUnitsPerMeter', bad))).toEqual(['error:PROFILE_INVALID'])
    }
  })

  it('rejects limits that are not greater than zero and a critical factor that is not greater than 1', () => {
    for (const path of ['heat.radius', 'heat.windowSeconds', 'heat.maxCutLength', 'web.minimum', 'loosePart.maxArea', 'headStrike.clearance']) {
      expect(codes(withLimit(completeRiskProfile(), path, { value: 0 }))).toEqual(['error:PROFILE_INVALID'])
      expect(codes(withLimit(completeRiskProfile(), path, { value: -2 }))).toEqual(['error:PROFILE_INVALID'])
    }
    expect(codes(withLimit(completeRiskProfile(), 'criticalFactor', { value: 1 }))).toEqual(['error:PROFILE_INVALID'])
    expect(codes(withLimit(completeRiskProfile(), 'criticalFactor', { value: 0.5 }))).toEqual(['error:PROFILE_INVALID'])
  })

  it('names the invalid path and speaks Brazilian Portuguese', () => {
    const [notice] = validateRiskProfile(withLimit(completeRiskProfile(), 'web.minimum', { value: -1 }))

    expect(notice.message).toContain('web.minimum')
    expect(notice.message).toContain('inválido')
  })

  it('rejects a profile that does not match the schema', () => {
    expect(codes({ contractVersion: 1 })).toEqual(['error:PROFILE_INVALID'])
    expect(codes(null)).toEqual(['error:PROFILE_INVALID'])
  })

  it('raises ESTIMATED_LIMIT for a value marked as estimated', () => {
    const profile = withLimit(completeRiskProfile(), 'web.minimum', { value: 0.002, estimated: true })

    const notices = validateRiskProfile(profile)

    expect(notices.map((n) => [n.severity, n.code])).toEqual([['info', 'ESTIMATED_LIMIT']])
    expect(notices[0].message).toContain('web.minimum')
  })

  it('ignores an unknown field and never mutates the profile', () => {
    const profile = deepFreeze({ ...completeRiskProfile(), extra: 'ignored' })

    expect(validateRiskProfile(profile)).toEqual([])
  })
})
