const { defineConfig } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.test.js',  
  workers: 1,
  timeout: 120000,
  globalSetup: require.resolve('./global-setup'),
  
  reporter: [
    ['list'], 
    ['allure-playwright', { outputFolder: 'allure-results' }]
  ],

  use: {
    headless: false,
    baseURL: process.env.BASE_URL,
    viewport: null,
    storageState: './auth/state.json',
    ignoreHTTPSErrors: true,
    actionTimeout: 30000,
    navigationTimeout: 60000,

    launchOptions: {
      args: ['--start-maximized'],
      slowMo: 0,
    },

    // 🔥 REDUCE FILE SIZE - Change these:
    screenshot: 'only-on-failure',           // or 'only-on-failure' if you need them
    video: 'off',                // or 'retain-on-failure' 
    trace: 'off',                // or 'on-first-retry'
  },

  projects: [
    {
      name: 'Chromium',
      use: { browserName: 'chromium' },
    },
  ],

  retries: 0,
  maxFailures: 1,
});