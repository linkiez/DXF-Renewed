const ENDING = ['o<process_end> call', 'o110 endrepeat', 'o<endpos> call', 'M65 P3', 'M2'] as const

/** Fixed ending block of a Talvi program, as in the controller's real programs. */
export function talviEnding(): string[] {
  return [...ENDING]
}
