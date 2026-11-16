/**
 * Format a finite number for G-code with a fixed precision.
 *
 * Negative zero and values that round to zero from below are written without a sign.
 *
 * @param value - Finite number to format.
 * @param precision - Number of decimal places.
 * @param trailingZeros - Keep the fixed decimals (`1.5000`) instead of trimming them (`1.5`).
 * @returns Deterministic numeric text.
 * @throws {Error} When the value is not finite.
 */
export function formatNumber(value: number, precision: number, trailingZeros = false): string {
  if (!Number.isFinite(value)) throw new Error(`G-code numeric value must be finite: ${value}`)
  const fixed = value.toFixed(precision)
  const unsigned = /^-0(\.0*)?$/.test(fixed) ? fixed.slice(1) : fixed
  if (trailingZeros) return unsigned
  return unsigned.replace(/\.?0+$/, '') || '0'
}
