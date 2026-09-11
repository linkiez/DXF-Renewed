export function assignPointCoordinate(
  entity: { x?: number; y?: number; z?: number },
  code: number,
  value: string | number,
): boolean {
  switch (code) {
    case 10:
      entity.x = value as number
      return true
    case 20:
      entity.y = value as number
      return true
    case 30:
      entity.z = value as number
      return true
    default:
      return false
  }
}