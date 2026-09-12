import denormalise from '../../../denormalise'
import entityToPolyline from '../../../entityToPolyline'
import applyTransforms from '../../../applyTransforms'
import parseString from '../../../parseString'
import type { PreparationIssue, SourceRef } from '../types'

export interface RawContour {
  source: SourceRef
  vertices: [number, number][]
  closed: boolean
}

type ParseResult = Parameters<typeof denormalise>[0]
type Polyline = Parameters<typeof applyTransforms>[0]
type Transforms = Parameters<typeof applyTransforms>[1]

const EPS = 1e-9
const CLOSED_TYPES = new Set(['CIRCLE', 'SOLID', 'TRACE'])

function samePoint(a: number[], b: number[]): boolean {
  return Math.abs(a[0] - b[0]) <= EPS && Math.abs(a[1] - b[1]) <= EPS
}

function isClosedEntity(entity: unknown, vertices: Polyline): boolean {
  const e = entity as { closed?: boolean; shape?: boolean; type?: string }
  if (e.closed === true || e.shape === true) return true
  if (CLOSED_TYPES.has(String(e.type))) return true
  return vertices.length > 2 && samePoint(vertices[0], vertices[vertices.length - 1])
}

function sourceOf(entity: unknown, index: number): SourceRef {
  const e = entity as { handle?: string; name?: string; layer?: string; type?: string }
  return {
    handle: String(e.handle ?? e.name ?? `entity-${index}`),
    layer: String(e.layer ?? '0'),
    entityType: String(e.type ?? 'UNKNOWN'),
  }
}

/** `{ entities }` may be a full ParsedDXF or a bare entity list. */
function toParseResult(input: string | { entities: unknown[] }): ParseResult {
  if (typeof input === 'string') return parseString(input) as unknown as ParseResult
  const obj = input as {
    header?: unknown
    blocks?: unknown
    entities?: unknown
    objects?: unknown
    tables?: unknown
  }
  return {
    header: obj.header ?? {},
    blocks: obj.blocks ?? [],
    entities: obj.entities ?? [],
    objects: obj.objects ?? { layouts: [] },
    tables: obj.tables ?? { layers: {}, styles: {}, ltypes: {} },
  } as unknown as ParseResult
}

/** Extract closed/open contours with source traceability (FR-001, FR-002). */
export function extractContours(
  input: string | { entities: unknown[] },
  issues: PreparationIssue[],
): RawContour[] {
  const contours: RawContour[] = []

  denormalise(toParseResult(input)).forEach((entity, index) => {
    const source = sourceOf(entity, index)
    let polyline: Polyline
    try {
      const raw = entityToPolyline(entity as Parameters<typeof entityToPolyline>[0])
      const transforms = (entity as { transforms?: Transforms }).transforms
      polyline = applyTransforms(raw, transforms)
    } catch {
      issues.push({
        code: 'UNSUPPORTED_ENTITY',
        severity: 'rejection',
        source,
        detail: `cannot convert ${source.entityType}`,
      })
      return
    }
    if (!polyline || polyline.length < 2) {
      issues.push({
        code: 'UNSUPPORTED_ENTITY',
        severity: 'rejection',
        source,
        detail: `no geometry for ${source.entityType}`,
      })
      return
    }
    contours.push({
      source,
      vertices: polyline.map((p) => [p[0], p[1]] as [number, number]),
      closed: isClosedEntity(entity, polyline),
    })
  })

  return contours
}
