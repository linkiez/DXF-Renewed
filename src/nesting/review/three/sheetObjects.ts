import type * as ThreeModule from 'three'
import type { ReviewSheet } from '../types'
import { buildBuffers } from './buffers'
import type { TimelineBuffers } from './buffers'
import { LINE_KINDS } from './lineKinds'
import type { LineKind } from './lineKinds'
import { PALETTE } from './palette'
import type { ThreeNamespace } from './threeNamespace'

type Disposable = { dispose(): void }

/** What the builder needs from the renderer: the namespace, the scene and a disposal registry. */
export interface BuildContext {
  three: ThreeNamespace
  scene: ThreeModule.Scene
  own<T extends Disposable>(item: T): T
}

/** Every object of one sheet's scene, kept so a frame only updates ranges and positions. */
export interface SheetObjects {
  sheetId: string
  buffers: TimelineBuffers | null
  trail: Map<LineKind, ThreeModule.LineSegments>
  ghost: Map<LineKind, ThreeModule.LineSegments>
  current: ThreeModule.LineSegments
  currentAttribute: ThreeModule.Float32BufferAttribute
  selection: ThreeModule.LineSegments
  selectionAttribute: ThreeModule.Float32BufferAttribute
  selectionKey: string
  pierceTrail: ThreeModule.InstancedMesh
  tabTrail: ThreeModule.InstancedMesh
  head: ThreeModule.Mesh
}

type Ring = readonly { x: number; y: number }[]

const rectangleSegments = (width: number, height: number): Float32Array =>
  new Float32Array([0, 0, 0, width, 0, 0, width, 0, 0, width, height, 0, width, height, 0, 0, height, 0, 0, height, 0, 0, 0, 0])

const segmentCount = (rings: readonly Ring[]): number =>
  rings.reduce((total, ring) => total + Math.max(0, ring.length - 1), 0)

const outlineSegments = (rings: readonly Ring[]): Float32Array => {
  const out = new Float32Array(segmentCount(rings) * 6)
  let cursor = 0
  for (const ring of rings) {
    for (let index = 1; index < ring.length; index += 1) {
      out.set([ring[index - 1].x, ring[index - 1].y, 0, ring[index].x, ring[index].y, 0], cursor)
      cursor += 6
    }
  }
  return out
}

const lineMaterial = (context: BuildContext, unit: number, color: number, kind?: LineKind, ghost = false): ThreeModule.Material => {
  const dash = kind ? PALETTE.dashes[kind] : undefined
  const params = { color, transparent: ghost, opacity: ghost ? PALETTE.ghostOpacity : 1 }
  const { three } = context
  return context.own(dash
    ? new three.LineDashedMaterial({ ...params, dashSize: dash[0] * unit, gapSize: dash[1] * unit })
    : new three.LineBasicMaterial(params))
}

const addLines = (context: BuildContext, positions: Float32Array, material: ThreeModule.Material, name: string, dashed: boolean): ThreeModule.LineSegments => {
  const geometry = context.own(new context.three.BufferGeometry())
  geometry.setAttribute('position', new context.three.Float32BufferAttribute(positions, 3))
  const object = new context.three.LineSegments(geometry, material)
  object.name = name
  object.frustumCulled = false
  if (dashed) object.computeLineDistances()
  context.scene.add(object)
  return object
}

const addDynamicLines = (context: BuildContext, segments: number, material: ThreeModule.Material, name: string) => {
  const geometry = context.own(new context.three.BufferGeometry())
  const attribute = new context.three.Float32BufferAttribute(new Float32Array(Math.max(1, segments) * 6), 3)
  geometry.setAttribute('position', attribute)
  geometry.setDrawRange(0, 0)
  const object = new context.three.LineSegments(geometry, material)
  object.name = name
  object.frustumCulled = false
  context.scene.add(object)
  return { object, attribute }
}

const addMarkers = (
  context: BuildContext,
  unit: number,
  marker: { centers: Float32Array; count: number },
  style: { sides: number; color: number; name: string; ghost: boolean },
): ThreeModule.InstancedMesh => {
  const { three } = context
  const geometry = context.own(new three.CircleGeometry(1.6 * unit, style.sides))
  const material = context.own(new three.MeshBasicMaterial({
    color: style.color, transparent: style.ghost, opacity: style.ghost ? PALETTE.ghostOpacity : 1,
  }))
  const mesh = new three.InstancedMesh(geometry, material, Math.max(1, marker.count))
  const matrix = new three.Matrix4()
  for (let index = 0; index < marker.count; index += 1) {
    mesh.setMatrixAt(index, matrix.makeTranslation(marker.centers[index * 2], marker.centers[index * 2 + 1], 0.1))
  }
  mesh.instanceMatrix.needsUpdate = true
  mesh.count = style.ghost ? marker.count : 0
  mesh.name = style.name
  mesh.frustumCulled = false
  context.scene.add(mesh)
  return mesh
}

