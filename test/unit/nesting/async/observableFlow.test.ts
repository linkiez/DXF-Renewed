import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { firstValueFrom } from 'rxjs'
import { observeFlow } from '../../../../src/nesting/async/observableFlow'

describe('observeFlow', () => {
  it('does no work until subscribed', async () => {
    let calls = 0
    const flow = observeFlow(async () => {
      calls++
      return 1
    })

    assert.equal(calls, 0)
    assert.equal(await firstValueFrom(flow), 1)
    assert.equal(calls, 1)
  })

  it('is cold: each subscription recomputes independently', async () => {
    let calls = 0
    const flow = observeFlow(async () => ++calls)

    const [a, b] = await Promise.all([firstValueFrom(flow), firstValueFrom(flow)])

    assert.equal(calls, 2)
    assert.equal(a, 1)
    assert.equal(b, 2)
  })

  it('emits exactly one value then completes', async () => {
    const events: string[] = []

    await new Promise<void>((resolve) => {
      observeFlow(async () => 'ok').subscribe({
        next: (value) => events.push(`next:${value}`),
        complete: () => {
          events.push('complete')
          resolve()
        },
        error: () => {
          events.push('error')
          resolve()
        },
      })
    })

    assert.deepEqual(events, ['next:ok', 'complete'])
  })

  it('tears down silently on unsubscribe', async () => {
    const events: string[] = []
    let signal: AbortSignal | undefined

    const flow = observeFlow((inner) => {
      signal = inner
      return new Promise<string>(() => {})
    })

    const subscription = flow.subscribe({
      next: (value) => events.push(`next:${value}`),
      complete: () => events.push('complete'),
      error: () => events.push('error'),
    })

    assert.equal(signal?.aborted, false)
    subscription.unsubscribe()
    assert.equal(signal?.aborted, true)

    await new Promise((resolve) => setTimeout(resolve, 10))
    assert.deepEqual(events, [])
  })

  it('forwards factory rejections as an error notification', async () => {
    const error = await firstValueFrom(
      observeFlow(async () => {
        throw new Error('boom')
      }),
    ).then(
      () => null,
      (err: unknown) => err as Error,
    )

    assert.equal(error?.message, 'boom')
  })

  it('aborts the internal controller when the external signal aborts', async () => {
    const external = new AbortController()
    let signal: AbortSignal | undefined

    const flow = observeFlow((inner) => {
      signal = inner
      return new Promise<string>(() => {})
    }, external.signal)

    flow.subscribe({ next: () => {}, error: () => {} })
    assert.equal(signal?.aborted, false)

    external.abort()
    assert.equal(signal?.aborted, true)
  })

  it('does not start the factory when the external signal is already aborted', () => {
    const external = new AbortController()
    external.abort()
    let calls = 0

    observeFlow(async () => {
      calls++
      return 'unexpected'
    }, external.signal).subscribe()

    assert.equal(calls, 0)
  })
})
