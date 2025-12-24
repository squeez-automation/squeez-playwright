const path = require('path');
const fs = require('fs');
const CryptoJS = require('crypto-js');

class BasePage {
  constructor(page) {
    this.page = page;

    // Centralized locators
    this.fields = {
      // Tab selectors
      squeezTab: () => this.page.locator('#uncontrolled-tab-example-tabpane-Squeez'),
      waitlistTab: () => this.page.locator('#uncontrolled-tab-example-tabpane-Waitlist'),
      waitlistTabButton: () => this.page.locator('button[role="tab"][data-rr-ui-event-key="Waitlist"]'),
      
      // Category selectors
      categoryDropdownSqueez: () => this.page.locator('#uncontrolled-tab-example-tabpane-Squeez #category-select .css-15noair-control'),
      categoryDropdownWaitlist: () => this.page.locator('#uncontrolled-tab-example-tabpane-Waitlist #category-select .css-15noair-control'),
      categoryOption: (name) => this.page.getByRole('option', { name }),
      
      // Place/Business selectors
      placeDropdownSqueez: () => this.page.locator('#uncontrolled-tab-example-tabpane-Squeez .sl-occation .css-15noair-control:has-text("Select Place"), #uncontrolled-tab-example-tabpane-Squeez .sl-occation .css-rvssjw-control:has-text("Select Place")'),
      placeDropdownWaitlist: () => this.page.locator('#uncontrolled-tab-example-tabpane-Waitlist .sl-occation .css-15noair-control:has-text("Select Place"), #uncontrolled-tab-example-tabpane-Waitlist .sl-occation .css-rvssjw-control:has-text("Select Place")'),
      placeInputSqueez: () => this.page.locator('#react-select-3-input'),
      placeInputWaitlist: () => this.page.locator('#react-select-6-input'),
      placeOption: (name) => this.page.getByRole('option', { name, exact: true }),
      placeOptionPartial: (name) => this.page.getByRole('option').filter({ hasText: name }).first(),
      
      // Time and Date selectors

      timeInput: () => this.page.locator('#timePicker1').first(),
      timePanel: () => this.page.locator('.ant-picker-time-panel'),
      timeColumn: (index) => this.page.locator(`.ant-picker-time-panel-column:nth-child(${index})`),
      timeCell: (columnIndex, value) => this.page.locator(`.ant-picker-time-panel-column:nth-child(${columnIndex}) .ant-picker-time-panel-cell-inner`).filter({ hasText: new RegExp(`^${value}$`, 'i') }).first(),
      timeOkButton: () => this.page.getByRole('button', { name: 'OK' }),
      dateInput: () => this.page.getByPlaceholder('Select date').first(),

      occasionDropdown: () => this.page.locator('#react-select-2-input').first(),
      
      // Form inputs (dynamic based on active tab)
      priceInput: () => this.page.locator('input[placeholder="Price"]').first(),
      peopleInput: (tabPane) => this.page.locator(`${tabPane} input[placeholder="People"]`),
      descInput: (tabPane) => this.page.locator(`${tabPane} input[placeholder="Description"]`),
      submitButton: (tabPane) => this.page.locator(`${tabPane} button.squeez-btn`).first(),
      
      // Popup/Modal selectors
      modalBody: () => this.page.locator('.modal-body').filter({ has: this.page.locator('input#firstName') }),
      firstNameInput: () => this.page.locator('input#firstName'),
      lastNameInput: () => this.page.locator('input#lastName'),
      countryButton: () => this.page.locator('button.country-button, .country-button').first(),
      countrySearch: () => this.page.locator('input[placeholder*="Search"]').last(),
      countryOption: (country) => this.page.getByText(country, { exact: true }).first(),
      phoneInput: () => this.page.locator('input[type="tel"]').first(),
      emailInput: () => this.page.locator('input#email'),
      modalSubmitButton: () => this.page.locator('[data-testid="modal-submit-btn"]'),
      
      // Success popup selectors
      returnHomeButton: () => {return this.page.locator('button.w-100.squeez-form.btn.btn-primary').filter({ hasText: 'Return to Home' }).first();},
      closeButton: () => this.page.locator('#uncontrolled-tab-example-tabpane-Squeez button.btn.btn-primary.w-100.squeez-form[aria-label="Close"]'),
      
      // Payment selectors
      paymentIframe: () => this.page.getByRole('tabpanel', { name: /BUSINESS Squeez Request/i }).locator('iframe[title="Payment"]'),
      payWithCardButton: () => this.page.getByRole('button', { name: 'Pay with Card' }),
      stripeCardNumberFrame: (frame) => frame.locator('iframe').first(),
      stripeExpiryFrame: (frame) => frame.locator('iframe').nth(1),
      stripeCvcFrame: (frame) => frame.locator('iframe').nth(2),
      stripeCardNumber: (frame) => frame.getByPlaceholder('1234 1234 1234 1234'),
      stripeExpiry: (frame) => frame.getByPlaceholder('MM / YY'),
      stripeCvc: (frame) => frame.getByPlaceholder('CVC'),
      stripeZip: (frame) => frame.getByPlaceholder('Zip Code'),
      payNowButton: (frame) => frame.getByRole('button', { name: 'Pay Now' }),
    };
  }

