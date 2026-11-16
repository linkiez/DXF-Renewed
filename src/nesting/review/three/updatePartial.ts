import type * as ThreeModule from 'three'
import { actionPrefix } from '../actionPrefix'
import type { ReviewToolState } from '../types'
import type { LineKind } from './lineKinds'
import type { SheetObjects } from './sheetObjects'

/**
 * Draws the executed part of the current action and picks its material.
 *
 * @param objects - Objects of the current sheet.
 * @param state - Tool state at the position.
 * @param progress - Progress inside the current action.
 * @param materialFor - Solid material for an action kind.
 */
export function updatePartial(
  objects: SheetObjects,
  state: ReviewToolState,
  progress: number,
  materialFor: (kind: LineKind) => ThreeModule.Material,
): void {
  const action = state.current
  const drawable = action !== null && action.kind !== 'pierce' && action.kind !== 'end'
  const path = drawable && progress > 0 ? actionPrefix(action, progress) : []
  const array = objects.currentAttribute.array as Float32Array
  const limit = Math.min(Math.max(0, path.length - 1), Math.floor(array.length / 6))
  for (let step = 0; step < limit; step += 1) {
    array.set([path[step].x, path[step].y, 0, path[step + 1].x, path[step + 1].y, 0], step * 6)
  }
  objects.currentAttribute.needsUpdate = true
  objects.current.geometry.setDrawRange(0, limit * 2)
  if (drawable) objects.current.material = materialFor(action.kind as LineKind)
}
