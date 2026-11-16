/** Flame-off lines and whether the head ended up raised. */
export interface GlorystarFlameOff {
  readonly lines: string[]
  /** True after a head-up travel: the next contour starts with the head-up rapid. */
  readonly headUp: boolean
}

/**
 * Choose the flame-off between two contours from the length of the travel.
 *
 * Below `headDownMaxDistance` the head stays down (`G840 L10`); below `jumpMaxDistance` it jumps (`G840 L5`); beyond
 * that it is raised (`G840 L0` with the safe retraction). After the last contour nothing is written: the ending
 * retracts the head.
 *
 * @param travel - Straight distance to the next contour; `undefined` after the last one.
 * @param dialect - Head-down and jump thresholds.
 * @returns The lines and the head state.
 */
export function glorystarFlameOff(
  travel: number | undefined,
  dialect: { readonly headDownMaxDistance: number; readonly jumpMaxDistance: number },
): GlorystarFlameOff {
  if (travel === undefined) return { lines: [], headUp: true }
  if (travel < dialect.headDownMaxDistance) return { lines: ['G840 L10'], headUp: false }
  if (travel < dialect.jumpMaxDistance) return { lines: ['G840 L5'], headUp: false }
  return { lines: ['G840 L0', 'G180,X0,Y0,Z(0.0+workpiece_safe_dist)', 'G153,G0,Z(kine_z+head_safe_dist)'], headUp: true }
}
