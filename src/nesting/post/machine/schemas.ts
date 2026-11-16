import { z } from 'zod'

const classification = z.enum(['observed', 'user-confirmed', 'vendor-confirmed', 'approved', 'inferred'])

const source = z.object({
  classification,
  reference: z.string().min(1),
  confirmedBy: z.string().optional(),
  note: z.string().optional(),
})

const sourced = <T extends z.ZodType>(inner: T) => z.object({ value: inner, source })

const actionKind = z.enum(['rapid', 'pierce', 'lead-in', 'cut', 'lead-out', 'overcut', 'tab', 'common-line', 'end'])

/** Zod schema of `MachineConfiguration`. Cross-field rules are checked by `validateMachineConfiguration`. */
export const machineConfigurationSchema = z.object({
  configurationId: z.string().min(1),
  revision: z.string().min(1),
  name: z.string(),
  machineKind: z.enum(['laser', 'plasma']),
  processorId: z.string().min(1),
  processorRevision: z.string().min(1),
  units: sourced(z.enum(['mm', 'inch'])),
  envelope: sourced(z.object({ minX: z.number(), maxX: z.number(), minY: z.number(), maxY: z.number() })),
  frame: sourced(z.object({
    rotationDegrees: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]),
    origin: z.enum(['bottom-left', 'bottom-right', 'top-left', 'top-right']),
  })),
  table: sourced(z.object({ width: z.number().positive(), height: z.number().positive() })),
  deadZone: sourced(z.number().min(0)).optional(),
  rapidFeed: sourced(z.number().positive()),
  arcCenter: sourced(z.enum(['incremental', 'absolute'])),
  decimals: sourced(z.number().int().min(0).max(6)),
  trailingZeros: sourced(z.boolean()),
  output: z.object({
    extension: sourced(z.string().startsWith('.')),
    lineEnding: sourced(z.enum(['lf', 'crlf'])),
  }),
  operations: sourced(z.array(actionKind)),
  dialect: z.record(z.string(), sourced(z.union([z.number(), z.string(), z.array(z.string())]))),
  processMapping: sourced(z.object({
    key: z.string().min(1),
    entries: z.array(z.object({ value: z.string(), p: z.number(), q: z.number().optional() })),
    omitQ: z.string(),
  })).optional(),
  externalDependencies: z.array(z.object({ name: z.string().min(1), source })),
  controllerPreconditions: z.array(z.object({ id: z.string().min(1), text: z.string().min(1), source })),
})
