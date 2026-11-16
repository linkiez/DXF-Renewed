import type { CompoundPlacement, NestableShape, Placement, Point2D, StockItem } from '../types'
import type { ErpNestingArtifact } from '../erp/types'
import { messages } from './messages'
import type { ReviewNotice, ReviewPart } from './types'

type ArtifactLayout = NonNullable<ErpNestingArtifact['layout']>

/** Parts per sheet plus the notices raised while resolving placements. */
export interface ResolvedPlacements {
  partsBySheet: ReadonlyMap<string, readonly ReviewPart[]>
  notices: readonly ReviewNotice[]
}

const rectangle = (bbox: Placement['bbox']): Point2D[] => [
  { x: bbox.minX, y: bbox.minY },
  { x: bbox.maxX, y: bbox.minY },
  { x: bbox.maxX, y: bbox.maxY },
  { x: bbox.minX, y: bbox.maxY },
  { x: bbox.minX, y: bbox.minY },
]

const outlineOf = (placement: Placement): { outline: Point2D[]; approximate: boolean } => {
  const vertices = placement.transformedVertices
  return vertices && vertices.length >= 3
    ? { outline: vertices, approximate: false }
    : { outline: rectangle(placement.bbox), approximate: true }
}

const sourceOf = (shape: NestableShape | undefined): ReviewPart['source'] =>
  shape
    ? {
        layer: shape.layer,
        ...(shape.originalHandle ? { originalHandle: shape.originalHandle } : {}),
        area: shape.area,
        perimeter: shape.perimeter,
      }
    : {}

/**
 * Resolves artifact placements into parts without dropping or guessing any of them.
 *
 * Sheet: `sheetId`, else the only sheet, else the placement is reported and not drawn. Instance:
 * `instanceIndex`, else the order among placements of the same shape. Outline:
 * `transformedVertices`, else the bounding box with an info notice. Compound placements become
 * one part with the outer and hole outlines.
 *
 * @param layout - Layout of the artifact.
 * @param sheets - Sheets of the layout, already validated to carry an id and a kind.
 * @param shapes - Shapes available through the cut layout, by shape id.
 * @returns Parts grouped by sheet and the notices raised.
 */
export function resolvePlacements(
  layout: ArtifactLayout,
  sheets: readonly StockItem[],
  shapes: ReadonlyMap<string, NestableShape>,
): ResolvedPlacements {
  const sheetIds = new Set(sheets.map((sheet) => sheet.id))
  const partsBySheet = new Map<string, ReviewPart[]>(sheets.map((sheet) => [sheet.id, []]))
  const notices: ReviewNotice[] = []
  const counters = new Map<string, number>()

  const instanceOf = (shapeId: string, given: number | undefined): number => {
    const next = counters.get(shapeId) ?? 0
    counters.set(shapeId, next + 1)
    return given ?? next
  }

  const sheetOf = (sheetId: string | undefined): string | undefined =>
    sheetId !== undefined && sheetIds.has(sheetId)
      ? sheetId
      : sheets.length === 1 && sheetId === undefined
        ? sheets[0].id
        : undefined

  const add = (
    placement: Placement | CompoundPlacement,
    sheetId: string | undefined,
    shapeId: string,
    instanceIndex: number | undefined,
    outlines: Point2D[][],
    approximate: boolean,
  ): void => {
    const instance = instanceOf(shapeId, instanceIndex)
    const key = `${shapeId}#${instance}`
    const target = sheetOf(sheetId)
    if (target === undefined) {
      notices.push({
        severity: 'warning',
        code: 'PLACEMENT_SHEET_UNRESOLVED',
        message: messages.placementSheetUnresolved(key),
        origin: 'review',
        partKey: key,
      })
      return
    }
    if (approximate) {
      notices.push({
        severity: 'info',
        code: 'PLACEMENT_GEOMETRY_APPROXIMATE',
        message: messages.placementGeometryApproximate(key),
        origin: 'review',
        sheetId: target,
        partKey: key,
      })
    }
    partsBySheet.get(target)?.push({
      key,
      shapeId,
      instanceIndex: instance,
      placement,
      outlines,
      source: sourceOf(shapes.get(shapeId)),
      status: 'placed',
      notices: [],
    })
  }

  for (const placement of layout.placements as Placement[]) {
    const { outline, approximate } = outlineOf(placement)
    add(placement, placement.sheetId, placement.shapeId, placement.instanceIndex, [outline], approximate)
  }

  for (const compound of (layout.compoundPlacements ?? []) as CompoundPlacement[]) {
    const resolved = [compound.outerPlacement, ...compound.holePlacements].map(outlineOf)
    add(
      compound,
      compound.outerPlacement.sheetId,
      compound.shapeId,
      compound.outerPlacement.instanceIndex,
      resolved.map((item) => item.outline),
      resolved.some((item) => item.approximate),
    )
  }

  return { partsBySheet, notices }
}
