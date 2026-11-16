import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect } from 'expect'
import { firstValueFrom } from 'rxjs'
import {
  calculateErpNesting,
  planCutPath,
  prepareParts,
} from '../../../src/nesting'
import type {
  CutContour,
  CutLayout,
  CutProcessProfile,
  NestableShape,
  Placement,
  Point2D,
  StockItem,
} from '../../../src/nesting'
import { computeBoundingBox } from '../../../src/nesting/polygonUtils'
import { buildReviewScene } from '../../../src/nesting/review/buildScene'
import { inspect } from '../../../src/nesting/review/inspect'
import { pickAt } from '../../../src/nesting/review/pick'
import { renderReviewSvg } from '../../../src/nesting/review/renderSvg'
import { stateAt } from '../../../src/nesting/review/stateAt'
import { summarize } from '../../../src/nesting/review/summary'
import type { ErpNestingArtifact } from '../../../src/nesting/erp/types'

const MAX_PARTS = 16
const FIXTURES = join(process.cwd(), 'test', 'resources', 'nest-fixtures')

const toShape = (id: string, ring: [number, number][], layer: string, handle: string): NestableShape => {
  const vertices: Point2D[] = ring.map(([x, y]) => ({ x, y }))
  const closed = vertices[0].x === vertices[vertices.length - 1].x && vertices[0].y === vertices[vertices.length - 1].y
    ? vertices
    : [...vertices, vertices[0]]
  const bbox = computeBoundingBox(closed)
  const area = Math.abs(closed.reduce((sum, v, i) => {
    const w = closed[(i + 1) % closed.length]
    return sum + (v.x * w.y - w.x * v.y)
  }, 0) / 2)
  return {
    id, layer, originalHandle: handle, vertices: closed, bbox, area,
    perimeter: closed.reduce((sum, v, i) => (i === 0 ? 0 : sum + Math.hypot(v.x - closed[i - 1].x, v.y - closed[i - 1].y)), 0),
    centroid: { x: bbox.minX + bbox.width / 2, y: bbox.minY + bbox.height / 2 },
    allowedRotations: [0, 90, 180, 270], kerf: 0, isHole: false,
  }
}

const rigid = (from: Point2D[], to: Point2D[]) => {
  const angle = Math.atan2(to[1].y - to[0].y, to[1].x - to[0].x) - Math.atan2(from[1].y - from[0].y, from[1].x - from[0].x)
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const tx = to[0].x - (cos * from[0].x - sin * from[0].y)
  const ty = to[0].y - (sin * from[0].x + cos * from[0].y)
  return (p: Point2D): Point2D => ({ x: cos * p.x - sin * p.y + tx, y: sin * p.x + cos * p.y + ty })
}

const PROFILE: CutProcessProfile = {
  sequence: { strategy: 'nearest-neighbour', budgetFactor: 1 },
  lead: { type: 'none', length: 0, angle: 0, placement: 'outside' },
  pierce: { clearance: 0.5 },
  tabs: { enabled: false },
  overcut: { enabled: false },
  clearance: { contour: 0.1, tab: 0.1, keptMaterial: 0.1 },
  commonLine: { enabled: false, tolerance: 0.001 },
}

