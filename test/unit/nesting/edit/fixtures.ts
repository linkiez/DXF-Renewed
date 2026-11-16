import { planCutPath } from '../../../../src/nesting'
import type { CutLayout, CutPlanResult, Placement, StockItem } from '../../../../src/nesting'
import { createNestingArtifact } from '../../../../src/nesting/erp/artifact'
import type { ErpNestingArtifact } from '../../../../src/nesting/erp/types'
import type { EditConstraints, EditInput, WorkingPart } from '../../../../src/nesting/edit/types'
import { contour, placementFor, profile, square } from '../cutPath/fixtures'
import { nestResponse, request } from '../review/fixtures'

export { deepFreeze } from '../review/fixtures'

export const EDGE = 2
export const SPACING = 2
const SHEET = 100

/** A stock hole (remnant exclusion) at the top right of the sheet, clear of part D. */
const stockHole = square('stock-hole', 75, 75, 15)

/** A single sheet of 100 x 100 with a hole, edge clearance 2 and part spacing 2. */
export const editSheet = (): StockItem => ({
  id: 'sheet-1',
  kind: 'sheet',
  width: SHEET,
  height: SHEET,
  holes: [stockHole],
})

export interface EditFixture {
  input: EditInput
  artifact: ErpNestingArtifact
  layout: CutLayout
  cutPlan: CutPlanResult
}

/**
 * Part A (10,10) and B (40,10) side by side with a 10 gap, C (10,40) grain locked, host D (40,40)
 * 30 x 30 with a hole that holds the small part E, and F touching the edge limit at x = 88.
 */
export const editFixture = async (): Promise<EditFixture> => {
  const sheet = editSheet()
  const shapes = [
    square('part-A', 10, 10, 20),
    square('part-B', 40, 10, 20),
    square('part-C', 10, 40, 20),
    square('part-D', 40, 40, 30),
    square('part-E', 51, 51, 8),
    square('part-F', 88, 10, 10),
  ]
  const placements: Placement[] = shapes.map((shape) => ({ ...placementFor(shape, sheet.id), instanceIndex: 0 }))
  const dHole = square('part-D-hole', 48, 48, 14)
  const contours = [
    ...shapes.map((shape, index) => contour(`${shape.id}-outer`, shape.id, shape, placements[index], true)),
    contour('part-D-hole', 'part-D', dHole, placementFor(dHole, sheet.id), false, 'part-D-outer'),
  ].map((item) => ({ ...item, sheetId: sheet.id }))
  const layout: CutLayout = { sheets: [sheet], contours, startPoint: { x: 0, y: 0 } }
  const cutPlan = planCutPath(layout, profile({ sequence: { strategy: 'input' } }))
  const response = { ...nestResponse([sheet], placements), edgeClearance: EDGE, partToPartClearance: SPACING }
  const artifact = await createNestingArtifact(request([sheet]), response)
  return { input: { artifact, layout, cutPlan, constraints: editConstraints() }, artifact, layout, cutPlan }
}

/** Rotations 0 and 90 everywhere, C grain locked along 0, B mirrorable, one flaw zone. */
export const editConstraints = (): EditConstraints => ({
  allowedRotations: [0, 90],
  parts: {
    'part-C': { grainLocked: true, grainAngle: 0 },
    'part-B': { mirrorable: true },
  },
  exclusions: [{ id: 'flaw-1', sheetId: 'sheet-1', outline: square('flaw', 10, 70, 15).vertices }],
})

/** The same job without any constraints. */
export const withoutConstraints = (fixture: EditFixture): EditInput => ({ ...fixture.input, constraints: undefined })

/** The same job without a cut layout. */
export const withoutLayout = (fixture: EditFixture): EditInput => ({ ...fixture.input, layout: undefined })

/** The same job with placements that carry only a bounding box. */
export const withApproximateOutlines = async (fixture: EditFixture): Promise<EditInput> => {
  const layout = fixture.artifact.layout as NonNullable<ErpNestingArtifact['layout']>
  const sparse = layout.placements.map(({ transformedVertices: _ignored, ...rest }) => rest) as Placement[]
  const artifact: ErpNestingArtifact = { ...fixture.artifact, layout: { ...layout, placements: sparse } }
  return { ...fixture.input, artifact, layout: undefined }
}

/** An artifact the ERP schema rejects. */
export const invalidArtifactInput = (fixture: EditFixture): EditInput => ({
  ...fixture.input,
  artifact: { ...fixture.artifact, correlation: undefined } as unknown as ErpNestingArtifact,
})

/** An artifact with a contract version the module does not support. */
export const unsupportedVersionInput = (fixture: EditFixture): EditInput => ({
  ...fixture.input,
  artifact: { ...fixture.artifact, contractVersion: 2 },
})

/** A working part built straight from a placement, for tests that do not need a session. */
export const workingPartOf = (placement: Placement, key = `${placement.shapeId}#0`): WorkingPart => ({
  key,
  shapeId: placement.shapeId,
  instanceIndex: 0,
  sheetId: placement.sheetId ?? 'sheet-1',
  placement,
  outlines: [(placement.transformedVertices ?? []).map((point) => ({ ...point }))],
  approximate: false,
  mirrored: false,
  contourIds: [],
  source: { kind: 'placement', index: 0 },
  holesKnown: false,
})
