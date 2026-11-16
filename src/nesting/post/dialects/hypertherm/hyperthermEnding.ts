/** Ending lines of a Hypertherm program: cancel all stations and end the program. */
export function hyperthermEnding(): string[] {
  return ['M19', 'M02']
}
