const DECIMALS = 3

/**
 * Formats a number for user text in Brazilian Portuguese: decimal comma, at most three decimals and
 * no trailing zeros, independent of the runtime locale.
 *
 * @param value - Finite number to format.
 * @returns The text, for example `3,5`.
 * @example
 * ```typescript
 * formatQuantity(3.5) // '3,5'
 * ```
 */
export function formatQuantity(value: number): string {
  return String(Number(value.toFixed(DECIMALS))).replace('.', ',')
}
