import { Observable, defer } from 'rxjs'

/**
 * Adapts an `async` nesting flow into a lazy, cold Observable.
 *
 * The factory runs once per subscription, so nothing happens until a consumer
 * subscribes and every subscription recomputes independently (no caching, no
 * multicast). Unsubscribing aborts the underlying work through the supplied
 * `AbortSignal` and completes silently: no `next`, no `complete`, no `error`.
 *
 * An optional caller-owned `external` signal is chained to the internal
 * controller, so aborting it also cancels the work. Its listener is removed on
 * teardown; the external signal itself is never aborted by this wrapper.
 *
 * Rejections from the factory surface as an `error` notification (FR-009);
 * expected outcomes such as unplaced shapes stay on the emitted value.
 */
/** Throw when the cooperative signal has already been aborted (FR-007). */
export function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw new Error('nesting flow aborted')
  }
}

export function observeFlow<T>(
  factory: (signal: AbortSignal) => Promise<T>,
  external?: AbortSignal,
): Observable<T> {
  return defer(
    () =>
      new Observable<T>((subscriber) => {
        const controller = new AbortController()
        const onAbort = () => {
          controller.abort()
          subscriber.unsubscribe()
        }

        if (external) {
          if (external.aborted) onAbort()
          else external.addEventListener('abort', onAbort, { once: true })
        }

        factory(controller.signal).then(
          (value) => {
            if (subscriber.closed) return
            subscriber.next(value)
            subscriber.complete()
          },
          (error) => {
            if (subscriber.closed) return
            subscriber.error(error)
          },
        )

        return () => {
          external?.removeEventListener('abort', onAbort)
          controller.abort()
        }
      }),
  )
}
