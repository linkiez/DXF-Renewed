import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  testDir: 'test/integration-browser',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: 'http://localhost:4173',
  },
  webServer: {
    command: 'node tools/browser_test_server.js',
    port: 4173,
    reuseExistingServer: true,
    stdout: 'pipe',
    stderr: 'pipe',
  },
}

export default config