describe('review — real DXF parts (nest-fixtures)', function () {
  this.timeout(180_000)

  const files = readdirSync(FIXTURES).filter((name) => name.startsWith('LPEL-') && name.endsWith('.dxf')).sort()
  let artifact: ErpNestingArtifact
  let layout: CutLayout
  let shapesById: Map<string, NestableShape>

  before(async () => {
    const shapes: NestableShape[] = []
    const holesByPart = new Map<string, NestableShape[]>()
    for (const name of files) {
      const result = await firstValueFrom(prepareParts(readFileSync(join(FIXTURES, name), 'utf8'), { tolerance: 0.1, cutWidthAllowance: 0 }))
      result.parts.forEach((part, partIndex) => {
        const id = `${name.replace('.dxf', '')}-${partIndex}`
        shapes.push(toShape(id, part.outer.vertices, part.outer.source.layer, part.outer.source.handle))
        holesByPart.set(id, part.holes.map((hole, index) => toShape(`${id}-hole-${index}`, hole.vertices, hole.source.layer, hole.source.handle)))
      })
    }
    shapes.splice(MAX_PARTS)
    shapesById = new Map(shapes.map((shape) => [shape.id, shape]))
    const totalArea = shapes.reduce((sum, shape) => sum + shape.bbox.width * shape.bbox.height, 0)
    const largest = Math.max(...shapes.map((s) => Math.max(s.bbox.width, s.bbox.height)))
    const side = Math.ceil(Math.max(largest * 1.5, Math.sqrt(totalArea / 0.25)))
    const stock: StockItem[] = [
      { id: 'real-sheet-1', kind: 'sheet', width: side, height: side },
      { id: 'real-sheet-2', kind: 'sheet', width: side, height: side },
    ]
    artifact = await firstValueFrom(calculateErpNesting({
      contractVersion: 1,
      correlation: { orderId: 'LPEL', revisionId: 'r1', requestId: 'real-1' },
      job: {
        parts: shapes.map((shape) => ({ shape, quantity: 1 })),
        stock,
        machine: { id: 'laser', revision: '1', capabilities: {} },
        processProfile: { id: 'profile', revision: '1', settings: {} },
        nesting: { edgeClearance: 5, partToPartClearance: 3 },
      },
      seed: 7,
    }))

    const contours: CutContour[] = []
    for (const placement of artifact.layout?.placements ?? []) {
      const outer = shapesById.get(placement.shapeId) as NestableShape
      const transform = rigid(outer.vertices.slice(0, 2), (placement.transformedVertices as Point2D[]).slice(0, 2))
      const sheetId = placement.sheetId as string
      const partId = `${placement.shapeId}#${placement.instanceIndex ?? 0}`
      const holes = holesByPart.get(placement.shapeId) ?? []
      holes.forEach((hole, index) => {
        const moved: Placement = { ...placement, shapeId: hole.id, transformedVertices: hole.vertices.map(transform), bbox: computeBoundingBox(hole.vertices.map(transform)) }
        contours.push({ id: `${partId}-hole-${index}`, partId, sheetId, shape: hole, placement: moved, isOuter: false, parentContourId: `${partId}-outer` })
      })
      contours.push({ id: `${partId}-outer`, partId, sheetId, shape: outer, placement, isOuter: true })
    }
    const used = new Set((artifact.layout?.placements ?? []).map((placement) => placement.sheetId))
    layout = { sheets: stock.filter((item) => used.has(item.id)), contours, startPoint: { x: 0, y: 0 } }
  })

  it('nests every real part and keeps the artifact reviewable', () => {
    expect(files.length).toBeGreaterThanOrEqual(10)
    expect(artifact.status === 'complete' || artifact.status === 'partial').toBe(true)
    expect(artifact.layout?.placements.length).toBeGreaterThanOrEqual(MAX_PARTS)
    console.log(`real parts: ${files.length} files, placements ${artifact.layout?.placements.length}, unplaced ${artifact.unplaced.length}, sheets ${layout.sheets.length}`)
  })

  it('reviews the real layout and cut plan with every placement linked and drawn', () => {
    const cutPlan = planCutPath(layout, PROFILE)
    const scene = buildReviewScene({ artifact, layout, cutPlan })
    const placed = artifact.layout?.placements.length ?? 0

    expect(scene.summary.partCount).toBe(placed)
    expect(scene.notices.filter((n) => n.code === 'UNKNOWN_PART' || n.code === 'UNLINKED_ACTION')).toEqual([])
    expect(scene.notices.filter((n) => n.code === 'PLACEMENT_SHEET_UNRESOLVED' || n.code === 'PLAN_SHEET_MISSING')).toEqual([])
    expect(scene.sheets.length).toBe(layout.sheets.length)
    for (const sheet of scene.sheets) {
      const svg = renderReviewSvg(scene, { sheetId: sheet.id })
      for (const part of sheet.parts) expect(svg).toContain(`data-part-key="${part.key}"`)
      const linked = (sheet.timeline?.actions ?? []).filter((a) => a.contourId)
      expect(linked.every((a) => a.partKey !== undefined)).toBe(true)
    }
    console.log(`review: valid ${cutPlan.valid}, problems ${cutPlan.problems.length}, status ${scene.status}, ${summarize(scene)}`)
  })

  it('inspects a real part with its drawing layer and handle, and picks it back by position', () => {
    const scene = buildReviewScene({ artifact, layout, cutPlan: planCutPath(layout, PROFILE) })
    const sheet = scene.sheets.find((s) => s.parts.length > 0)
    if (!sheet) throw new Error('no placed part')
    const part = sheet.parts[0]
    const rows = Object.fromEntries(inspect(scene, { kind: 'part', sheetId: sheet.id, partKey: part.key }).rows.map((r) => [r.label, r.value]))

    expect(rows['Camada']).toBeDefined()
    expect(rows['Identificador de origem']).toBeDefined()
    expect(rows['Pedido']).toBe('LPEL')
    const ring = part.outlines[0]
    const inside = ring.reduce((acc, p) => ({ x: acc.x + p.x / ring.length, y: acc.y + p.y / ring.length }), { x: 0, y: 0 })
    const hit = pickAt(scene, sheet.id, inside, 0.01)
    expect(hit).not.toBeNull()
  })

  it('plays the real plan deterministically from start to end', () => {
    const scene = buildReviewScene({ artifact, layout, cutPlan: planCutPath(layout, PROFILE) })
    const sheet = scene.sheets.find((s) => (s.timeline?.actions.length ?? 0) > 0)
    if (!sheet?.timeline) throw new Error('no timeline')
    const total = sheet.timeline.actions.length

    const end = stateAt(scene, { sheetId: sheet.id, actionIndex: total, progress: 0 })
    const middle = stateAt(scene, { sheetId: sheet.id, actionIndex: Math.floor(total / 2), progress: 0.5 })

    expect(end.completed).toBe(total)
    expect(end.head).not.toBeNull()
    expect(middle.head).not.toBeNull()
    expect(stateAt(scene, { sheetId: sheet.id, actionIndex: Math.floor(total / 2), progress: 0.5 })).toEqual(middle)
  })
})
