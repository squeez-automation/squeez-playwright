const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
require('dotenv').config();

class VerifyClosedPopupPage extends BasePage {
  constructor(page, timeout = 10000) {
    super(page, timeout);
    this.page = page;
    this.timeout = timeout;

    this.fields = {
      categoryItem: page.locator('div.menu-item:has-text("Category")').first(),
      restaurantTab: page.locator('span.menu-title.fs-2', { hasText: 'Restaurants' }).first(),
      restaurantName: page.getByText('AMIT STRIPE FOGG FIGO'),
      editButton: page.getByRole('button', { name: 'Edit', exact: true }),
      businessClosedToggle: page.locator('input[name="isBusinessClosed"]'),
      submitButton: page.locator('button[type="submit"]:has-text("Submit")'),
      viewEditHoursButton: page.getByRole('button', { name: 'View / Edit' }),
      sundayTab: page.locator('button[value="Sunday"]'),
      defaultSlotTab: page.locator('p:has-text("Slot")'),
      SlotTitle: page.locator('input[placeholder="Please enter the title"]').first(),
      StartTimeButton: page.getByRole('button', { name: 'Choose time' }).first(),
      EndTimeButton: page.getByRole('button', { name: 'Choose time' }).nth(1),
      StartHourOption: page.getByRole('option', { name: '3 hours' }),
      StartMinuteOption: page.getByRole('option', {
        name: '0 minutes',
        exact: true,
      }),
      StartAmPmOption: page.getByRole('option', { name: 'PM' }),
      EndHourOption: page.locator('li[aria-label="6 hours"]').first(),
      EndMinuteOption: page.getByRole('option', {
        name: '0 minutes',
        exact: true,
      }),
      EndAmPmOption: page.getByRole('option', { name: 'PM' }),
      saveHoursButton: page.locator('button:has-text("Save")'),
      backButton: page.getByRole('button', { name: 'Back' }),
      domainLink: page.locator('a[href^="https://figo.sqzvip.com"]'),
    };
  }

  async runClosedRestaurantSqueezFlow(context) {
    await this.page.goto(`${process.env.BASE_URL}/dashboard`, {
      waitUntil: 'domcontentloaded',
    });
    await this.pause();
    await this.click(this.fields.categoryItem);
    await this.pause();
    await this.click(this.fields.restaurantTab);
    await this.pause();

    await this.fields.restaurantName.dblclick();
    await this.click(this.fields.editButton);
    await this.pause();
    if (await this.fields.businessClosedToggle.isChecked()) {
      console.log('📌 Toggle is currently ON (business is closed). Turning it OFF...');
      await this.pause();
      await this.fields.businessClosedToggle.click(); // Use click for custom toggles
      await this.pause();

      const type = await this.fields.businessClosedToggle.getAttribute('type');
      console.log(`🛈 Input type: ${type}`);

      const statusAfter = await this.fields.businessClosedToggle.isChecked();
      console.log(`✅ Toggle status after click: ${statusAfter ? 'ON' : 'OFF'}`);
    } else {
      console.log('✅ Toggle is already OFF (business is open). No action needed.');
    }
    await this.click(this.fields.submitButton);
    await this.pause();
    await this.fields.viewEditHoursButton.first().click();
    await this.pause();

    await this.click(this.fields.sundayTab);
    await this.pause();
    // -------------------------------------------------------------------------------------------
    // await this.click(this.fields.defaultSlotTab);
    console.log('➕ Clicking Add Slot button...');
    await this.page.getByRole('button', { name: 'Add Slot' }).click();

    const slotTitleField = this.page.locator('input[placeholder="Please enter the title"]').first();
    await slotTitleField.waitFor({ state: 'visible', timeout: this.timeout });
    console.log('✅ Slot form visible now — proceeding...');

    //---------------------------------------------------------------------------------------------
    await this.pause();
    await this.fields.SlotTitle.first().fill('Dinner');
    await this.fields.StartTimeButton.click();
    await this.fields.StartHourOption.click();
    await this.fields.StartMinuteOption.click();
    await this.fields.StartAmPmOption.click();
    await this.fields.EndTimeButton.click();
    await this.fields.EndHourOption.click();
    await this.fields.EndMinuteOption.click();
    await this.fields.EndAmPmOption.click();
    // Try to save slot
    await this.click(this.fields.saveHoursButton);

    // ⏳ Check for overlapping time toast
    const overlappingToast = this.page.locator('.Toastify__toast-body:has-text("Main slot time ranges are overlapping for:")');

    if (await overlappingToast.isVisible({ timeout: 3000 })) {
      console.log('❗ Overlapping slot time detected — toast appeared.');

      const openToggle = this.page.getByRole('checkbox', {
        name: 'OPEN',
        exact: true,
      });

      if (await openToggle.isChecked()) {
        console.log('🔁 OPEN toggle is ON. Turning it OFF due to time overlap...');
        await openToggle.uncheck();
        await this.pause();
      } else {
        console.log('✅ OPEN toggle already OFF. No need to update.');
      }

      console.log('💾 Re-attempting to save slot after resolving toggle...');
      await this.click(this.fields.saveHoursButton);
    } else {
      console.log('✅ Slot saved — no overlapping toast error detected.');
    }

    //******************************************************************* */

    console.log('⬅️ Clicking Back to return from Hours of Operation...');
    await this.click(this.fields.backButton);
    await this.pause();

    console.log('🌐 Clicking on Domain URL...');
    const [publicPage] = await Promise.all([context.waitForEvent('page'), this.fields.domainLink.click({ force: true })]);

    await this.fillSqueezFormOnPublicPage(publicPage);
  }

