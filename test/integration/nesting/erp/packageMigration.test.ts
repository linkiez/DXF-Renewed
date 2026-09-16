import { readFile } from 'node:fs/promises'
import { expect } from 'expect'

describe('ERP contract package migration', () => {
  it('requires the approved major version and runtime Zod dependency', async () => {
    const packageJson = JSON.parse(
      await readFile(new URL('../../../../package.json', import.meta.url), 'utf8'),
    ) as {
      version?: string
      dependencies?: Record<string, string>
    }

    expect(packageJson.version).toBe('9.0.0')
    expect(packageJson.dependencies?.zod).toBeDefined()
  })
})
