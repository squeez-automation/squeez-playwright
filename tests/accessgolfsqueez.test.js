const { test } = require('@playwright/test');
const Restaurant = require('../pages/accessgolfsqueez');
const { readExcelData } = require('../utils/readExcel');

test.describe.serial('Golf Squeez Flow', () => {
  /** @type {accessgolfsqueez} */
  let restaurant, excelData;

  test.beforeAll(async () => {
    excelData = await readExcelData('data/bookingwhitelabeldata.xlsx', 'bookingwhitelabeldata');
  });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(300000);
    page.setDefaultTimeout(30000);
    await page.goto('https://access.sqzvip.com/', { 
      waitUntil: 'networkidle'
    });

    const randomRow = excelData[Math.floor(Math.random() * excelData.length)];
    restaurant = new Restaurant(page, randomRow);
  });

  test('Test COMMON GOLF booking flow', async ({}, testInfo) => {
    const categories = ['Golf'];
    
    for (const category of categories) {
      console.log(`\n🏷️  Testing ${category} Category\n`);
      
      try {
        // Select category
        await restaurant.selectCategory({ category });
        
        // Always select COMMON GOLF
        console.log('🔵 Selecting COMMON GOLF...');
        await restaurant.selectBusinessByName('COMMON GOLF');
        console.log('✅ COMMON GOLF selected\n');
        
        // Fill booking form and open popup
        console.log('🟢 Starting booking flow...');
        await restaurant.fillBookingFormAndOpenPopup(restaurant.excelData);
        console.log('✅ Booking form filled and popup opened\n');
        
        // Fill popup form
        console.log('🟢 Filling popup form...');
        await restaurant.fillPopupForm(restaurant.excelData);
        console.log('✅ Popup form filled\n');
        
        // Fill payment details (assuming Stripe payment for COMMON GOLF)
        console.log('🟢 Processing payment...');
        await restaurant.fillFreedomCardAndPay(restaurant.excelData, testInfo);
        console.log('✅ Payment processed\n');
        
        // Handle success popup
        console.log('🟢 Handling success popup...');
        await restaurant.handleSuccessPopup('stripe', testInfo);
        console.log('✅ Booking completed successfully!\n');
        
      } catch (error) {
        console.error(`❌ COMMON GOLF booking FAILED -`, error.message);
        await restaurant.captureScreenshot(`common-golf-flow`, 'FAILED', error.message, testInfo);
        // Close any open popups/modals
        await restaurant.closeAllModals();
        throw error;
      }
    }
    
    
  });
});