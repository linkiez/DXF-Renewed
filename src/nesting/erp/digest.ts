import { canonicalize, type CanonicalInput } from './canonical'
import type { ErpDigest } from './types'

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Calculates a browser-compatible SHA-256 digest for canonical JSON.
 *
 * @param value - JSON-compatible value to hash.
 * @returns A lowercase hexadecimal SHA-256 digest.
 */
export async function digestCanonical(value: CanonicalInput): Promise<ErpDigest> {
  const encoded = new TextEncoder().encode(canonicalize(value))
  const digest = await globalThis.crypto.subtle.digest('SHA-256', encoded)
  return {
    algorithm: 'sha256',
    value: toHex(new Uint8Array(digest)),
  }
}
