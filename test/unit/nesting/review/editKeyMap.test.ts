import { expect } from 'expect'
import { editKeyCommand } from '../../../../src/nesting/review/editKeyMap'

const step = { move: 2, rotate: 15 }
const key = (name: string, extra: { shiftKey?: boolean; ctrlKey?: boolean } = {}) => ({ key: name, shiftKey: false, ctrlKey: false, ...extra })

describe('review/editKeyMap', () => {
  it('nudges the candidate with the arrow keys by the configured step and ten times with shift', () => {
    expect(editKeyCommand(key('ArrowRight'), step)).toEqual({ type: 'nudge', dx: 2, dy: 0 })
    expect(editKeyCommand(key('ArrowLeft'), step)).toEqual({ type: 'nudge', dx: -2, dy: 0 })
    expect(editKeyCommand(key('ArrowUp'), step)).toEqual({ type: 'nudge', dx: 0, dy: 2 })
    expect(editKeyCommand(key('ArrowDown', { shiftKey: true }), step)).toEqual({ type: 'nudge', dx: 0, dy: -20 })
  })

  it('rotates with q and e, mirrors with m, confirms with Enter and cancels with Escape', () => {
    expect(editKeyCommand(key('q'), step)).toEqual({ type: 'rotate', degrees: -15 })
    expect(editKeyCommand(key('e'), step)).toEqual({ type: 'rotate', degrees: 15 })
    expect(editKeyCommand(key('m'), step)).toEqual({ type: 'mirror' })
    expect(editKeyCommand(key('Enter'), step)).toEqual({ type: 'confirm' })
    expect(editKeyCommand(key('Escape'), step)).toEqual({ type: 'cancel' })
  })

  it('undoes with Ctrl+Z and redoes with Ctrl+Y or Ctrl+Shift+Z', () => {
    expect(editKeyCommand(key('z', { ctrlKey: true }), step)).toEqual({ type: 'undo' })
    expect(editKeyCommand(key('y', { ctrlKey: true }), step)).toEqual({ type: 'redo' })
    expect(editKeyCommand(key('z', { ctrlKey: true, shiftKey: true }), step)).toEqual({ type: 'redo' })
  })

  it('returns null for keys it does not own', () => {
    expect(editKeyCommand(key(' '), step)).toBeNull()
    expect(editKeyCommand(key('z'), step)).toBeNull()
    expect(editKeyCommand(key('[', { ctrlKey: true }), step)).toBeNull()
  })
})
