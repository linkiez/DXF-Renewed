const PREPARATION = [
  'G21',
  'G90',
  'G64 P0.03 Q0.001',
  '#5399=0.1',
  'o<process_start> call',
  'M64 P3',
  'o<runframework> call',
  'o110 repeat[1]',
] as const

/** Fixed preparation block of a Talvi program, as in the controller's real programs. */
export function talviPreparation(): string[] {
  return [...PREPARATION]
}
