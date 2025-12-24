const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = async () => {
  const { BASE_URL, USER_EMAIL, USER_PASSWORD } = process.env;
  if (!BASE_URL || !USER_EMAIL || !USER_PASSWORD) {
    throw new Error('❌ Missing environment variables');
  }

  const storagePath = path.resolve(__dirname, 'auth/state.json');
  const isCI = process.env.CI === 'true' || !!process.env.TF_BUILD;
  const headless = isCI ? true : process.env.HEADLESS === 'true';
  const slowMo = isCI ? 0 : Number(process.env.SLOWMO || 100);

  if (fs.existsSync(storagePath)) fs.unlinkSync(storagePath);
  fs.mkdirSync(path.dirname(storagePath), { recursive: true });

  const browser = await chromium.launch({ headless, slowMo });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🌐 Logging in...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await page.getByPlaceholder('Email').fill(USER_EMAIL);
    await page.getByPlaceholder('Password').fill(USER_PASSWORD);

    const checkbox = page.locator('input[type="checkbox"]');
    if ((await checkbox.isVisible()) && !(await checkbox.isChecked())) {
      await checkbox.check({ force: true });
    }

    await page.getByRole('button', { name: /sign in/i }).click();
    // await page.waitForURL('**/dashboard', { timeout: 30000 });

    await context.storageState({ path: storagePath });
    console.log(`✅ Session saved: ${storagePath}`);
  } catch (err) {
    console.error('❌ Login failed:', err.message);
    throw err;
  } finally {
    await browser.close();
  }
};
