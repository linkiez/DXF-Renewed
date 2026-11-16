import type { CutAction } from '../cutPath/types'
import { actionCategory } from '../linking/actionCategory'
import { actionDuration } from '../linking/actionDuration'
import type { ActionSpeeds } from '../linking/actionDuration'
import { metadataNumber } from '../linking/metadataNumber'

/** Start and end of each action on the plan time axis, in seconds. */
export interface ActionSchedule {
  starts: (number | null)[]
  ends: (number | null)[]
}

/**
 * Lays the actions of one plan on a time axis using their durations.
 *
 * Time is null from the first action whose duration cannot be calculated, since later times
 * depend on it. Actions without a category take no time.
 *
 * @param actions - Ordered actions of one sheet plan.
 * @param lengths - Geometric length of each action in geometry units.
 * @param speeds - Cutting and rapid speeds and the pierce dwell.
 * @param geometryUnitsPerMeter - Geometry units in one meter.
 * @returns Start and end seconds per action.
 */
export function actionSchedule(
  actions: readonly CutAction[],
  lengths: readonly number[],
  speeds: ActionSpeeds,
  geometryUnitsPerMeter: number,
): ActionSchedule {
  const starts: (number | null)[] = []
  const ends: (number | null)[] = []
  let clock: number | null = 0
  actions.forEach((action, index) => {
    starts.push(clock)
    const category = actionCategory(action.kind)
    const seconds = category === undefined ? 0 : actionDuration(
      { category, length: lengths[index], feed: metadataNumber(action.metadata?.feed), dwell: metadataNumber(action.metadata?.dwell) },
      speeds,
      geometryUnitsPerMeter,
    )
    clock = clock === null || seconds === null ? null : clock + seconds
    ends.push(clock)
  })
  return { starts, ends }
}
