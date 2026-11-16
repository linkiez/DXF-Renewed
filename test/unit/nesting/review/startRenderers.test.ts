import { expect } from 'expect'
import { startRenderers } from '../../../../src/nesting/review/startRenderers'
import type { ReviewRenderer } from '../../../../src/nesting/review/types'

const view = {} as HTMLElement

describe('review/startRenderers', () => {
  it('uses the static renderer when no accelerated factory is supplied', async () => {
    const result = await startRenderers(view, {})

    expect(result.active).toBe(result.staticRenderer)
    expect(result.accelerated).toBeNull()
    expect(result.notices).toEqual([])
  })

  it('uses the accelerated renderer when the factory resolves', async () => {
    const accelerated = { kind: 'accelerated' } as ReviewRenderer

    const result = await startRenderers(view, { acceleratedRenderer: async () => accelerated })

    expect(result.active).toBe(accelerated)
    expect(result.accelerated).toBe(accelerated)
  })

  it('falls back to the static renderer with a notice when the factory rejects', async () => {
    const result = await startRenderers(view, { acceleratedRenderer: () => Promise.reject(new Error('no webgl')) })

    expect(result.active).toBe(result.staticRenderer)
    expect(result.notices.map((n) => n.code)).toEqual(['GRAPHICS_UNAVAILABLE'])
  })

  it('also falls back when the factory throws synchronously', async () => {
    const result = await startRenderers(view, {
      acceleratedRenderer: () => {
        throw new Error('factory failed before returning a promise')
      },
    })

    expect(result.active).toBe(result.staticRenderer)
    expect(result.notices.map((n) => n.code)).toEqual(['GRAPHICS_UNAVAILABLE'])
  })
})
