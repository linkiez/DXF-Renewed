import type * as ThreeModule from 'three'
import type { Point2D } from '../../types'
import type { ReviewOverlay } from '../types'
import type { ThreeNamespace } from './threeNamespace'

/** Objects of the overlay in the accelerated view. */
export interface OverlayLayer {
  readonly group: ThreeModule.Group
  /** Replaces what is drawn; `unit` is the size of one drawing unit of the sheet. */
  apply(overlay: ReviewOverlay | null, unit: number): void
  dispose(): void
}

const VALID = 0x15803d
const INVALID = 0xb91c1c
const HEAT = 0xf97316
const FREED = 0x0f766e
const MARKER = 0x7c2d12
const LAYER_Z = 0.6
const MARK_SIZE = 3

/**
 * Creates the layer that draws the overlay in the accelerated view.
 *
 * The ghost outline is dashed when the position is invalid and each violation adds a cross at the
 * anchor; heat cells over the limit are dashed and crossed, free parts are dotted and each finding is a
 * diamond, so nothing relies on colour. The text of the reasons is shown by the panels, because WebGL
 * draws no text.
 *
 * @param three - The injected `three` namespace.
 * @returns The layer; add its `group` to the scene.
 */
export function createOverlayLayer(three: ThreeNamespace): OverlayLayer {
  const group = new three.Group()
  let owned: { dispose(): void }[] = []
  const release = (): void => {
    owned.forEach((item) => item.dispose())
    owned = []
    while (group.children.length > 0) group.remove(group.children[0])
  }
  const lineOf = (vertices: readonly Point2D[], color: number, dashed: boolean, unit: number): ThreeModule.Line => {
    const geometry = new three.BufferGeometry().setFromPoints(vertices.map((p) => new three.Vector3(p.x, p.y, LAYER_Z)))
    const material = dashed
      ? new three.LineDashedMaterial({ color, dashSize: 3 * unit, gapSize: 2 * unit })
      : new three.LineBasicMaterial({ color })
    owned.push(geometry, material)
    const line = new three.Line(geometry, material)
    line.computeLineDistances()
    return line
  }
  const cross = (at: Point2D, unit: number): Point2D[][] => {
    const half = MARK_SIZE * unit
    return [
      [{ x: at.x - half, y: at.y - half }, { x: at.x + half, y: at.y + half }],
      [{ x: at.x - half, y: at.y + half }, { x: at.x + half, y: at.y - half }],
    ]
  }
  const addHeat = (overlay: ReviewOverlay, unit: number): void => {
    if (!overlay.heat?.available) return
    for (const cell of overlay.heat.cells) {
      const { x, y, size } = cell
      const ring = [{ x, y }, { x: x + size, y }, { x: x + size, y: y + size }, { x, y: y + size }, { x, y }]
      group.add(lineOf(ring, HEAT, cell.value > 1, unit))
      if (cell.value > 1) for (const stroke of cross({ x: x + size / 2, y: y + size / 2 }, unit)) group.add(lineOf(stroke, HEAT, false, unit))
    }
  }
  const addMarkers = (overlay: ReviewOverlay, unit: number): void => {
    const r = MARK_SIZE * unit
    for (const marker of overlay.markers ?? []) {
      const diamond = [{ x: marker.x, y: marker.y + r }, { x: marker.x + r, y: marker.y }, { x: marker.x, y: marker.y - r }, { x: marker.x - r, y: marker.y }, { x: marker.x, y: marker.y + r }]
      group.add(lineOf(diamond, MARKER, false, unit))
    }
  }
  const addGhost = (ghost: NonNullable<ReviewOverlay['ghost']>, unit: number): void => {
    group.add(lineOf(ghost.outline, ghost.valid ? VALID : INVALID, !ghost.valid, unit))
    ghost.marks.forEach((_, index) => {
      const at = { x: ghost.anchor.x, y: ghost.anchor.y - index * 2 * MARK_SIZE * unit }
      for (const stroke of cross(at, unit)) group.add(lineOf(stroke, INVALID, false, unit))
    })
  }
  return {
    group,
    apply(overlay, unit) {
      release()
      if (!overlay) return
      addHeat(overlay, unit)
      for (const part of overlay.freed ?? []) group.add(lineOf(part.outline, FREED, true, unit))
      addMarkers(overlay, unit)
      if (overlay.ghost) addGhost(overlay.ghost, unit)
    },
    dispose: release,
  }
}