  // ────────── HELPER METHODS ──────────────────
  
  async getActiveTab() {
    const isSqueez = await this.fields.squeezTab().isVisible();
    return isSqueez ? 'Squeez' : 'Waitlist';
  }
  
  async getTabPane() {
    const tab = await this.getActiveTab();
    return tab === 'Squeez' ? '#uncontrolled-tab-example-tabpane-Squeez' : '#uncontrolled-tab-example-tabpane-Waitlist';
  }

  // ────────── SUCCESS POPUP ──────────────────
  
async handleSuccessPopup(provider = 'unknown', testInfo = null) {
  console.log('🔍 Handling success popup...');
  
  try {
    await this.page.waitForTimeout(2000);
    
    await this.captureScreenshot(
      `${provider}-booking-success`, 
      'PASSED', 
      'Booking completed', 
      testInfo
    );
    
    // ✅ FIX: Use force click to bypass interception
    await this.page.getByRole('button', { name: 'Return to Home' }).first().click({ force: true });
    console.log('✅ Return to Home clicked');
    
    await this.page.waitForTimeout(1000);
    console.log('✅ Modal closed');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    await this.captureScreenshot(`${provider}-error`, 'FAILED', error.message, testInfo);
    await this.page.keyboard.press('Escape').catch(() => {});
    throw error;
  }
}

