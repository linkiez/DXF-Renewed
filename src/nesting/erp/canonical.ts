export type CanonicalPrimitive = null | boolean | number | string
export type CanonicalInput =
  | CanonicalPrimitive
  | readonly CanonicalInput[]
  | object

const VOLATILE_KEYS = new Set([
  'requestedAt',
  'completedAt',
  'timestamp',
  'timings',
  'processingTime',
  'logs',
  'inputDigest',
  'outputDigest',
])

function normalize(value: CanonicalInput): CanonicalInput {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new TypeError('Canonical JSON does not support non-finite numbers')
    }
    return Object.is(value, -0) ? 0 : value
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalize(item))
  }

  const record = value as Record<string, CanonicalInput>
  return Object.keys(record)
    .filter((key) => !VOLATILE_KEYS.has(key))
    .sort()
    .reduce<Record<string, CanonicalInput>>((result, key) => {
      result[key] = normalize(record[key])
      return result
    }, {})
}

/**
 * Serializes a value with recursively sorted keys and volatile fields removed.
 *
 * @param value - JSON-compatible value to serialize.
 * @returns Deterministic compact JSON.
 */
export function canonicalize(value: CanonicalInput): string {
  const serialized = JSON.stringify(normalize(value))
  if (serialized === undefined) {
    throw new TypeError('Unable to serialize canonical JSON')
  }
  return serialized
}
