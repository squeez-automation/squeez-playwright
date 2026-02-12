const { test } = require('@playwright/test');
const Restaurant = require('../pages/Restaurant');
const { readExcelData } = require('../utils/readExcel'); // 👈 make sure this exists and works

test.describe.serial('Restaurant Squeez Flow (Auto Detect Payment)', () => {
  test('Run Restaurant booking using Excel data', async ({ page, request }) => {
    test.setTimeout(180 * 1000);

    console.log('🚀 Starting Restaurant booking flow...');

    // Step 1️⃣ — Navigate to Squeez platform
    await page.goto('https://access.sqzvip.com/', { waitUntil: 'domcontentloaded' });

    // Step 2️⃣ — Initialize Restaurant Page
    const restaurant = new Restaurant(page, request);

    // Step 3️⃣ — Fetch all data from Excel
    const excelData = readExcelData('data/bookingwhitelabeldata.xlsx', 'bookingwhitelabeldata');

    if (excelData.length === 0) {
      console.error('❌ No data found in the Excel sheet.');
      throw new Error('No data found.');
    }

    // Step 4️⃣ — Pick a random row from the Excel data
    const randomRow = excelData[Math.floor(Math.random() * excelData.length)];
    console.log(`🎲 Selected random row: ${JSON.stringify(randomRow)}`);

    // Step 5️⃣ — Run the Restaurant booking logic
    await restaurant.handleRestaurantSelection(randomRow);

    console.log('✅ Restaurant booking completed successfully.');
  });
});
