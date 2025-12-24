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

  // Run all rows from Excel
  // test.only('should submit waitlist for all Excel rows', async () => {
  //   for (let i = 0; i < testData.length; i++) {
  //     const row = testData[i];
      
  //     console.log(`\n🔄 Row ${i + 1}/${testData.length} - Time: ${row.startTimeInput}`);
      
  //     await waitlistPage.clickWaitlistTab();
  //     await waitlistPage.clickAndFillTime(row.startTimeInput);
  //     await waitlistPage.fillPrice(row.price);
  //     await waitlistPage.selectReason(row.reason);
  //     await waitlistPage.fillDescription(row.description);
  //     await waitlistPage.clickWaitlistButton();
      
  //     await waitlistPage.fillPersonalInformation({
  //       firstName: row.firstName,
  //       lastName: row.lastName,
  //       country: row.country,
  //       phone: row.phone,
  //       email: row.email
  //     });
      
  //     await waitlistPage.submitForm();
  //     await waitlistPage.clickReturnHome();
      
  //     console.log(`✅ Row ${i + 1} completed`);
      
  //     // Navigate back for next iteration if not last row
  //     if (i < testData.length - 1) {
  //       await waitlistPage.navigateToWaitlist('https://commongolf.sqzvip.com/squeez');
  //     }
  //   }
    
  //   console.log(`\n🎉 All ${testData.length} rows completed successfully!`);
  // });
});