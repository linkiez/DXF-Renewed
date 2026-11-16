import type { ValueSource } from './types'

/**
 * Build the evidence of a configuration value.
 *
 * @param classification - Evidence class of the value.
 * @param reference - Document, file or confirmation that holds the evidence.
 * @param note - Optional free text, for example a known conflict between sources.
 * @returns The source.
 */
export function valueSource(classification: ValueSource['classification'], reference: string, note?: string): ValueSource {
  return { classification, reference, ...(note ? { note } : {}) }
}
