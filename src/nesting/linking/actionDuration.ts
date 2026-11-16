import type { ActionCategory } from './actionCategory'

/** One action reduced to what its duration needs. */
export interface TimedAction {
  category: ActionCategory
  /** Geometric length in geometry units. */
  length: number
  /** Numeric `feed` carried by the action (meters per minute), when present. */
  feed: number | null
  /** Numeric `dwell` carried by the action (seconds), when present. */
  dwell: number | null
}

/** Speeds of a process, in meters per minute and seconds. */
export interface ActionSpeeds {
  cutting?: number
  rapid?: number
  pierceDwellSeconds?: number
}

const SECONDS_PER_MINUTE = 60

const secondsAt = (length: number, speed: number | undefined, unitsPerMeter: number): number | null => {
  if (length === 0) return 0
  if (speed === undefined || !(speed > 0)) return null
  return (length / unitsPerMeter / speed) * SECONDS_PER_MINUTE
}

/**
 * Computes how long one action takes.
 *
 * The `feed` and `dwell` carried by the action take precedence over the process speeds. A duration
 * is `null` when the speed or dwell it needs is absent, never a guess.
 *
 * @param action - Category, length and the feed and dwell carried by the action.
 * @param speeds - Cutting and rapid speeds (meters per minute) and the pierce dwell (seconds).
 * @param geometryUnitsPerMeter - Geometry units in one meter.
 * @returns Seconds, or `null` when it cannot be calculated.
 * @example
 * ```typescript
 * const seconds = actionDuration({ category: 'cut', length: 1000, feed: null, dwell: null }, { cutting: 6 }, 1000)
 * ```
 */
export function actionDuration(action: TimedAction, speeds: ActionSpeeds, geometryUnitsPerMeter: number): number | null {
  if (action.category === 'pierce') return action.dwell ?? speeds.pierceDwellSeconds ?? null
  const fallback = action.category === 'cut' ? speeds.cutting : speeds.rapid
  return secondsAt(action.length, action.feed ?? fallback, geometryUnitsPerMeter)
}
