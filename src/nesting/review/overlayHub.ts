import type { ReviewOverlay } from './types'

/** Combines the candidate position of the edit and the risk views into the one overlay a renderer draws. */
export interface OverlayHub {
  setGhost(overlay: ReviewOverlay | null): void
  setRisk(overlay: ReviewOverlay | null): void
  /** Draws again, for example on a renderer that was just created. */
  redraw(): void
}

/**
 * Creates the hub that merges the edit ghost and the risk layers.
 *
 * @param draw - Draws the merged overlay, or clears it with `null`.
 * @returns The hub.
 */
export function createOverlayHub(draw: (overlay: ReviewOverlay | null) => void): OverlayHub {
  let ghost: ReviewOverlay | null = null
  let risk: ReviewOverlay | null = null
  const redraw = (): void => draw(ghost || risk ? { ...(risk ?? {}), ...(ghost ?? {}) } : null)
  return {
    setGhost(overlay) {
      ghost = overlay
      redraw()
    },
    setRisk(overlay) {
      risk = overlay
      redraw()
    },
    redraw,
  }
}
