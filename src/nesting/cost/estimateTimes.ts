import type { ActionUsage } from './collectUsage'
import type { CostModel } from './types'

/** Lengths, counts and times measured from a set of actions. */
export interface ActionMeasures {
  cutLength: number
  travelLength: number
  pierceCount: number
  /** Seconds; null when a speed or dwell the actions need is absent. */
  cuttingSeconds: number | null
  travelSeconds: number | null
  pierceSeconds: number | null
}

const SECONDS_PER_MINUTE = 60

const secondsAt = (length: number, speedMetersPerMinute: number | undefined, unitsPerMeter: number): number | null => {
  if (length === 0) return 0
  if (speedMetersPerMinute === undefined || !(speedMetersPerMinute > 0)) return null
  return (length / unitsPerMeter / speedMetersPerMinute) * SECONDS_PER_MINUTE
}

const travelledSeconds = (
  actions: readonly ActionUsage[],
  category: 'cut' | 'travel',
  fallback: number | undefined,
  unitsPerMeter: number,
): number | null => {
  let total = 0
  for (const action of actions.filter((a) => a.category === category)) {
    const seconds = secondsAt(action.length, action.feed ?? fallback, unitsPerMeter)
    if (seconds === null) return null
    total += seconds
  }
  return total
}

const pierceSecondsOf = (actions: readonly ActionUsage[], fallback: number | undefined): number | null => {
  let total = 0
  for (const action of actions.filter((a) => a.category === 'pierce')) {
    const dwell = action.dwell ?? fallback
    if (dwell === undefined) return null
    total += dwell
  }
  return total
}

const lengthOf = (actions: readonly ActionUsage[], category: ActionUsage['category']): number =>
  actions.filter((a) => a.category === category).reduce((total, a) => total + a.length, 0)

/**
 * Measures lengths and pierce counts and estimates cutting, travel and pierce time.
 *
 * The `feed` and `dwell` carried by an action take precedence over the model values. A time is
 * `null` when the speed or dwell it needs is absent, never a guess.
 *
 * @param actions - Actions of a part, a sheet or the job.
 * @param model - Cost model with the speeds and the geometry unit.
 * @returns Lengths, pierce count and the three times in seconds.
 */
export function estimateTimes(actions: readonly ActionUsage[], model: CostModel): ActionMeasures {
  const unitsPerMeter = model.geometryUnitsPerMeter
  return {
    cutLength: lengthOf(actions, 'cut'),
    travelLength: lengthOf(actions, 'travel'),
    pierceCount: actions.filter((a) => a.category === 'pierce').length,
    cuttingSeconds: travelledSeconds(actions, 'cut', model.speeds?.cutting?.value, unitsPerMeter),
    travelSeconds: travelledSeconds(actions, 'travel', model.speeds?.rapid?.value, unitsPerMeter),
    pierceSeconds: pierceSecondsOf(actions, model.speeds?.pierceDwellSeconds?.value),
  }
}
