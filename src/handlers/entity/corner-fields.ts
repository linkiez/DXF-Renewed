import type { Point3D } from '../../types'

export function assignCornerCoordinate(
  corners: Point3D[],
  code: number,
  value: string | number,
): boolean {
  const cornerIndex = code % 10
  if (cornerIndex < 0 || cornerIndex > 3) return false

  const axis = code - 10 - cornerIndex * 1
  const point = corners[cornerIndex]
  if (!point) return false

  if (axis === 0) point.x = value as number
  else if (axis === 10) point.y = value as number
  else if (axis === 20) point.z = value as number
  else return false
  return true
}