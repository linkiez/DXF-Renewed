import { readFile } from 'node:fs/promises'
import { expect } from 'expect'

describe('ERP browser bundle', () => {
  it('contains the public ERP flow export after bundling', async () => {
    const bundle = await readFile(new URL('../../../../dist/dxf.js', import.meta.url), 'utf8')

    expect(bundle).toContain('calculateErpNesting')
  })
})
