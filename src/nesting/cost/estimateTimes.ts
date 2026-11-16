import { actionDuration } from '../linking/actionDuration'
import type { ActionSpeeds } from '../linking/actionDuration'
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

const sumSeconds = (
  actions: readonly ActionUsage[],
  category: ActionUsage['category'],
  speeds: ActionSpeeds,
  unitsPerMeter: number,
): number | null => {
  let total = 0
  for (const action of actions.filter((a) => a.category === category)) {
    const seconds = actionDuration(action, speeds, unitsPerMeter)
    if (seconds === null) return null
    total += seconds
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
  const speeds: ActionSpeeds = {
    cutting: model.speeds?.cutting?.value,
    rapid: model.speeds?.rapid?.value,
    pierceDwellSeconds: model.speeds?.pierceDwellSeconds?.value,
  }
  return {
    cutLength: lengthOf(actions, 'cut'),
    travelLength: lengthOf(actions, 'travel'),
    pierceCount: actions.filter((a) => a.category === 'pierce').length,
    cuttingSeconds: sumSeconds(actions, 'cut', speeds, unitsPerMeter),
    travelSeconds: sumSeconds(actions, 'travel', speeds, unitsPerMeter),
    pierceSeconds: sumSeconds(actions, 'pierce', speeds, unitsPerMeter),
  }
}