  async fillSqueezFormOnPublicPage(publicPage) {
    const fields = {
      squeezEntryButton: publicPage.getByRole('button', {
        name: 'Just Squeez It',
      }),
      priceInput: publicPage.getByRole('textbox', { name: 'Price' }),
      peopleInput: publicPage.getByRole('textbox', { name: 'People' }),
      occasionDropdown: publicPage.locator('.css-19bb58m').first(),
      occasionOption: publicPage.getByRole('option', { name: 'Anniversary' }),
      descriptionInput: publicPage.getByRole('textbox', {
        name: 'Description',
      }),
      policyCheckbox: publicPage.getByRole('checkbox', {
        name: /agree to our/i,
      }),
      submitButton: publicPage.getByRole('button', { name: 'squeez-request' }),
      timePicker: publicPage.locator('#timePicker1'),
    };

    console.log("👉 Clicking 'Just Squeez It'...");
    await publicPage.waitForLoadState('domcontentloaded');
    await fields.squeezEntryButton.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });
    await fields.squeezEntryButton.click();

    // ⏰ Click time picker, select "2", then click OK
    await fields.timePicker.click();

    // Click the start time input to open panel
    await publicPage.locator('#timePicker1').click();

    // Wait for time panel to be visible
    const panel = publicPage.locator('.ant-picker-time-panel');
    await panel.waitFor({ state: 'visible' });

    // Select hour "02"
    await panel
      .locator('.ant-picker-time-panel-column')
      .first() // hour column
      .locator('.ant-picker-time-panel-cell-inner')
      .filter({ hasText: /^0?2$/ })
      .click();

    // Select PM
    await panel
      .locator('.ant-picker-time-panel-column')
      .last() // AM/PM column is usually last
      .locator('.ant-picker-time-panel-cell-inner')
      .filter({ hasText: /^PM$/ })
      .click();

    // Click OK button
    await publicPage.getByRole('button', { name: /^OK$/ }).click();
    //*************************************************************************** */

    await fields.priceInput.fill('56');
    await this.pause();
    await fields.peopleInput.fill('2');
    await this.pause();
    await fields.occasionDropdown.click();
    await this.pause();
    await fields.occasionOption.click();
    await this.pause();
    await fields.descriptionInput.fill('Testing closed time popup');
    await this.pause();
    await fields.policyCheckbox.check();
    await this.pause();
    await fields.submitButton.click();
    await this.pause();

    const popupMessage = publicPage.locator('h6.text-dark');
    await expect(popupMessage).toContainText('is closed at the');
    console.log('✅ Popup matched — test case is successful 🎉');
  }
}
module.exports = { VerifyClosedPopupPage };
