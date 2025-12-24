const { test } = require('@playwright/test');
const Restaurant = require('../pages/Squeez');
const { readExcelData } = require('../utils/readExcel');

test.describe.serial('Restaurant Squeez Flow', () => {
  /** @type {Restaurant} */
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

  test('Test all payment providers for Golf', async ({}, testInfo) => {
    const categories = ['Golf'];
    const MAX_PROVIDERS = 3;
    
    for (const category of categories) {
      console.log(`\n🏷️  Testing ${category} Category\n`);
      
      await restaurant.selectCategory({ category });
      const providers = await restaurant.getRestaurantsByProvider();

      // Test Stripe - First 3 only
      const stripeProviders = providers.stripe.slice(0, MAX_PROVIDERS);
      for (let i = 0; i < stripeProviders.length; i++) {
        try {
          console.log(`🔵 Testing Stripe ${i + 1}/${stripeProviders.length}...`);
          if (i > 0) await restaurant.selectCategory({ category });
          await restaurant.selectBusinessByName(stripeProviders[i].name);
          console.log('🟢 Starting STRIPE Payment Flow...');
          await restaurant.fillBookingFormAndOpenPopup(restaurant.excelData);
          await restaurant.fillPopupForm(restaurant.excelData);
          await restaurant.fillStripeCardAndPay(restaurant.excelData, testInfo);
          await restaurant.handleSuccessPopup('stripe', testInfo);
          console.log(`✅ Stripe ${i + 1}: PASSED\n`);
        } catch (error) {
          console.error(`❌ Stripe ${i + 1}: FAILED -`, error.message);
          await restaurant.captureScreenshot(`stripe-${i + 1}-flow`, 'FAILED', error.message, testInfo);
          // Close any open popups/modals
          await restaurant.closeAllModals();
        }
      }

      // Test Fiserv - First 3 only
      const fiservProviders = providers.fiserv.slice(0, MAX_PROVIDERS);
      for (let i = 0; i < fiservProviders.length; i++) {
        try {
          console.log(`🔵 Testing Fiserv ${i + 1}/${fiservProviders.length}...`);
          await restaurant.selectCategory({ category });
          await restaurant.selectBusinessByName(fiservProviders[i].name);
          console.log('🟢 Starting Fiserv Payment Flow...');
          await restaurant.fillBookingFormAndOpenPopup(restaurant.excelData);
          await restaurant.fillPopupForm(restaurant.excelData);
          await restaurant.handleSuccessPopup('fiserv', testInfo);
          console.log(`✅ Fiserv ${i + 1}: PASSED\n`);
        } catch (error) {
          console.error(`❌ Fiserv ${i + 1}: FAILED -`, error.message);
          await restaurant.captureScreenshot(`fiserv-${i + 1}-flow`, 'FAILED', error.message, testInfo);
          // Close any open popups/modals
          await restaurant.closeAllModals();
        }
      }

      // Test FreedomPay - First 3 only
      const freedompayProviders = providers.freedompay.slice(0, MAX_PROVIDERS);
      for (let i = 0; i < freedompayProviders.length; i++) {
        try {
          console.log(`🔵 Testing FreedomPay ${i + 1}/${freedompayProviders.length}...`);
          await restaurant.selectCategory({ category });
          await restaurant.selectBusinessByName(freedompayProviders[i].name);
          console.log('🟢 Starting FreedomPay Payment Flow...');
          await restaurant.fillBookingFormAndOpenPopup(restaurant.excelData);
          await restaurant.fillPopupForm(restaurant.excelData);
          await restaurant.fillFreedomCardAndPay(restaurant.excelData, testInfo);
          await restaurant.handleSuccessPopup('freedompay', testInfo);
          console.log(`✅ FreedomPay ${i + 1}: PASSED\n`);
        } catch (error) {
          console.error(`❌ FreedomPay ${i + 1}: FAILED -`, error.message);
          await restaurant.captureScreenshot(`freedompay-${i + 1}-flow`, 'FAILED', error.message, testInfo);
          // Close any open popups/modals
          await restaurant.closeAllModals();
        }
      }
    }
  });
});