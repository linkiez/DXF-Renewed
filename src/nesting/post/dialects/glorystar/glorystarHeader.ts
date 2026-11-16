/**
 * Header of a GloryStar program: loader block, sheet data and the jump to the start of the track.
 *
 * @param sheet - Sheet length (machine X) and width (machine Y).
 * @param thickness - Material thickness in millimetres (written in micrometres in the data exchange).
 * @returns The lines.
 */
export function glorystarHeader(sheet: { readonly length: number; readonly width: number }, thickness: number): string[] {
  const { length, width } = sheet
  return [
    '%',
    ';Laser machine G834 (Run-time working table selection) test program',
    `G2292,S1,X0,Y0,Z0,U${length},V${width},W1`,
    `SHP(0,0,0,${length},${width},${thickness})`,
    'G64',
    'G90',
    'G168',
    ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
    ';Data exchange with loading device',
    'SYN',
    '%Sheet_Load_Inp.I_Materiale = 1      ; Material id',
    `%Sheet_Load_Inp.I_Spessore  = ${thickness * 1000} ; Material thickness [um]`,
    `%Sheet_Load_Inp.I_Lunghezza = ${length}    ; Sheet length`,
    `%Sheet_Load_Inp.I_Larghezza = ${width}    ; Sheet width`,
    ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
    ';Commands for loading database',
    'JMPF (start_track)',
    'N0',
    'JSR "inizio.cfs"',
    'JSR "Apa.cfs"',
  ]
}
