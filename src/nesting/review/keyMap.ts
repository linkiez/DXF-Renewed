import type { ReviewKeyEvent } from './types'

/** Command triggered by a key in the review. */
export type ReviewCommand =
  | { type: 'togglePlay' }
  | { type: 'reset' }
  | { type: 'nextPierce' }
  | { type: 'slower' }
  | { type: 'faster' }
  | { type: 'sheet'; delta: 1 | -1 }
  | { type: 'seekBy'; delta: number }
  | { type: 'seekEdge'; edge: 'start' | 'end' }
  | { type: 'moveSelection'; kind: 'part' | 'action'; delta: 1 | -1 }
  | { type: 'seekSelected' }
  | { type: 'clearSelection' }
  | { type: 'pan'; dx: number; dy: number }
  | { type: 'zoom'; factor: number }
  | { type: 'resetView' }

const PAN_STEP = 0.1
const ZOOM_STEP = 1.25
const PAGE_STEP = 10

const ARROWS: Record<string, { dx: number; dy: number }> = {
  ArrowLeft: { dx: -PAN_STEP, dy: 0 },
  ArrowRight: { dx: PAN_STEP, dy: 0 },
  ArrowUp: { dx: 0, dy: PAN_STEP },
  ArrowDown: { dx: 0, dy: -PAN_STEP },
}

const PLAIN: Record<string, ReviewCommand> = {
  ' ': { type: 'togglePlay' },
  r: { type: 'reset' },
  n: { type: 'nextPierce' },
  '<': { type: 'slower' },
  '>': { type: 'faster' },
  '[': { type: 'sheet', delta: -1 },
  ']': { type: 'sheet', delta: 1 },
  ',': { type: 'seekBy', delta: -1 },
  '.': { type: 'seekBy', delta: 1 },
  PageUp: { type: 'seekBy', delta: -PAGE_STEP },
  PageDown: { type: 'seekBy', delta: PAGE_STEP },
  Home: { type: 'seekEdge', edge: 'start' },
  End: { type: 'seekEdge', edge: 'end' },
  ArrowLeft: { type: 'moveSelection', kind: 'part', delta: -1 },
  ArrowRight: { type: 'moveSelection', kind: 'part', delta: 1 },
  ArrowUp: { type: 'moveSelection', kind: 'action', delta: -1 },
  ArrowDown: { type: 'moveSelection', kind: 'action', delta: 1 },
  Enter: { type: 'seekSelected' },
  Escape: { type: 'clearSelection' },
  '+': { type: 'zoom', factor: ZOOM_STEP },
  '=': { type: 'zoom', factor: ZOOM_STEP },
  '-': { type: 'zoom', factor: 1 / ZOOM_STEP },
  '0': { type: 'resetView' },
}

/**
 * Translates a key event into a review command.
 *
 * @param event - Key and shift state.
 * @returns The command, or `null` when the key has no meaning in the review.
 */
export function keyCommand(event: ReviewKeyEvent): ReviewCommand | null {
  if (event.shiftKey && ARROWS[event.key]) return { type: 'pan', ...ARROWS[event.key] }
  return PLAIN[event.key] ?? null
}
