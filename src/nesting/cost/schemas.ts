import { z } from 'zod'
import type { CutLayout, CutPlanResult } from '../cutPath/types'
import { erpNestingArtifactSchema } from '../erp/schemas'

const estimable = <T extends z.ZodType>(inner: T) =>
  z.object({ value: inner, estimated: z.boolean().optional() })

const money = z.object({
  value: z.number(),
  estimated: z.boolean().optional(),
  currency: z.string().optional(),
})

const number = estimable(z.number())

/** Zod schema of the cost model, aligned with `CostModel`. Ranges are checked by `validateCostModel`. */
export const costModelSchema = z.object({
  contractVersion: z.literal(1),
  currency: z.object({ code: z.string(), minorUnitDigits: z.number().int() }),
  geometryUnitsPerMeter: z.number(),
  material: z.object({
    fullSheet: z.record(z.string(), money),
    remnant: z.record(z.string(), money),
  }),
  speeds: z.object({
    cutting: number.optional(),
    rapid: number.optional(),
    pierceDwellSeconds: number.optional(),
  }).optional(),
  rates: z.object({
    cuttingPerHour: money.optional(),
    travelPerHour: money.optional(),
    piercePerUnit: money.optional(),
    labourPerHour: money.optional(),
  }).optional(),
  handling: z.object({
    secondsPerSheet: number.optional(),
    secondsPerJob: number.optional(),
  }).optional(),
  consumables: z.array(z.object({
    id: z.string(),
    cost: money,
    life: estimable(z.object({ unit: z.enum(['pierces', 'cuttingSeconds']), amount: z.number() })).optional(),
  })),
})

/** Zod schema of a cost request: the 006 artifact schema, the optional plan inputs and the cost model. */
export const costRequestSchema = z.object({
  artifact: erpNestingArtifactSchema,
  layout: z.custom<CutLayout>().optional(),
  cutPlan: z.custom<CutPlanResult>().optional(),
  costModel: costModelSchema,
})
