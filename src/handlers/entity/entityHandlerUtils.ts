/**
 * Shared entity handler utilities
 * ponytail: extracted common 3D point parsing from image/wipeout, add when new entities need 3D vectors
 */

import type { PartialPoint3D } from '../../types'

export interface Point3DFields {
  insertionPoint?: PartialPoint3D
  uVector?: PartialPoint3D
  vVector?: PartialPoint3D
}

/**
 * Parse 3D point group codes (10/20/30, 11/21/31, 12/22/32)
 * Returns true if handled, false if not a 3D point code
 */
export function parse3DPoint(
  type: number,
  value: unknown,
  entity: Point3DFields,
  pointField: 'insertionPoint' | 'uVector' | 'vVector',
): boolean {
  let baseCode: number
  if (pointField === 'insertionPoint') baseCode = 10
  else if (pointField === 'uVector') baseCode = 11
  else baseCode = 12

  if (type === baseCode) {
    entity[pointField] ??= {}
    entity[pointField]!.x = value as number
    return true
  }
  if (type === baseCode + 10) {
    entity[pointField] ??= {}
    entity[pointField]!.y = value as number
    return true
  }
  if (type === baseCode + 20) {
    entity[pointField] ??= {}
    entity[pointField]!.z = value as number
    return true
  }

  return false
}
