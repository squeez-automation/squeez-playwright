const { test } = require('@playwright/test');
const RestaurantWaitlist = require('../pages/RestaurantWaitlist');
const { readExcelData } = require('../utils/readExcel');

test.describe.serial('Restaurant Waitlist Flow', () => {
  /** @type {RestaurantWaitlist} */
  let restaurant, excelData;

  test.beforeAll(async () => {
    excelData = await readExcelData('data/bookingwhitelabeldata.xlsx', 'bookingwhitelabeldata');
  });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(300000);
    page.setDefaultTimeout(15000);
    await page.goto('https://access.sqzvip.com/', { waitUntil: 'domcontentloaded' });

    const randomRow = excelData[Math.floor(Math.random() * excelData.length)];
    restaurant = new RestaurantWaitlist(page, randomRow);
  });

  test('Test all payment providers sequentially', async () => {
    const results = { Waitlist: { stripe: false, fiserv: false, freedompay: false } };
    const errors = [];

    // Navigate to Waitlist tab and select category once
    await restaurant.clickWaitlistTab();
    await restaurant.selectCategory({ category: 'Restaurants' }, 'Waitlist');
    const providers = await restaurant.getRestaurantsByProvider();

    // Test Stripe
    if (providers.stripe.length > 0) {
      console.log('\n🔵 Testing Stripe...');
      try {
        await restaurant.selectBusinessByName(providers.stripe[0].name, 'Waitlist');
        console.log('🟢 Starting STRIPE Payment Flow...');
        await restaurant.fillBookingFormAndOpenPopup(restaurant.excelData);
        await restaurant.fillPopupForm(restaurant.excelData);
        await restaurant.fillStripeCardAndPay(restaurant.excelData);
        await restaurant.handleSuccessPopup();
        console.log('✅ Stripe: PASSED\n');
        results.Waitlist.stripe = true;
      } catch (error) {
        console.error(`❌ Stripe: FAILED - ${error.message}\n`);
        errors.push({ provider: 'Stripe', error: error.message });
      }
    }

    // Test Fiserv
    if (providers.fiserv.length > 0) {
      console.log('\n🔵 Testing Fiserv...');
      try {
        await restaurant.clickWaitlistTab();
        await restaurant.selectCategory({ category: 'Restaurants' }, 'Waitlist');
        await restaurant.selectBusinessByName(providers.fiserv[0].name, 'Waitlist');
        console.log('🟢 Starting Fiserv Payment Flow...');
        await restaurant.fillBookingFormAndOpenPopup(restaurant.excelData);
        await restaurant.fillPopupForm(restaurant.excelData);
        await restaurant.handleSuccessPopup();
        console.log('✅ Fiserv: PASSED\n');
        results.Waitlist.fiserv = true;
      } catch (error) {
        console.error(`❌ Fiserv: FAILED - ${error.message}\n`);
        errors.push({ provider: 'Fiserv', error: error.message });
      }
    }

    // Test FreedomPay
    if (providers.freedompay.length > 0) {
      console.log('\n🔵 Testing FreedomPay...');
      try {
        await restaurant.clickWaitlistTab();
        await restaurant.selectCategory({ category: 'Restaurants' }, 'Waitlist');
        await restaurant.selectBusinessByName(providers.freedompay[0].name, 'Waitlist');
        console.log('🟢 Starting FreedomPay Payment Flow...');
        await restaurant.fillBookingFormAndOpenPopup(restaurant.excelData);
        await restaurant.fillPopupForm(restaurant.excelData);
        await restaurant.handleSuccessPopup();
        //  await restaurant.fillFreedomCardAndPay(restaurant.excelData);

        console.log('✅ FreedomPay: PASSED\n');
        results.Waitlist.freedompay = true;
      } catch (error) {
        console.error(`❌ FreedomPay: FAILED - ${error.message}\n`);
        errors.push({ provider: 'FreedomPay', error: error.message });
      }
    }

    // Calculate statistics
    const totalTests = 3;
    const passedTests = Object.values(results.Waitlist).filter(Boolean).length;

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log(errors.length === 0 ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED');
    console.log('='.repeat(60));

    const r = results.Waitlist;
    console.log(
      `📋 Waitlist: ` + `Stripe ${r.stripe ? '✓' : '✗'} | ` + `Fiserv ${r.fiserv ? '✓' : '✗'} | ` + `FreedomPay ${r.freedompay ? '✓' : '✗'}`
    );

    console.log(`📊 ${passedTests}/${totalTests} passed (${Math.round((passedTests / totalTests) * 100)}%)`);

    if (errors.length > 0) {
      console.log('\n❌ Failed Tests:');
      errors.forEach((e) => console.log(`   ${e.provider}: ${e.error}`));
    }

    console.log('='.repeat(60) + '\n');

    if (passedTests === 0) throw new Error('All tests failed');
  });
});
