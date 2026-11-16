/**
 * Station and process selection lines (`M37 Tx` and `M36 Tx`).
 *
 * @param station - Station number.
 * @param process - Process number (1 is plasma 1).
 * @returns The two lines.
 */
export function hyperthermProcessSelect(station: number, process: number): string[] {
  return [`M37 T${station}`, `M36 T${process}`]
}
