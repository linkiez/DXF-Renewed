import { expect } from 'expect'
import { keyCommand } from '../../../../src/nesting/review/keyMap'

const key = (value: string, shiftKey = false) => keyCommand({ key: value, shiftKey })

describe('review/keyMap', () => {
  it('maps playback keys', () => {
    expect(key(' ')).toEqual({ type: 'togglePlay' })
    expect(key('r')).toEqual({ type: 'reset' })
    expect(key('n')).toEqual({ type: 'nextPierce' })
    expect(key('<')).toEqual({ type: 'slower' })
    expect(key('>')).toEqual({ type: 'faster' })
  })

  it('maps sheet and seek keys', () => {
    expect(key('[')).toEqual({ type: 'sheet', delta: -1 })
    expect(key(']')).toEqual({ type: 'sheet', delta: 1 })
    expect(key(',')).toEqual({ type: 'seekBy', delta: -1 })
    expect(key('.')).toEqual({ type: 'seekBy', delta: 1 })
    expect(key('PageUp')).toEqual({ type: 'seekBy', delta: -10 })
    expect(key('PageDown')).toEqual({ type: 'seekBy', delta: 10 })
    expect(key('Home')).toEqual({ type: 'seekEdge', edge: 'start' })
    expect(key('End')).toEqual({ type: 'seekEdge', edge: 'end' })
  })

  it('maps selection keys: left/right for parts, up/down for actions, Enter seeks, Escape clears', () => {
    expect(key('ArrowLeft')).toEqual({ type: 'moveSelection', kind: 'part', delta: -1 })
    expect(key('ArrowRight')).toEqual({ type: 'moveSelection', kind: 'part', delta: 1 })
    expect(key('ArrowUp')).toEqual({ type: 'moveSelection', kind: 'action', delta: -1 })
    expect(key('ArrowDown')).toEqual({ type: 'moveSelection', kind: 'action', delta: 1 })
    expect(key('Enter')).toEqual({ type: 'seekSelected' })
    expect(key('Escape')).toEqual({ type: 'clearSelection' })
  })

  it('maps shift+arrows to pan and +, -, 0 to zoom and reset view', () => {
    expect(key('ArrowLeft', true)).toEqual({ type: 'pan', dx: -0.1, dy: 0 })
    expect(key('ArrowRight', true)).toEqual({ type: 'pan', dx: 0.1, dy: 0 })
    expect(key('ArrowUp', true)).toEqual({ type: 'pan', dx: 0, dy: 0.1 })
    expect(key('ArrowDown', true)).toEqual({ type: 'pan', dx: 0, dy: -0.1 })
    expect(key('+')).toEqual({ type: 'zoom', factor: 1.25 })
    expect(key('-')).toEqual({ type: 'zoom', factor: 0.8 })
    expect(key('0')).toEqual({ type: 'resetView' })
  })

  it('returns null for unhandled keys', () => {
    expect(key('x')).toBeNull()
    expect(key('Tab')).toBeNull()
  })
})
