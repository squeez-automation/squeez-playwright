const { test } = require('@playwright/test');
const BasePage = require('../pages/BasePage');
const { readExcelData } = require('../utils/readExcel');
const WhiteLabelSqueez = require('../pages/WhiteLabelSqueez');

test.describe.serial('WhiteLabel Squeez Flow', () => {
  let basePage, excelData;

  test.beforeAll(async () => {
    excelData = readExcelData('data/bookingwhitelabeldata.xlsx', 'bookingwhitelabeldata');
  });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(300000);
    page.setDefaultTimeout(30000);
    await page.goto('https://commongolf.sqzvip.com/squeez', { 
      waitUntil: 'networkidle'
    });

    const randomRow = excelData[Math.floor(Math.random() * excelData.length)];
    basePage = new BasePage(page);
    basePage.excelData = randomRow;
  });

  test('Complete Squeez booking flow', async ({}, testInfo) => {
    try {
      const data = basePage.excelData;
      
      console.log('📝 Filling booking form...');
       
      await basePage.selectRandomDropdownValue(basePage.fields.occasionDropdown);
      await basePage.fillRandomDateInField();
      await basePage.clickAndFillTime(data.startTimeInput);
      await basePage.clickAndFillPriceField(data.priceInput);
      await basePage.clickAndFillPeopleField(data.peopleInput);
      await basePage.clickAndFillDesc(data.descriptionInput);
      await basePage.clickSqueezWaitlistButton();
      console.log('✅ Form submitted');
      
      await basePage.fillPopupForm(data, testInfo);
      
      // Unified payment method - handles both Stripe & FreedomPay
      await basePage.fillCardAndPay(data, testInfo);
      
      await basePage.handleSuccessPopup('whitelabel', testInfo);
      
      console.log('✅ Booking completed successfully');
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      await basePage.captureScreenshot('whitelabel-flow', 'FAILED', error.message, testInfo);
      throw error;
    }
  });
});