import type { ReviewClock } from './types'

/**
 * Creates a clock driven by the browser's animation frames.
 *
 * @param view - Window that provides `requestAnimationFrame` and `performance`.
 * @returns Clock whose ticks run once per frame until cancelled.
 */
export function createAnimationClock(view: Window): ReviewClock {
  return {
    now: () => view.performance.now(),
    schedule(tick) {
      let handle = 0
      const loop = (now: number): void => {
        tick(now)
        handle = view.requestAnimationFrame(loop)
      }
      handle = view.requestAnimationFrame(loop)
      return () => view.cancelAnimationFrame(handle)
    },
  }
}
