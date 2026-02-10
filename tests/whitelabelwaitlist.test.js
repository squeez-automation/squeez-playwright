import { test, expect } from '@playwright/test';
import WhiteLabelWaitlistPage from '../pages/whitelabelwaitlist.js';
import ExcelUtils from '../utils/ExcelUtils.js';

test.describe('White Label Waitlist Tests', () => {
  /** @type {WhiteLabelWaitlistPage} */
  let waitlistPage;
  let testData;

  test.beforeAll(async () => {
    // Load test data from Excel
    const excelUtils = new ExcelUtils();
    testData = await excelUtils.readExcel('testdata/WaitlistData.xlsx', 'Sheet1');
    console.log(`📊 Loaded ${testData.length} test records`);
  });

  test.beforeEach(async ({ page }) => {
    waitlistPage = new WhiteLabelWaitlistPage(page);
    await waitlistPage.navigateToWaitlist('https://commongolf.sqzvip.com/squeez');
  });

  test('should successfully submit waitlist form from Excel', async () => {
    // Get first row from Excel
    const row = testData[0];

    console.log(`📝 Testing with time: ${row.startTimeInput}`);

    // Click waitlist tab
    await waitlistPage.clickWaitlistTab();
    
    // Fill time from Excel (e.g., "3:00 PM")
    await waitlistPage.clickAndFillTime(row.startTimeInput);
    
    // Fill the rest of the form
    await waitlistPage.fillPrice(row.price);
    await waitlistPage.selectReason(row.reason);
    await waitlistPage.fillDescription(row.description);
    await waitlistPage.clickWaitlistButton();
    
    // Fill personal info
    await waitlistPage.fillPersonalInformation({
      firstName: row.firstName,
      lastName: row.lastName,
      country: row.country,
      phone: row.phone,
      email: row.email
    });
    
    await waitlistPage.submitForm();
    await waitlistPage.clickReturnHome();
  });
});