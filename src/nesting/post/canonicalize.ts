/**
 * Normalize G-code without changing command order or numeric tokens.
 *
 * @param gcode - G-code text to normalize.
 * @returns Canonical text with LF endings, trimmed line whitespace, and one final newline.
 */
export function canonicalizeGcode(gcode: string): string {
  return `${gcode.replace(/\r\n?/g, '\n').split('\n').map((line) => line.trimEnd()).join('\n').replace(/\n+$/, '')}\n`
}