  // ────────── CATEGORY SELECTION (DYNAMIC & AUTO-WAIT) ──────────────────

async selectCategory(data, tabType = 'Squeez', testInfo = null) {
    const category = data.category || '';
    console.log(`🎯 Selecting category: ${category} (${tabType})`);

    try {
      const tabPane = `#uncontrolled-tab-example-tabpane-${tabType}`;
      const dropdown = this.page.locator(`${tabPane} #category-select .css-15noair-control`);

      // Wait for dropdown to be ready
      await dropdown.waitFor({ state: 'visible', timeout: 10000 });
      await dropdown.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500); // Stability wait
      
      await dropdown.click();
      console.log('✅ Dropdown opened');
      
      // Wait for options to load
      await this.page.waitForTimeout(1000);
      
      const option = this.page.getByRole('option', { name: category });
      await option.waitFor({ state: 'visible', timeout: 5000 });
      await option.click();
      console.log(`✅ Category selected: ${category}`);
      
      // Wait for API call after selection
      await this.page.waitForTimeout(1000);
      
    } catch (error) {
      const availableOptions = await this.page.locator('[role="option"]').allTextContents().catch(() => []);
      console.error(`❌ Failed to select category: ${category}`);
      console.error(`📋 Available options: ${availableOptions.join(', ')}`);
      
      if (testInfo) {
        await this.captureScreenshot(`category-${tabType}-error`, 'FAILED', error.message, testInfo);
      }
      throw error;
    }
  }

  // ────────── BUSINESS SELECTION ──────────────────
  
  async selectBusinessByName(businessName, tabType = 'Squeez', testInfo = null) {
    console.log(`🎯 Selecting: ${businessName} (${tabType})`);

    if (!businessName) throw new Error('Business name required');

    try {
      const dropdown = tabType === 'Waitlist' 
        ? this.fields.placeDropdownWaitlist() 
        : this.fields.placeDropdownSqueez();
      
      const input = tabType === 'Waitlist'
        ? this.fields.placeInputWaitlist()
        : this.fields.placeInputSqueez();

      await dropdown.scrollIntoViewIfNeeded();
      await dropdown.waitFor({ state: 'visible', timeout: 10000 });
      await this.page.waitForTimeout(500);
      
      await dropdown.click();
      await this.page.waitForTimeout(1000);
      
      await input.fill(businessName);
      await this.page.waitForTimeout(1500); // Wait for options to filter

      // Try exact match first
      let option = this.fields.placeOption(businessName);
      let isVisible = await option.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (!isVisible) {
        console.log('⚠️ Exact match not found, trying partial...');
        option = this.fields.placeOptionPartial(businessName);
        isVisible = await option.isVisible({ timeout: 3000 }).catch(() => false);
      }
      
      if (!isVisible) {
        // Last resort: get first visible option
        option = this.page.getByRole('option').first();
      }

      await option.click();
      console.log(`✅ Selected: ${businessName}`);
      
      // Wait for selection to register
      await this.page.waitForTimeout(1000);
      
    } catch (error) {
      console.error(`❌ Failed to select business:`, error.message);
      await this.captureScreenshot(`business-select-error`, 'FAILED', error.message, testInfo);
      throw error;
    }
  }

  // ────────── TAB SWITCHING ──────────────────
  
  async clickWaitlistTab() {
  console.log('📑 Clicking Waitlist tab...');
  
  const tab = this.fields.waitlistTabButton();
  
  const isSelected = await tab.getAttribute('aria-selected');
  if (isSelected === 'true') {
    console.log('✅ Already active');
    return;
  }
  

  
  await tab.click();
  // Wait for tab to become active
  await tab.waitFor({ state: 'attached' });
  await this.page.waitForLoadState('networkidle');
  console.log('✅ Waitlist tab activated');
}

// ────────── FORM FILLING ──────────────────

async fill(locator, value) {
  // Playwright auto-waits for element to be visible and enabled
  const inputType = await locator.getAttribute('type');
  
  if (inputType === 'text' || inputType === 'date') {
    await locator.evaluate(el => el.removeAttribute('readonly'));
  }
  
  await locator.fill(String(value).trim());
  console.log(`✅ Filled: ${value}`);
}

async click(locator) {
  // Playwright auto-waits for actionability (visible, stable, enabled, not obscured)
  await locator.click();
  console.log('✅ Clicked');
}


