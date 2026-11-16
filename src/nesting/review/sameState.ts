import type { Point2D } from '../types'
import type { ReviewNotice, ReviewSelection, ReviewState } from './types'

const samePoint = (a: Point2D, b: Point2D): boolean => a.x === b.x && a.y === b.y

const sameSelection = (a: ReviewSelection | null, b: ReviewSelection | null): boolean => {
  if (a === null || b === null) return a === b
  if (a.kind === 'part') return b.kind === 'part' && a.sheetId === b.sheetId && a.partKey === b.partKey
  return b.kind === 'action' && a.sheetId === b.sheetId && a.actionIndex === b.actionIndex
}

const sameNotices = (a: readonly ReviewNotice[], b: readonly ReviewNotice[]): boolean =>
  a === b || (a.length === b.length && a.every((notice, index) => notice === b[index]))

/**
 * Compares two controller states field by field.
 *
 * @param a - First state.
 * @param b - Second state.
 * @returns Whether every field is equal (notices compare by identity).
 */
export function sameState(a: ReviewState, b: ReviewState): boolean {
  return a.playing === b.playing &&
    a.speed === b.speed &&
    a.sheetId === b.sheetId &&
    a.renderer === b.renderer &&
    a.position.sheetId === b.position.sheetId &&
    a.position.actionIndex === b.position.actionIndex &&
    a.position.progress === b.position.progress &&
    a.viewport.zoom === b.viewport.zoom &&
    samePoint(a.viewport.center, b.viewport.center) &&
    sameSelection(a.selection, b.selection) &&
    sameNotices(a.notices, b.notices)
}
