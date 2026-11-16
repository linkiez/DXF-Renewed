import { riskMessages } from './messages'
import { riskProfileSchema } from './schemas'
import type { CutRiskProfile, RiskNotice } from './types'

interface Field {
  path: string
  value: number
  estimated: boolean
  min: number
}

const POSITIVE = 0
const ABOVE_ONE = 1

type Entry = { value: number; estimated?: boolean } | undefined

const FIELDS: { path: string; min: number; get(profile: CutRiskProfile): Entry }[] = [
  { path: 'speeds.cutting', min: POSITIVE, get: (p) => p.speeds?.cutting },
  { path: 'speeds.rapid', min: POSITIVE, get: (p) => p.speeds?.rapid },
  { path: 'speeds.pierceDwellSeconds', min: -1, get: (p) => p.speeds?.pierceDwellSeconds },
  { path: 'heat.radius', min: POSITIVE, get: (p) => p.heat?.radius },
  { path: 'heat.windowSeconds', min: POSITIVE, get: (p) => p.heat?.windowSeconds },
  { path: 'heat.maxCutLength', min: POSITIVE, get: (p) => p.heat?.maxCutLength },
  { path: 'web.minimum', min: POSITIVE, get: (p) => p.web?.minimum },
  { path: 'loosePart.maxArea', min: POSITIVE, get: (p) => p.loosePart?.maxArea },
  { path: 'headStrike.clearance', min: POSITIVE, get: (p) => p.headStrike?.clearance },
  { path: 'criticalFactor', min: ABOVE_ONE, get: (p) => p.criticalFactor },
]

const fieldsOf = (profile: CutRiskProfile): Field[] => [
  { path: 'geometryUnitsPerMeter', value: profile.geometryUnitsPerMeter, estimated: false, min: POSITIVE },
  ...FIELDS.flatMap((field) => {
    const entry = field.get(profile)
    return entry ? [{ path: field.path, value: entry.value, estimated: entry.estimated === true, min: field.min }] : []
  }),
]

const invalid = (field: Field): boolean => !Number.isFinite(field.value) || (field.min >= 0 ? field.value <= field.min : field.value < 0)

const error = (path: string): RiskNotice => ({
  severity: 'error',
  code: 'PROFILE_INVALID',
  message: riskMessages.notice.PROFILE_INVALID({ detail: path }),
})

/**
 * Checks a caller-supplied risk profile beyond its schema: every unit and limit must be finite and
 * positive and the critical factor greater than 1. A value marked as estimated raises an info notice.
 *
 * @param profile - Profile to validate; never mutated.
 * @returns Notices: `PROFILE_INVALID` errors and `ESTIMATED_LIMIT` infos; empty when the profile is sound.
 * @example
 * ```typescript
 * const notices = validateRiskProfile(profile)
 * ```
 */
export function validateRiskProfile(profile: CutRiskProfile): RiskNotice[] {
  const parsed = riskProfileSchema.safeParse(profile)
  if (!parsed.success) return [error(parsed.error.issues[0]?.path.join('.') || 'profile')]
  const fields = fieldsOf(parsed.data as CutRiskProfile)
  const errors = fields.filter(invalid).map((field) => error(field.path))
  const estimated = fields.filter((field) => field.estimated && !invalid(field)).map((field): RiskNotice => ({
    severity: 'info',
    code: 'ESTIMATED_LIMIT',
    message: riskMessages.notice.ESTIMATED_LIMIT({ detail: field.path }),
  }))
  return [...errors, ...estimated]
}