async selectRandomDropdownValue(dropdownLocator) {
  await dropdownLocator().click();
  await this.page.waitForSelector('[role="listbox"]');
  
  const options = await this.page.$$('[role="option"]');
  const randomIndex = Math.floor(Math.random() * options.length);
  await options[randomIndex].click();
}

  async fillRandomDateInField() {
    const today = new Date();
    const randomDays = Math.floor(Math.random() * 60) + 1;
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + randomDays);
    
    const formatted = futureDate.toLocaleDateString('en-GB', { 
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' 
    }).replace(/ /g, ' ');
    
    const dateInput = this.fields.dateInput();
    await dateInput.scrollIntoViewIfNeeded();
    await dateInput.evaluate(el => el.removeAttribute('readonly'));
    await dateInput.click({ force: true });
    await dateInput.fill(formatted);
    
    console.log(`✅ Date: ${formatted}`);
    return formatted;
  }

  async clickAndFillPriceField(price) {
  const input = this.fields.priceInput();
  await input.click();
  await input.fill(String(price));
}

  async clickAndFillPeopleField(people) {
  if (!people) throw new Error('People field required');
  
  const tabPane = await this.getTabPane();
  const input = this.fields.peopleInput(tabPane);
  
  await input.click();
  await input.fill(people.toString());
}

 async clickAndFillDesc(description) {
  if (!description) return;
  
  const tabPane = await this.getTabPane();
  const input = this.fields.descInput(tabPane);
  
  await input.click();
  await input.fill(description);
}

  // ────────── TIME PICKER ──────────────────
  
  async clickAndFillTime(rawValue) {
  const formatted = this.formatExcelTime(rawValue);
  if (!formatted) return;

  const [time, period] = formatted.split(' ');
  const [hour, minute] = time.split(':').map(v => v.padStart(2, '0'));
  
  console.log(`🕐 Filling time: ${formatted}`);
  // ADD THESE TWO LINES:
  await this.fields.timeInput().scrollIntoViewIfNeeded();
  await this.fields.timeInput().waitFor({ state: 'visible', timeout: 10000 });
  
  await this.fields.timeInput().click();
  await this.fields.timePanel().waitFor({ state: 'visible' });
  await this.fields.timeInput().click();
  // Auto-wait for time panel to be visible
  await this.fields.timePanel().waitFor({ state: 'visible' });

  const selectTime = async (columnIndex, value) => {
    const column = this.fields.timeColumn(columnIndex);
    
    const allOptions = await column
      .locator('.ant-picker-time-panel-cell-inner')
      .allTextContents();
    
    let targetValue = value;
    
    // For minutes, find closest available
    if (columnIndex === 2) {
      const numValue = parseInt(value);
      const available = allOptions.map(opt => parseInt(opt)).filter(n => !isNaN(n));
      
      if (!available.includes(numValue)) {
        targetValue = available
          .reduce((prev, curr) => Math.abs(curr - numValue) < Math.abs(prev - numValue) ? curr : prev)
          .toString().padStart(2, '0');
        console.log(`⚠️ Using closest minute: ${targetValue}`);
      }
    }
    
    const cell = this.fields.timeCell(columnIndex, targetValue);
    await cell.scrollIntoViewIfNeeded();
    await cell.click();
  };

  await selectTime(1, hour);
  await selectTime(2, minute);
  await selectTime(3, period.toUpperCase());

  await this.fields.timeOkButton().click();
  console.log(`✅ Time set: ${formatted}`);
}

