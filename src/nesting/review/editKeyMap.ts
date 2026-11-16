/** Key event with the modifiers the edit mode uses. */
export interface EditKeyEvent {
  key: string
  shiftKey: boolean
  ctrlKey: boolean
}

/** Command triggered by a key in the edit mode. */
export type EditCommand =
  | { type: 'nudge'; dx: number; dy: number }
  | { type: 'rotate'; degrees: number }
  | { type: 'mirror' }
  | { type: 'confirm' }
  | { type: 'cancel' }
  | { type: 'undo' }
  | { type: 'redo' }

const BIG_STEP = 10

const arrows = (step: number): Record<string, { dx: number; dy: number }> => ({
  ArrowLeft: { dx: -step, dy: 0 },
  ArrowRight: { dx: step, dy: 0 },
  ArrowUp: { dx: 0, dy: step },
  ArrowDown: { dx: 0, dy: -step },
})

const controlCommand = (event: EditKeyEvent): EditCommand | null => {
  const key = event.key.toLowerCase()
  if (key === 'z') return event.shiftKey ? { type: 'redo' } : { type: 'undo' }
  return key === 'y' ? { type: 'redo' } : null
}

/**
 * Translates a key event into an edit command: arrows nudge, Q and E rotate, M mirrors, Enter
 * confirms, Escape cancels, Ctrl+Z undoes and Ctrl+Y or Ctrl+Shift+Z redoes.
 *
 * @param event - Key and modifiers.
 * @param step - Size of a nudge in geometry units and of a rotation in degrees.
 * @returns The command, or `null` when the key is not an edit key.
 */
export function editKeyCommand(event: EditKeyEvent, step: { move: number; rotate: number }): EditCommand | null {
  if (event.ctrlKey) return controlCommand(event)
  const arrow = arrows(step.move * (event.shiftKey ? BIG_STEP : 1))[event.key]
  if (arrow) return { type: 'nudge', ...arrow }
  const key = event.key.toLowerCase()
  if (key === 'q') return { type: 'rotate', degrees: -step.rotate }
  if (key === 'e') return { type: 'rotate', degrees: step.rotate }
  if (key === 'm') return { type: 'mirror' }
  if (event.key === 'Enter') return { type: 'confirm' }
  return event.key === 'Escape' ? { type: 'cancel' } : null
}
