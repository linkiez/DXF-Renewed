import { z } from 'zod'

const estimable = <T extends z.ZodType>(inner: T) => z.object({ value: inner, estimated: z.boolean().optional() })
const number = estimable(z.number())

/** Zod schema of the cut risk profile, aligned with `CutRiskProfile`. Ranges are checked by `validateRiskProfile`. */
export const riskProfileSchema = z.object({
  contractVersion: z.literal(1),
  geometryUnitsPerMeter: z.number(),
  speeds: z.object({
    cutting: number.optional(),
    rapid: number.optional(),
    pierceDwellSeconds: number.optional(),
  }).optional(),
  heat: z.object({
    radius: number.optional(),
    windowSeconds: number.optional(),
    maxCutLength: number.optional(),
  }).optional(),
  web: z.object({ minimum: number.optional() }).optional(),
  loosePart: z.object({ maxArea: number.optional() }).optional(),
  headStrike: z.object({ clearance: number.optional() }).optional(),
  criticalFactor: number.optional(),
  source: z.string().optional(),
})
