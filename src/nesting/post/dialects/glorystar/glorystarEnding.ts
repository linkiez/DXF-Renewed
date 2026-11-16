/** Ending of a GloryStar program: head-up retraction, end of the track and program end. */
export function glorystarEnding(): string[] {
  return ['G840 L0', 'G153,G0,Z(trav_safe_z)', 'G169', 'M498', 'JSR "fine.cfs"', 'M30']
}
