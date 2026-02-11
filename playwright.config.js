const { defineConfig } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.test.js',  
  workers: 1,
  timeout: 120000,
  
  
   reporter: [
    ['html'],
    ['list'],
    ['allure-playwright', {
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: false
    }]
  ],

  use: {
    headless: false,
    baseURL: process.env.BASE_URL,
    viewport: null,
    storageState: './auth/state.json',  // ✅ This will use saved session
    ignoreHTTPSErrors: true,
    actionTimeout: 30000,
    navigationTimeout: 60000,

    launchOptions: {
      args: ['--start-maximized'],
      slowMo: 0,
    },

    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'off',
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