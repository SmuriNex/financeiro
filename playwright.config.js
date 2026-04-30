const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:8010',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'python serve_local.py',
    url: 'http://localhost:8010/app-pc.html',
    reuseExistingServer: true,
    timeout: 30000
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] }
    }
  ]
});
