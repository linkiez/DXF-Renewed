import type { PartialPoint3D } from '../../types'

export function assignSegmentCoordinate(
  first: PartialPoint3D,
  second: PartialPoint3D,
  code: number,
  value: string | number,
): boolean {
  const isFirstPoint = code === 10 || code === 20 || code === 30
  const isSecondPoint = code === 11 || code === 21 || code === 31
  let point: PartialPoint3D | undefined
  if (isFirstPoint) point = first
  else if (isSecondPoint) point = second
  if (!point) return false

  const axis = Math.floor(code / 10)
  if (axis === 1) point.x = value as number
  else if (axis === 2) point.y = value as number
  else if (axis === 3) point.z = value as number
  else return false
  return true
}