/**
 * Rounds exact shares to integers that add up to the rounded sum of the shares.
 *
 * Largest remainder method: every share gets its integer part, and the missing units go to the
 * largest fractional remainders; ties go to the earlier index, so the result is repeatable.
 *
 * @param exact - Non-negative exact shares, in a fixed order.
 * @returns Integers in the same order whose sum is `Math.round(sum(exact))`.
 */
export function apportion(exact: readonly number[]): number[] {
  const floors = exact.map((value) => Math.floor(value))
  const target = Math.round(exact.reduce((total, value) => total + value, 0))
  let missing = target - floors.reduce((total, value) => total + value, 0)
  const order = exact
    .map((value, index) => ({ index, remainder: value - floors[index] }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index)
  const result = [...floors]
  for (const { index } of order) {
    if (missing <= 0) break
    result[index] += 1
    missing -= 1
  }
  return result
}
