import type { Contour } from '../contourBlocks'

/**
 * Quality number of a contour, read from the `quality` metadata of its actions.
 *
 * @param contour - Contour to read.
 * @returns The quality text, or `undefined` when no action carries a non-empty one.
 */
export function contourQuality(contour: Contour): string | undefined {
  const actions = [contour.pierce, ...contour.motions.map((m) => m.action)]
  const value = actions.find((a) => a.metadata?.quality !== undefined && a.metadata.quality !== '')?.metadata?.quality
  return value === undefined ? undefined : String(value)
}
