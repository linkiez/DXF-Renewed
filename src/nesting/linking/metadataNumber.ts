/**
 * Reads a numeric action metadata value.
 *
 * @param value - Scalar metadata value of a cut action.
 * @returns The value when it is a finite number, else `null`.
 * @example
 * ```typescript
 * const feed = metadataNumber(action.metadata?.feed)
 * ```
 */
export function metadataNumber(value: string | number | boolean | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}
