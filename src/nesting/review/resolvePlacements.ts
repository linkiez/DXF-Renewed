import type { ErpNestingArtifact } from '../erp/types'
import { placedParts } from '../linking/placedParts'
import type { PlacedPart, PlacementFinding } from '../linking/placedParts'
import type { NestableShape, StockItem } from '../types'
import { messages } from './messages'
import type { ReviewNotice, ReviewPart } from './types'

type ArtifactLayout = NonNullable<ErpNestingArtifact['layout']>

/** Parts per sheet plus the notices raised while resolving placements. */
export interface ResolvedPlacements {
  partsBySheet: ReadonlyMap<string, readonly ReviewPart[]>
  notices: readonly ReviewNotice[]
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

const toReviewPart = (part: PlacedPart, shapes: ReadonlyMap<string, NestableShape>): ReviewPart => ({
  key: part.key,
  shapeId: part.shapeId,
  instanceIndex: part.instanceIndex,
  placement: part.placement,
  outlines: part.outlines,
  source: sourceOf(shapes.get(part.shapeId)),
  status: 'placed',
  notices: [],
})

const noticeFor = (finding: PlacementFinding): ReviewNotice =>
  finding.kind === 'sheet-unresolved'
    ? {
        severity: 'warning',
        code: 'PLACEMENT_SHEET_UNRESOLVED',
        message: messages.placementSheetUnresolved(finding.key),
        origin: 'review',
        partKey: finding.key,
      }
    : {
        severity: 'info',
        code: 'PLACEMENT_GEOMETRY_APPROXIMATE',
        message: messages.placementGeometryApproximate(finding.key),
        origin: 'review',
        sheetId: finding.sheetId,
        partKey: finding.key,
      }

/**
 * Resolves artifact placements into review parts without dropping or guessing any of them and
 * explains every fallback in pt-BR.
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
  const placed = placedParts(layout, sheets)
  const partsBySheet = new Map<string, readonly ReviewPart[]>()
  for (const [sheetId, parts] of placed.partsBySheet) {
    partsBySheet.set(sheetId, parts.map((part) => toReviewPart(part, shapes)))
  }
  return { partsBySheet, notices: placed.findings.map(noticeFor) }
}
