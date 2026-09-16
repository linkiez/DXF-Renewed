import { expect, test } from '@playwright/test'

test.describe('ERP nesting contract browser integration', () => {
  test('computes a Web Crypto digest through the browser bundle', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async () => {
      const request = {
        contractVersion: 1,
        correlation: { orderId: 'order-1', revisionId: 'rev-1', requestId: 'req-1' },
        job: {
          parts: [],
          stock: [],
          machine: { id: 'machine-1', revision: '1', capabilities: {} },
          processProfile: { id: 'profile-1', revision: '1', settings: {} },
          nesting: { edgeClearance: 0, partToPartClearance: 0 },
        },
        seed: 42,
      }

      return await new Promise<{ algorithm: string; value: string }>((resolve, reject) => {
        globalThis.dxf.calculateErpNesting(request).subscribe({
          next: (artifact) => resolve(artifact.outputDigest),
          error: reject,
        })
      })
    })

    expect(result.algorithm).toBe('sha256')
    expect(result.value).toMatch(/^[a-f0-9]{64}$/)
  })
})
