import type { ErpNestingArtifact } from '../erp/types'
import type { CompoundPlacement, Placement, Point2D, StockItem } from '../types'

type ArtifactLayout = NonNullable<ErpNestingArtifact['layout']>
type Ring = Point2D[]

/** One placed part with its sheet and the polygons to draw. */
export interface PlacedPart {
  /** `shapeId#instanceIndex`, unique within the layout. */
  key: string
  shapeId: string
  instanceIndex: number
  sheetId: string
  placement: Placement | CompoundPlacement
  outlines: Ring[]
  /** True when no outline was available and the bounding box stands in for it. */
  approximate: boolean
}

/** A placement that needed a fallback or could not be placed on any sheet. */
export type PlacementFinding =
  | { kind: 'sheet-unresolved'; key: string }
  | { kind: 'geometry-approximate'; key: string; sheetId: string }

/** Parts per sheet plus the findings, in artifact order. */
export interface PlacedParts {
  partsBySheet: ReadonlyMap<string, readonly PlacedPart[]>
  findings: readonly PlacementFinding[]
}

const rectangle = (bbox: Placement['bbox']): Ring => [
  { x: bbox.minX, y: bbox.minY },
  { x: bbox.maxX, y: bbox.minY },
  { x: bbox.maxX, y: bbox.maxY },
  { x: bbox.minX, y: bbox.maxY },
  { x: bbox.minX, y: bbox.minY },
]

const outlineOf = (placement: Placement): { outline: Ring; approximate: boolean } => {
  const vertices = placement.transformedVertices
  return vertices && vertices.length >= 3
    ? { outline: vertices, approximate: false }
    : { outline: rectangle(placement.bbox), approximate: true }
}

/**
 * Resolves artifact placements into parts without dropping or guessing any of them.
 *
 * Sheet: `sheetId`, else the only sheet, else a finding and no part. Instance: `instanceIndex`,
 * else the order among placements of the same shape. Outline: `transformedVertices`, else the
 * bounding box flagged as approximate. A compound placement is one part with the outer and hole
 * outlines. The result carries no user text.
 *
 * @param layout - Layout of the artifact.
 * @param sheets - Sheets of the layout, already validated to carry an id and a kind.
 * @returns Parts grouped by sheet and the findings.
 */
export function placedParts(layout: ArtifactLayout, sheets: readonly StockItem[]): PlacedParts {
  const sheetIds = new Set(sheets.map((sheet) => sheet.id))
  const partsBySheet = new Map<string, PlacedPart[]>(sheets.map((sheet) => [sheet.id, []]))
  const findings: PlacementFinding[] = []
  const counters = new Map<string, number>()

  const instanceOf = (shapeId: string, given: number | undefined): number => {
    const next = counters.get(shapeId) ?? 0
    counters.set(shapeId, next + 1)
    return given ?? next
  }

  const sheetOf = (sheetId: string | undefined): string | undefined => {
    if (sheetId !== undefined) return sheetIds.has(sheetId) ? sheetId : undefined
    return sheets.length === 1 ? sheets[0].id : undefined
  }

  const add = (
    placement: Placement | CompoundPlacement,
    declared: { sheetId?: string; shapeId: string; instanceIndex?: number },
    outlines: Ring[],
    approximate: boolean,
  ): void => {
    const instanceIndex = instanceOf(declared.shapeId, declared.instanceIndex)
    const key = `${declared.shapeId}#${instanceIndex}`
    const sheetId = sheetOf(declared.sheetId)
    if (sheetId === undefined) {
      findings.push({ kind: 'sheet-unresolved', key })
      return
    }
    if (approximate) findings.push({ kind: 'geometry-approximate', key, sheetId })
    partsBySheet.get(sheetId)?.push({ key, shapeId: declared.shapeId, instanceIndex, sheetId, placement, outlines, approximate })
  }

  for (const placement of layout.placements as Placement[]) {
    const { outline, approximate } = outlineOf(placement)
    add(placement, placement, [outline], approximate)
  }
  for (const compound of (layout.compoundPlacements ?? []) as CompoundPlacement[]) {
    const resolved = [compound.outerPlacement, ...compound.holePlacements].map(outlineOf)
    const declared = { sheetId: compound.outerPlacement.sheetId, shapeId: compound.shapeId, instanceIndex: compound.outerPlacement.instanceIndex }
    add(compound, declared, resolved.map((item) => item.outline), resolved.some((item) => item.approximate))
  }

  return { partsBySheet, findings }
}
