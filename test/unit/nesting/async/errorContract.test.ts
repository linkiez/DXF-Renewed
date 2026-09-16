import assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { nestDXF } from '../../../../src/nest'

describe('nesting Observable error contract', () => {
  it('reports missing required options through the error channel', async () => {
    const error = await new Promise<Error | undefined>((resolve) => {
      nestDXF('', {}).subscribe({
        error: (value: Error) => resolve(value),
        complete: () => resolve(undefined),
      })
    })

    assert.match(error?.message ?? '', /binSize is required/)
  })
})