const addKindLines = (context: BuildContext, unit: number, buffers: TimelineBuffers | null) => {
  const trail = new Map<LineKind, ThreeModule.LineSegments>()
  const ghost = new Map<LineKind, ThreeModule.LineSegments>()
  for (const kind of LINE_KINDS) {
    const positions = buffers?.lines.get(kind)?.positions ?? new Float32Array(0)
    const dashed = PALETTE.dashes[kind] !== undefined
    const color = PALETTE.colors[kind]
    trail.set(kind, addLines(context, positions, lineMaterial(context, unit, color, kind), `trail:${kind}`, dashed))
    ghost.set(kind, addLines(context, positions, lineMaterial(context, unit, color, kind, true), `ghost:${kind}`, dashed))
  }
  return { trail, ghost }
}

const EMPTY_MARKERS = { centers: new Float32Array(0), count: 0, before: new Uint32Array(1) }

/**
 * Builds every object of one sheet: boundary, parts, per-kind trail and ghost lines, markers, the
 * current action, the selection highlight and the head.
 *
 * @param context - Namespace, scene and disposal registry.
 * @param sheet - Sheet to build.
 * @returns References kept for frame updates; the object count does not depend on the plan size.
 */
export function buildSheetObjects(context: BuildContext, sheet: ReviewSheet): SheetObjects {
  const { three } = context
  const unit = Math.max(sheet.stock.width, sheet.stock.height) / 400
  addLines(context, rectangleSegments(sheet.stock.width, sheet.stock.height), lineMaterial(context, unit, PALETTE.sheet), 'sheet', false)
  const outlinesOf = (status: 'placed' | 'flagged') => sheet.parts.filter((part) => part.status === status).flatMap((part) => part.outlines)
  addLines(context, outlineSegments(outlinesOf('placed')), lineMaterial(context, unit, PALETTE.parts), 'part:placed', false)
  const flaggedMaterial = context.own(new three.LineDashedMaterial({ color: PALETTE.flagged, dashSize: 3 * unit, gapSize: 2 * unit }))
  addLines(context, outlineSegments(outlinesOf('flagged')), flaggedMaterial, 'part:flagged', true)

  const buffers = sheet.timeline ? buildBuffers(sheet.timeline) : null
  const { trail, ghost } = addKindLines(context, unit, buffers)
  const pierces = buffers?.pierces ?? EMPTY_MARKERS
  const tabs = buffers?.tabs ?? EMPTY_MARKERS
  addMarkers(context, unit, pierces, { sides: 24, color: PALETTE.pierce, name: 'ghost:pierce', ghost: true })
  const pierceTrail = addMarkers(context, unit, pierces, { sides: 24, color: PALETTE.pierce, name: 'trail:pierce', ghost: false })
  addMarkers(context, unit, tabs, { sides: 4, color: PALETTE.tab, name: 'ghost:tab-marker', ghost: true })
  const tabTrail = addMarkers(context, unit, tabs, { sides: 4, color: PALETTE.tab, name: 'trail:tab-marker', ghost: false })

  const maxActionSegments = buffers?.maxActionSegments ?? 0
  const current = addDynamicLines(context, maxActionSegments, lineMaterial(context, unit, PALETTE.colors.cut), 'current')
  const largestOutline = Math.max(0, ...sheet.parts.map((part) => segmentCount(part.outlines)))
  const selection = addDynamicLines(
    context, Math.max(largestOutline, maxActionSegments),
    context.own(new three.LineBasicMaterial({ color: PALETTE.highlight })), 'selection',
  )

  const head = new three.Mesh(
    context.own(new three.CircleGeometry(3 * unit, 24)),
    context.own(new three.MeshBasicMaterial({ color: PALETTE.highlight })),
  )
  head.name = 'head'
  head.position.set(0, 0, 0.5)
  head.visible = false
  context.scene.add(head)

  return {
    sheetId: sheet.id,
    buffers,
    trail,
    ghost,
    current: current.object,
    currentAttribute: current.attribute,
    selection: selection.object,
    selectionAttribute: selection.attribute,
    selectionKey: '',
    pierceTrail,
    tabTrail,
    head,
  }
}
