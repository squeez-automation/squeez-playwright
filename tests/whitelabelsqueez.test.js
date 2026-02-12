const { test } = require('@playwright/test');
const BasePage = require('../pages/BasePage');
const { readExcelData } = require('../utils/readExcel');

test.describe.serial('WhiteLabel Squeez Flow', () => {
  let basePage, excelData;

  test.beforeAll(async () => {
    excelData = readExcelData('data/bookingwhitelabeldata.xlsx', 'bookingwhitelabeldata');
  });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(200000);
    page.setDefaultTimeout(30000);
    
    console.log('🌐 Navigating to WhiteLabel Squeez page...');
    await page.goto('https://dhaba.sqzvip.com/squeez', { 
      waitUntil: 'domcontentloaded' 
    });
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');

    const randomRow = excelData[Math.floor(Math.random() * excelData.length)];
    basePage = new BasePage(page);
    basePage.excelData = randomRow;
  });

  test('Complete Squeez booking flow ', async ({}, testInfo) => {
    try {
      const data = basePage.excelData;
      
      console.log('\n📝 Step 1: Filling booking form...');
      await basePage.selectRandomDropdownValue(basePage.fields.occasionDropdown);
      await basePage.fillRandomDateInField();
      await basePage.clickAndFillTime(data.startTimeInput);
      await basePage.clickAndFillPriceField(data.priceInput);
      await basePage.clickAndFillPeopleField(data.peopleInput);
      await basePage.clickAndFillDesc(data.descriptionInput);
      
      console.log('\n📤 Step 2: Submitting booking request...');
      await basePage.clickSqueezWaitlistButton();
      console.log('✅ Form submitted');
      
      console.log('\n👤 Step 3: Filling user details popup...');
      await basePage.fillPopupForm(data, testInfo);
      console.log('✅ User details submitted');
      
      console.log('\n💳 Step 4: Processing payment...');
      await basePage.fillStripeCardAndPay(testInfo);
      console.log('✅ Payment processing completed');
      
      console.log('\n🎉 Step 5: Handling success confirmation...');
      await basePage.handleSuccessPopup('squeez', testInfo); 
      
      console.log('\n✅ ✅ ✅ BOOKING COMPLETED SUCCESSFULLY ✅ ✅ ✅\n');
      await basePage.captureScreenshot('squeez-complete-success', 'PASSED', 'Full booking flow completed', testInfo);
      
    } catch (error) {
      console.error('\n❌ ❌ ❌ TEST FAILED ❌ ❌ ❌');
      console.error(`❌ Error: ${error.message}`);
      await basePage.captureScreenshot('whitelabel-flow-error', 'FAILED', error.message, testInfo);
      throw error;
    }
  });

  test.afterEach(async ({ page }) => {
    console.log('\n🧹 Cleaning up...');
    await page.keyboard.press('Escape').catch(() => {});
    console.log('✅ Cleanup complete\n');
  });
  
});