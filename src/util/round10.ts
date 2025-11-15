// This is based on the example code found from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor
// Example code on MDN is public domain or CC0 (your preference) or MIT depending when the
// example code was added:
// https://developer.mozilla.org/en-US/docs/MDN/About

export default function round10(value: number, exp?: number): number {
  // If the exp is undefined or zero...
  if (exp === undefined || +exp === 0) {
    return Math.round(value)
  }
  const numValue = +value
  const numExp = +exp
  // If the value is not a number or the exp is not an integer...
  if (Number.isNaN(numValue) || !(typeof numExp === 'number' && numExp % 1 === 0)) {
    return Number.NaN
  }
  // Shift
  let valueStr = numValue.toString().split('e')
  const roundedValue = Math.round(+(valueStr[0] + 'e' + (valueStr[1] ? +valueStr[1] - numExp : -numExp)))
  // Shift back
  valueStr = roundedValue.toString().split('e')
  return +(valueStr[0] + 'e' + (valueStr[1] ? +valueStr[1] + numExp : numExp))
}
