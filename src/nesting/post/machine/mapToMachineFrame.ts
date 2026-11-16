import type { Point2D } from '../../types'
import type { MachineFrame } from './types'

interface Sheet {
  readonly width: number
  readonly height: number
}

function rotate(point: Point2D, sheet: Sheet, degrees: MachineFrame['rotationDegrees']): { x: number; y: number; width: number; height: number } {
  switch (degrees) {
    case 90: return { x: sheet.height - point.y, y: point.x, width: sheet.height, height: sheet.width }
    case 180: return { x: sheet.width - point.x, y: sheet.height - point.y, width: sheet.width, height: sheet.height }
    case 270: return { x: point.y, y: sheet.width - point.x, width: sheet.height, height: sheet.width }
    default: return { x: point.x, y: point.y, width: sheet.width, height: sheet.height }
  }
}

/**
 * Map a nesting point into the machine frame of a configuration.
 *
 * The sheet is rotated counter-clockwise about its bottom-left corner and translated so that the rotated
 * sheet starts at the origin; then the zero moves to the declared table corner.
 *
 * @param point - Point in nesting coordinates (zero at the sheet's bottom-left).
 * @param sheet - Sheet size in nesting coordinates.
 * @param frame - Rotation and zero corner of the machine.
 * @returns The point in machine coordinates.
 * @throws {RangeError} When a coordinate is not finite.
 */
export function mapToMachineFrame(point: Point2D, sheet: Sheet, frame: MachineFrame): Point2D {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) throw new RangeError('Point coordinates must be finite.')
  const rotated = rotate(point, sheet, frame.rotationDegrees)
  const x = frame.origin === 'bottom-right' || frame.origin === 'top-right' ? rotated.x - rotated.width : rotated.x
  const y = frame.origin === 'top-left' || frame.origin === 'top-right' ? rotated.y - rotated.height : rotated.y
  return { x, y }
}
