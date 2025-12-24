const BasePage = require('./BasePage');
const CryptoJS = require('crypto-js');

class RestaurantWaitlist extends BasePage {
  constructor(page, excelData) {
    super(page);
    this.excelData = excelData;
  }

  async waitlistDatePicker() {
    try {
      const datePicker = this.page.locator('.ant-picker.ant-picker-multiple');
      await datePicker.waitFor({ state: 'visible', timeout: 5000 });

      // Clear existing dates
      const removeCount = await this.page.locator('.ant-picker-selection-item-remove').count();
      for (let i = 0; i < removeCount; i++) {
        await this.page.locator('.ant-picker-selection-item-remove').first().click();
        await this.page.waitForTimeout(200);
      }

      // Open calendar
      await datePicker.click();
      await this.page.waitForTimeout(800);

      // Wait for calendar dropdown
      const dropdown = this.page.locator('.ant-picker-dropdown:visible');
      await dropdown.waitFor({ timeout: 5000 });

      // Select random available date
      const availableCells = this.page.locator('.ant-picker-cell:not(.ant-picker-cell-disabled):not(.ant-picker-cell-selected)');
      const totalDates = await availableCells.count();
      const randomIndex = Math.floor(Math.random() * Math.min(80, totalDates));

      const selectedCell = availableCells.nth(randomIndex);
      const dateText = await selectedCell.locator('.ant-picker-cell-inner').textContent();

      // Click to select the date
      await selectedCell.click();
      await this.page.waitForTimeout(500);

      // Force close the calendar by clicking outside or pressing Escape multiple times
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);

      // Verify calendar is closed
      const isCalendarVisible = await dropdown.isVisible().catch(() => false);
      if (isCalendarVisible) {
        // Click outside the calendar to close it
        await this.page.locator('body').click({ position: { x: 0, y: 0 } });
        await this.page.waitForTimeout(300);
      }

      console.log(`✅ Date selected: ${dateText}`);
    } catch (error) {
      throw new Error(`Date picker failed: ${error.message}`);
    }
  }

  async clickAndFillWaitlistPriceField(price) {
    console.log('🎯 Clicking on the price field...');
    const priceField = this.page.locator('#uncontrolled-tab-example-tabpane-Waitlist input[placeholder="Price"]');
    await priceField.click();
    await priceField.fill(price.toString());
    console.log(`✅ Price field filled with: ${price}`);
  }
  // ────────── ✦ ──────────────────── ❖ ──────────────────── ❖ ──────────────────── ❖ ──────────────────── ❖
  // ────────── ✦ ──────────────────── ❖ ──────────────────── ❖ ──────────────────── ❖ ──────────────────── ❖
  async fillBookingFormAndOpenPopup(data) {
    console.log('📝 Filling booking form...');

    // Fill all required fields
    await this.waitlistDatePicker();
    //await this.clickAndFillTime(data.startTimeInput);
    // await this.clickAndFillPriceField(data.priceInput, 'Waitlist');
    await this.clickAndFillPeopleField(data.peopleInput);
    await this.clickAndFillDesc(data.descriptionInput);
    console.log('✅ Form fields filled');
    await this.clickSqueezWaitlistButton();
    console.log('✅ Payment popup opened');
  }
}

module.exports = RestaurantWaitlist;
