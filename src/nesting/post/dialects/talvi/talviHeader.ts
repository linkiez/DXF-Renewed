import { formatNumber } from '../../gcode/formatNumber'

/**
 * Header comments of a Talvi program: contour count, used size and tools.
 *
 * @param contourCount - Number of contours.
 * @param extents - Width and height of the bounding box of the mapped cut points.
 * @param sizeDecimals - Decimals of the size comment.
 * @returns The three header lines.
 */
export function talviHeader(contourCount: number, extents: { readonly width: number; readonly height: number }, sizeDecimals: number): string[] {
  const size = `${formatNumber(extents.width, sizeDecimals, true)}*${formatNumber(extents.height, sizeDecimals, true)}`
  return [`(TotalContour=${contourCount})`, `(Size=${size})`, '(Tools=1)']
}
