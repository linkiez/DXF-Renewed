import { z } from 'zod'

const scalarSchema = z.union([z.string(), z.number().finite(), z.boolean()])
const pointSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
})
const boundingBoxSchema = z.object({
  minX: z.number().finite(),
  minY: z.number().finite(),
  maxX: z.number().finite(),
  maxY: z.number().finite(),
  width: z.number().finite().nonnegative(),
  height: z.number().finite().nonnegative(),
})
const nestableShapeSchema = z.object({
  id: z.string().min(1),
  layer: z.string().min(1),
  originalHandle: z.string().optional(),
  vertices: z.array(pointSchema).min(3),
  bbox: boundingBoxSchema,
  convexHull: z.array(pointSchema).optional(),
  area: z.number().finite(),
  perimeter: z.number().finite().nonnegative(),
  centroid: pointSchema,
  allowedRotations: z.array(z.number().finite()),
  kerf: z.number().finite().nonnegative(),
  tag: z.string().optional(),
  isHole: z.boolean(),
})
const stockSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['sheet', 'remnant']),
  width: z.number().finite().positive(),
  height: z.number().finite().positive(),
  thickness: z.number().finite().positive().optional(),
  material: z.string().optional(),
  grainAngle: z.number().finite().optional(),
  holes: z.array(nestableShapeSchema).optional(),
})
const partSchema = z.object({
  shape: nestableShapeSchema,
  quantity: z.number().int().positive(),
  grainLocked: z.boolean().optional(),
  grainAngle: z.number().finite().optional(),
}).superRefine((part, context) => {
  if (part.grainLocked && part.grainAngle === undefined) {
    context.addIssue({
      code: 'custom',
      message: 'grainAngle is required for grain-locked parts',
      path: ['grainAngle'],
    })
  }
})

const snapshotSchema = z.object({
  id: z.string().min(1),
  revision: z.string().min(1),
  capabilities: z.record(z.string(), scalarSchema),
})

const processProfileSchema = z.object({
  id: z.string().min(1),
  revision: z.string().min(1),
  settings: z.record(z.string(), scalarSchema),
})

const correlationSchema = z.object({
  orderId: z.string().min(1),
  revisionId: z.string().min(1),
  requestId: z.string().min(1),
})

const issueSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  path: z.string().optional(),
})

export const erpNestingRequestSchema = z.object({
  contractVersion: z.number().int().positive(),
  correlation: correlationSchema,
  job: z.object({
    parts: z.array(partSchema),
    stock: z.array(stockSchema),
    machine: snapshotSchema,
    processProfile: processProfileSchema,
    nesting: z.object({
      edgeClearance: z.number().finite().nonnegative(),
      partToPartClearance: z.number().finite().nonnegative(),
      algorithm: z.enum(['guillotine', 'maxrects', 'shelf', 'bliss']).optional(),
      allowedRotations: z.array(z.number().finite()).optional(),
      acceleration: z.boolean().optional(),
      objective: z.object({
        materialUse: z.number().finite().nonnegative(),
        travel: z.number().finite().nonnegative(),
        sheetCount: z.number().finite().nonnegative(),
        remnant: z.number().finite().nonnegative(),
      }).optional(),
    }),
  }),
  seed: z.number().int().finite(),
  overrides: z.record(z.string(), scalarSchema).optional(),
  requestedAt: z.string().datetime().optional(),
})

export const erpNestingArtifactSchema = z.object({
  contractVersion: z.number().int().positive(),
  correlation: correlationSchema,
  status: z.enum(['complete', 'partial', 'rejected']),
  snapshots: z.object({
    machine: snapshotSchema,
    stock: z.array(stockSchema),
    processProfile: processProfileSchema,
  }),
  layout: z.object({
    placements: z.array(z.object({
      shapeId: z.string().min(1),
      x: z.number().finite(),
      y: z.number().finite(),
      rotation: z.number().finite(),
      bbox: boundingBoxSchema,
      transformedVertices: z.array(pointSchema).optional(),
      sheetId: z.string().optional(),
      instanceIndex: z.number().int().nonnegative().optional(),
    })),
    compoundPlacements: z.array(z.object({
      shapeId: z.string().min(1),
      x: z.number().finite(),
      y: z.number().finite(),
      rotation: z.number().finite(),
      bbox: boundingBoxSchema,
      outerPlacement: z.object({
        shapeId: z.string().min(1),
        x: z.number().finite(),
        y: z.number().finite(),
        rotation: z.number().finite(),
        bbox: boundingBoxSchema,
      }),
      holePlacements: z.array(z.object({
        shapeId: z.string().min(1),
        x: z.number().finite(),
        y: z.number().finite(),
        rotation: z.number().finite(),
        bbox: boundingBoxSchema,
      })),
    })).optional(),
    sheets: z.array(stockSchema),
    utilization: z.number().finite(),
    wasteArea: z.number().finite(),
    totalArea: z.number().finite(),
    unplaced: z.array(z.object({
      shapeId: z.string().min(1),
      quantity: z.number().int().positive(),
      reason: z.string().min(1),
    })),
    budget: z.object({ iterations: z.number().int().nonnegative() }),
    seed: z.number().int().finite(),
    edgeClearance: z.number().finite().nonnegative(),
    partToPartClearance: z.number().finite().nonnegative(),
  }).passthrough().nullable(),
  warnings: z.array(issueSchema.extend({ severity: z.literal('warning') })),
  rejections: z.array(issueSchema.extend({ severity: z.literal('rejection') })),
  unplaced: z.array(z.object({
    itemId: z.string().min(1),
    quantity: z.number().int().positive(),
    reasonCode: z.string().min(1),
    reason: z.string().min(1),
  })),
  overrides: z.record(z.string(), scalarSchema),
  inputDigest: z.object({
    algorithm: z.literal('sha256'),
    value: z.string().regex(/^[a-f0-9]{64}$/),
  }),
  outputDigest: z.object({
    algorithm: z.literal('sha256'),
    value: z.string().regex(/^[a-f0-9]{64}$/),
  }),
})

/**
 * Resolves the runtime validator for a supported ERP contract version.
 *
 * @param version - Contract version supplied by the caller.
 * @returns The version-specific request schema, or undefined when unsupported.
 */
export function getErpNestingRequestSchema(version: number | undefined) {
  return version === 1 ? erpNestingRequestSchema : undefined
}
