/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: 'test/integration-browser',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: 'http://localhost:4173',
  },
  webServer: {
    command: 'yarn dist && node tools/browser_test_server.cjs',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
}

module.exports = config