formatExcelTime(excelValue) {
  if (!excelValue) return '';
  
  if (typeof excelValue === 'string' && /^\d{1,2}:\d{2} (AM|PM)$/i.test(excelValue.trim())) {
    return excelValue.trim().toUpperCase();
  }
  
  if (!isNaN(excelValue)) {
    const totalMinutes = Math.round(excelValue * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const hr12 = hours % 12 || 12;
    return `${hr12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  return '';
}

  // ────────── POPUP FORM ──────────────────
  
  async fillPopupForm(row, testInfo = null) {
  try {
    console.log('🔍 Waiting for popup form...');
    
    const squeezTab = this.fields.squeezTab();
    const modal = squeezTab.locator('#userModal');
    
    await modal.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Modal is visible, filling form...');

    if (row.firstNameInput) {
      const firstName = squeezTab.locator('input#firstName');
      await firstName.clear();
      await firstName.fill(row.firstNameInput.toString().trim());
      console.log(`✅ First Name: ${row.firstNameInput}`);
    }

    if (row.lastNameInput) {
      const lastName = squeezTab.locator('input#lastName');
      await lastName.clear();
      await lastName.fill(row.lastNameInput.toString().trim());
      console.log(`✅ Last Name: ${row.lastNameInput}`);
    }

    if (row.countryInput) {
      await this.fields.countryButton().click();
      await this.fields.countrySearch().fill(row.countryInput.toString().trim());
      await this.fields.countryOption(row.countryInput).click();
      console.log(`✅ Country: ${row.countryInput}`);
    }

    if (row.phoneInput) {
      const phone = squeezTab.locator('input[placeholder="Phone number"]');
      await phone.clear();
      await phone.fill(String(row.phoneInput));
      console.log(`✅ Phone: ${row.phoneInput}`);
    }

    if (row.emailInput) {
      const email = squeezTab.locator('input#email');
      await email.clear();
      await email.fill(row.emailInput.toString().trim());
      console.log(`✅ Email: ${row.emailInput}`);
    }

    const submitButton = squeezTab.locator('button[type="submit"]');
    await submitButton.click();
    console.log('✅ Submit button clicked');
    
    await modal.waitFor({ state: 'hidden', timeout: 10000 });
    console.log('✅ Popup form submitted successfully');
    
  } catch (error) {
    console.error('❌ Popup form error:', error.message);
    await this.captureScreenshot('popup-form-error', 'FAILED', error.message, testInfo);
    throw error;
  }
}

  // ────────── SUBMIT BUTTON ──────────────────
  
  async clickSqueezWaitlistButton() {
  const tabPane = await this.getTabPane();
  const button = this.fields.submitButton(tabPane);
  
  // Auto-waits for button to be actionable
  await button.click();
  
  const buttonText = tabPane.includes('Squeez') ? 'Squeez' : 'Waitlist';
  console.log(`✅ ${buttonText} button clicked`);
}

async fillCardAndPay(row, testInfo = null) {
  try {
    console.log('💳 Starting payment...');
    
    const paymentIframe = this.page.locator('iframe[title="Payment"]').first();
    const hasPayment = await paymentIframe.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (!hasPayment) {
      console.log('ℹ️ No payment needed');
      return;
    }
    
    const paymentFrame = await paymentIframe.contentFrame();
    await paymentFrame.getByRole('button', { name: /Pay with Card/i }).click();
    console.log('✅ Pay with Card clicked');
    
    await this.page.waitForTimeout(2000);
    
    // Detect payment processor
    const nestedIframe = paymentFrame.locator('iframe').first();
    const hasNestedIframe = await nestedIframe.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasNestedIframe) {
      const nestedFrame = await nestedIframe.contentFrame();
      const isFreedomPay = await nestedFrame.locator('#CardNumber').isVisible({ timeout: 2000 }).catch(() => false);
      
      if (isFreedomPay) {
        // FreedomPay - all fields in one iframe
        await nestedFrame.locator('#CardNumber').fill(String(row.cardNumber).replace(/\s/g, ''));
        await nestedFrame.locator('#ExpirationDate').fill(String(row.cardExpiry));
        await nestedFrame.locator('#SecurityCode').fill(String(row.cardCVC));
        await nestedFrame.locator('#PostalCode').fill(String(row.cardZip));
        console.log('✅ FreedomPay fields filled');
      } else {
        // Stripe - each field in separate iframe
        const cardFrame = await paymentFrame.locator('iframe[title*="Secure card number"]').contentFrame();
        await cardFrame.locator('[name="cardnumber"]').fill(String(row.cardNumber).replace(/\s/g, ''));
        
        const expiryFrame = await paymentFrame.locator('iframe[title*="Secure expiration"]').contentFrame();
        const expiryValue = String(row.cardExpiry);
        const formattedExpiry = expiryValue.length === 2 ? `${expiryValue}26` : expiryValue;
        await expiryFrame.locator('[name="exp-date"]').fill(formattedExpiry);
        
        const cvcFrame = await paymentFrame.locator('iframe[title*="Secure CVC"]').contentFrame();
        await cvcFrame.locator('[name="cvc"]').fill(String(row.cardCVC));
        
        await paymentFrame.locator('input[placeholder="Zip Code"]').fill(String(row.cardZip));
        console.log('✅ Stripe fields filled');
      }
    }
    
    await paymentFrame.getByRole('button', { name: /pay/i }).click();
    console.log('✅ Payment submitted');
    
    await this.page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Payment error:', error.message);
    await this.captureScreenshot('payment', 'FAILED', error.message, testInfo);
    throw error;
  }
}
 
// async fillStripeCardAndPay(row, testInfo = null) {
//   try {
//     console.log('💳 Starting Stripe payment...');
    
//     const paymentIframe = this.page.locator('iframe[title="Payment"]').first();
//     const hasPayment = await paymentIframe.isVisible({ timeout: 3000 }).catch(() => false);
    
//     if (!hasPayment) {
//       console.log('ℹ️ No payment needed');
//       return;
//     }
    
//     const paymentFrame = await paymentIframe.contentFrame();
//     await paymentFrame.getByRole('button', { name: 'Pay with Card' }).click();
//     console.log('✅ Pay with Card clicked');
    
//     await this.page.waitForTimeout(3000);
    
//     // Stripe card number
//     const cardIframe = paymentFrame.locator('iframe[title*="Secure card number"]');
//     const cardFrame = await cardIframe.contentFrame();
//     await cardFrame.locator('[name="cardnumber"]').fill(String(row.cardNumber).replace(/\s/g, ''));
//     console.log('✅ Card number filled');
    
//     // Stripe expiry - ensure MMYY format
// const expiryIframe = paymentFrame.locator('iframe[title*="Secure expiration"]');
// const expiryFrame = await expiryIframe.contentFrame();
// const expiryValue = String(row.cardExpiry);
// // If it's 4 digits like 1226, use as is. If it's 2 digits, pad it
// const formattedExpiry = expiryValue.length === 2 ? `${expiryValue}26` : expiryValue;
// await expiryFrame.locator('[name="exp-date"]').fill(formattedExpiry);
// console.log('✅ Expiry filled');
    
//     // Stripe CVC
//     const cvcIframe = paymentFrame.locator('iframe[title*="Secure CVC"]');
//     const cvcFrame = await cvcIframe.contentFrame();
//     await cvcFrame.locator('[name="cvc"]').fill(String(row.cardCVC));
//     console.log('✅ CVC filled');
    
//     // Zip code (not in iframe)
//   await paymentFrame.locator('input[placeholder="Zip Code"]').fill(String(row.cardZip));
//     console.log('✅ Zip code filled');
    
//     await paymentFrame.getByRole('button', { name: /pay/i }).click();
//     console.log('✅ Payment submitted');
    
//   } catch (error) {
//     console.error('❌ Stripe payment error:', error.message);
//     throw error;
//   }
// }
 

// // ────────── PAYMENT METHODS ──────────────────
 
// async fillFreedomCardAndPay(row, testInfo = null) {
//   try {
//     console.log('🔍 Waiting for FreedomPay iframe...');
    
//     const iframeCount = await this.page.locator('iframe').count();
//     console.log(`📊 Total iframes: ${iframeCount}`);
    
//     if (iframeCount <= 1) {
//       console.log('ℹ️ POST PAY - No payment needed');
//       return;
//     }
    
//     const paymentFrame = this.page.frameLocator('iframe[title="Payment"]').first();
    
//     // Wait and click "Pay with Card" button
//     await this.page.waitForTimeout(2000);
//     const payButton = paymentFrame.locator('button:has-text("Pay with Card")').first();
//     await payButton.waitFor({ state: 'visible', timeout: 10000 });
//     await payButton.click({ force: true });
//     console.log('✅ Pay with Card clicked');
    
//     await this.page.waitForTimeout(1000);
    
//     // Check for nested iframe structure
//     let freedomPayFrame;
//     const hasNestedIframe = await paymentFrame.locator('#root iframe').count() > 0;
    
//     if (hasNestedIframe) {
//       freedomPayFrame = paymentFrame.frameLocator('#root iframe').first();
//       console.log('📍 Using nested iframe structure');
//     } else {
//       freedomPayFrame = paymentFrame.frameLocator('iframe').first();
//       console.log('📍 Using direct iframe structure');
//     }
    
//     // Fill card details from row data
//     await freedomPayFrame.locator('#CardNumber').fill(String(row.cardNumber).replace(/\s/g, ''), { timeout: 30000 });
//     console.log('✅ Card number filled');
    
//     await freedomPayFrame.locator('#ExpirationDate').fill(String(row.cardExpiry));
//     console.log('✅ Expiry filled');
    
//     await freedomPayFrame.locator('#SecurityCode').fill(String(row.cardCVC));
//     console.log('✅ CVC filled');
    
//     await freedomPayFrame.locator('#PostalCode').fill(String(row.cardZip));
//     console.log('✅ Postal code filled');
    
//     await freedomPayFrame.getByRole('button', { name: /pay/i }).click();
//     console.log('✅ Payment submitted');
    
//     await this.page.waitForTimeout(3000);
//     console.log('✅ Payment completed');
    
//   } catch (error) {
//     console.error('❌ FreedomPay payment error:', error.message);
//     await this.captureScreenshot('freedompay-payment', 'FAILED', error.message, testInfo);
//     throw error;
//   }
// }


async closeAllModals() {
  try {
    console.log('🧹 Cleaning up - closing any open modals...');
    
    // Try to close the main modal/popup using X button
    const closeButton = this.page.locator('button[aria-label="Close"], button.close, .modal-close, [role="dialog"] button').first();
    if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeButton.click({ timeout: 1000 });
      console.log('✅ Modal closed via X button');
    }
    
    // Try pressing Escape key
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
    
    // Reload page as last resort
    await this.page.reload({ waitUntil: 'networkidle' });
    console.log('✅ Page reloaded - clean state restored');
    
  } catch (error) {
    console.log('⚠️ Cleanup attempt completed');
  }
}
  // ────────── SCREENSHOTS ──────────────────
  
  async captureScreenshot(testName, status, message = '', testInfo = null) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const screenshotDir = path.resolve(__dirname, '../screenshots');
  
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  // Format: testName-PASSED or testName-FAILED
  const statusText = status.toUpperCase();
  const filePath = path.join(screenshotDir, `${testName}-${statusText}_${timestamp}.png`);
  
  const buffer = await this.page.screenshot({ path: filePath, fullPage: true });
  
  if (testInfo?.attach) {
    await testInfo.attach(`${testName}-${status}`, {
      contentType: 'image/png',
      body: buffer,
    });
  }
  
  const icon = status === 'PASSED' ? '✅' : '❌';
  console.log(`📸 ${icon} Screenshot saved: ${filePath}`);
  if (message) console.log(`${icon} ${message}`);
  
  return {
    status,
    screenshotPath: filePath,
    message,
    timestamp: new Date().toISOString(),
  };
}
  // ────────── API HELPERS ──────────────────
  
  async getRestaurantsByProvider() {
    console.log('⏳ Waiting for API...');
    
    let response;
    let retries = 2;
    
    for (let i = 0; i < retries; i++) {
      try {
        response = await this.page.waitForResponse(
          resp => resp.url().includes('getItemsDataFromCategory') && resp.status() === 200,
          { timeout: 30000 }
        );
        break;
      } catch (e) {
        if (i === retries - 1) {
          console.warn('⚠️ No API response after retries');
          return { stripe: [], fiserv: [], freedompay: [] };
        }
        
        console.warn(`⚠️ API attempt ${i + 1} failed, retrying...`);
        await this.page.locator('.css-15noair-control').nth(1).click();
        await this.page.waitForTimeout(1000);
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(1000);
      }
    }
    
    const decrypted = await this.decryptResponse(response);
    if (!decrypted) return { stripe: [], fiserv: [], freedompay: [] };
    
    const restaurants = Array.isArray(decrypted) ? decrypted : [decrypted];
    const valid = restaurants.filter(r => r?.name);
    
    const providers = {
      stripe: valid.filter(r => r.paymentProviderType?.toLowerCase() === 'stripe'),
      fiserv: valid.filter(r => r.paymentProviderType?.toLowerCase() === 'fiserv'),
      freedompay: valid.filter(r => r.paymentProviderType?.toLowerCase() === 'freedompay'),
    };
    
    console.log(`\n📊 Providers: Stripe: ${providers.stripe.length} | Fiserv: ${providers.fiserv.length} | FreedomPay: ${providers.freedompay.length}\n`);
    
    return providers;
  }

  async decryptResponse(response) {
    try {
      const encrypted = await response.text();
      const { data: { encryptedData } } = JSON.parse(encrypted);
      
      const key = CryptoJS.enc.Base64.parse('1QlDn5TlQNQ9ArpEvsqMtOrC+OB1iYpYRQDkN0gBUWA=');
      const iv = CryptoJS.enc.Base64.parse('GxTyJmGUXK2JxDj3bKondg==');
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key, { iv });
      
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (err) {
      console.error('❌ Decryption failed:', err.message);
      return null;
    }
  }
}

module.exports = BasePage;