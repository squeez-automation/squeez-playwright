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


      freedomPaymentIframe: () => this.page.locator('iframe[title="Payment"]'),
      freedomPaymentRoot: (frame) => frame.locator('#root'),
      freedomPayWithCardBtn: (frame) => frame.getByRole('button', { name: 'Pay with Card' }),
      freedomNestedIframe: (frame) => frame.locator('iframe[title="FreedomPay iFrame"]'),
      freedomCardNumber: (frame) => frame.getByRole('textbox', { name: 'Card Number' }),
      freedomExpiry: (frame) => frame.getByRole('textbox', { name: 'Expiration Date' }),
      freedomSecurityCode: (frame) => frame.getByRole('textbox', { name: 'Security Code' }),
      freedomPostalCode: (frame) => frame.getByRole('textbox', { name: 'Postal Code' }),
      freedomPayButton: (frame) => frame.getByRole('button', { name: 'Pay' }),

      fiservPaymentIframe: () => this.page.locator('iframe[title="Payment"]'),
      fiservPaymentRoot: (frame) => frame.locator('#root'),
      fiservPayWithCardBtn: (frame) => frame.getByRole('button', { name: 'Pay with Card' }),
      fiservNestedIframe: (frame) => frame.locator('#root iframe'), // UPDATED - Codegen shows this
      fiservCardNumber: (frame) => frame.getByRole('textbox', { name: 'Enter card number' }),
      fiservExpiry: (frame) => frame.getByRole('textbox', { name: 'Enter expiration date' }),
      fiservCvc: (frame) => frame.getByRole('textbox', { name: 'Enter cvc number' }),
      fiservPostalCode: (frame) => frame.getByRole('textbox', { name: 'Enter postal code' }),
      fiservPayNowBtn: (frame) => frame.getByRole('button', { name: 'Pay Now' }),

      // Remove old Stripe locators and replace with these:
      stripePaymentIframe: () => this.page.locator('iframe[title="Payment"]').nth(1),
      stripePayWithCardBtn: (frame) => frame.getByRole('button', { name: 'Pay with Card' }),
      stripeCardIframe: (frame) => frame.locator('iframe[name*="__privateStripeFrame"]').first(),
      stripeCardInput: (frame) => frame.getByRole('textbox', { name: 'Credit or debit card number' }),
      stripeExpiryIframe: (frame) => frame.locator('iframe[name*="__privateStripeFrame"]').nth(1),
      stripeExpiryInput: (frame) => frame.getByRole('textbox', { name: 'Credit or debit card' }),
      stripeCvcIframe: (frame) => frame.locator('iframe[name*="__privateStripeFrame"]').nth(2),
      stripeCvcInput: (frame) => frame.getByRole('textbox', { name: 'Credit or debit card CVC/CVV' }),
      stripeZipInput: (frame) => frame.getByRole('textbox', { name: 'Zip Code' }),
      stripePayButton: (frame) => frame.getByRole('button', { name: 'Pay Now' }),
    };
  }
//========================================================================================

  async getActiveTab() {
    const isSqueez = await this.fields.squeezTab().isVisible();
    return isSqueez ? 'Squeez' : 'Waitlist';
  }
  
  async getTabPane() {
    const tab = await this.getActiveTab();
    return tab === 'Squeez' ? '#uncontrolled-tab-example-tabpane-Squeez' : '#uncontrolled-tab-example-tabpane-Waitlist';
  }
  
async handleSuccessPopup(provider = 'unknown', testInfo = null) {
  console.log('🔍 Handling success popup...');
  
  try {
    // Wait a bit longer for the success state to appear
    await this.page.waitForTimeout(3000);
    
    await this.captureScreenshot(
      `${provider}-booking-success`, 
      'PASSED', 
      'Booking completed', 
      testInfo
    );
    
    console.log('🔘 Looking for Return to Home button...');
    
    // Multiple button selector strategies for different flows
    const buttonSelectors = [
      // Waitlist-specific selectors
      this.page.getByRole('tabpanel', { name: 'Join Common Golf Waitlist' })
                .getByRole('button', { name: 'Return to Home' }),
      this.page.locator('[data-testid="return-home-btn"]'),
      
      // General selectors
      this.page.getByRole('button', { name: 'Return to Home' }).nth(1),
      this.page.getByRole('button', { name: 'Return to Home' }).first(),
      this.page.locator('button:has-text("Return to Home")').first(),
      this.page.locator('.modal-footer button:has-text("Return")'),
      
      // Close button alternatives
      this.page.getByRole('button', { name: 'Close' }),
      this.page.getByRole('button', { name: 'OK' }),
      this.page.locator('button[aria-label="Close"]')
    ];
    
    let buttonFound = false;
    
    // Try each selector with a shorter timeout
    for (const returnButton of buttonSelectors) {
      try {
        const isVisible = await returnButton.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          await returnButton.click({ force: true });
          console.log(`✅ Button clicked: ${returnButton}`);
          buttonFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!buttonFound) {
      console.log('ℹ️ No close button found - checking if popup auto-closed');
      
      // Check if we're already back at the form (success without manual close)
      const formVisible = await this.page.locator('#uncontrolled-tab-example-tabpane-Waitlist')
                                          .isVisible({ timeout: 2000 })
                                          .catch(() => false);
      
      if (formVisible) {
        console.log('✅ Popup auto-closed, form is visible');
      } else {
        console.log('⚠️ Trying Escape key as fallback...');
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(500);
        console.log('✅ Escape key pressed');
      }
    }
    
    await this.page.waitForTimeout(1000);
    console.log('✅ Success popup handled');
    
  } catch (error) {
    console.log(`⚠️ Error in handleSuccessPopup: ${error.message}`);
    await this.captureScreenshot(`${provider}-popup-error`, 'FAILED', error.message, testInfo);
    
    // Final fallback - just continue, the popup might have auto-closed
    console.log('ℹ️ Continuing test despite popup handling error');
  }
}

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
    const randomDays = Math.floor(Math.random() * 90) + 1;
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

    const submitButton = squeezTab.locator('button#btn-user-submit');
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

  async clickSqueezWaitlistButton() {
  const tabPane = await this.getTabPane();
  const button = this.fields.submitButton(tabPane);
  
  // Auto-waits for button to be actionable
  await button.click();
  
  const buttonText = tabPane.includes('Squeez') ? 'Squeez' : 'Waitlist';
  console.log(`✅ ${buttonText} button clicked`);
}
 //=======================================================================================================
async fillStripeCardAndPay(testInfo = null) {
  try {
    console.log('💳 Starting Stripe payment...');
    await this.page.waitForTimeout(3000);
    
    // IMPORTANT: Use .nth(1) not .first() for Stripe
    const paymentIframe = this.page.locator('iframe[title="Payment"]').nth(1);
    const hasPayment = await paymentIframe.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!hasPayment) {
      console.log('ℹ️ No payment needed');
      return;
    }
    
    console.log('✅ Payment iframe found, accessing content...');
    const paymentFrame = await paymentIframe.contentFrame();
    
    if (!paymentFrame) {
      throw new Error('Failed to access payment iframe content');
    }
    
    console.log('⏳ Waiting for payment interface to load...');
    await this.page.waitForTimeout(3000);
    await paymentFrame.locator('button').first().waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Payment interface loaded');
    
    // Click "Pay with Card" button
    console.log('🔍 Looking for "Pay with Card" button...');
    const payWithCardBtn = paymentFrame.getByRole('button', { name: 'Pay with Card' });
    await payWithCardBtn.scrollIntoViewIfNeeded();
    await payWithCardBtn.click();
    console.log('✅ Pay with Card clicked');
    
    // Wait for nested Stripe iframes to load
    await this.page.waitForTimeout(4000);
    
    // Fill card details in nested Stripe iframes
    await this.fillStripeCardDetails(paymentFrame);
    
    console.log('✅ Payment completed');
    
  } catch (error) {
    console.error('❌ Stripe payment error:', error.message);
    if (testInfo) {
      await this.captureScreenshot('stripe-payment', 'FAILED', error.message, testInfo);
    }
    throw error;
  }
}

async fillStripeCardDetails(paymentFrame) {
  console.log('💳 Filling card details...');
  await this.page.waitForTimeout(2000);
  
  // Card number - first nested iframe with __privateStripeFrame in name
  console.log('🔍 Looking for card number iframe...');
  const cardIframe = paymentFrame.locator('iframe[name*="__privateStripeFrame"]').first();
  await cardIframe.waitFor({ state: 'visible', timeout: 10000 });
  const cardFrame = await cardIframe.contentFrame();
  console.log('✅ Card number iframe loaded');
  
  const cardInput = cardFrame.getByRole('textbox', { name: 'Credit or debit card number' });
  await cardInput.waitFor({ state: 'visible', timeout: 10000 });
  await cardInput.click();
  await cardInput.fill('4242 4242 4242 4242');
  console.log('✅ Card number filled');
  
  // Expiry date - second nested iframe
  const expiryIframe = paymentFrame.locator('iframe[name*="__privateStripeFrame"]').nth(1);
  await expiryIframe.waitFor({ state: 'visible', timeout: 10000 });
  const expiryFrame = await expiryIframe.contentFrame();
  
  const expiryInput = expiryFrame.getByRole('textbox', { name: 'Credit or debit card' });
  await expiryInput.click();
  await expiryInput.fill('02 / 29');
  console.log('✅ Expiry filled');
  
  // CVC - third nested iframe
  const cvcIframe = paymentFrame.locator('iframe[name*="__privateStripeFrame"]').nth(2);
  await cvcIframe.waitFor({ state: 'visible', timeout: 10000 });
  const cvcFrame = await cvcIframe.contentFrame();
  
  const cvcInput = cvcFrame.getByRole('textbox', { name: 'Credit or debit card CVC/CVV' });
  await cvcInput.click();
  await cvcInput.fill('321');
  console.log('✅ CVC filled');
  
  // Zip code (in main payment frame, not nested)
  const zipInput = paymentFrame.getByRole('textbox', { name: 'Zip Code' });
  await zipInput.click();
  await zipInput.fill('54122');
  console.log('✅ Zip code filled');
  
  // Submit payment
  await this.page.waitForTimeout(1000);
  const payButton = paymentFrame.getByRole('button', { name: 'Pay Now' });
  await payButton.click();
  console.log('✅ Payment submitted');
  
  await this.page.waitForTimeout(6000);
}

//========================================================================
async fillFreedomCardAndPay(testInfo = null) {
  try {
    console.log('💳 Starting FreedomPay payment...');
    await this.page.waitForTimeout(3000);
    
    // Find payment iframe (try nth(1) first, then .first())
    let paymentIframe = this.fields.freedomPaymentIframe().nth(1);
    let hasIframe = await paymentIframe.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!hasIframe) {
      paymentIframe = this.fields.freedomPaymentIframe().first();
      hasIframe = await paymentIframe.isVisible({ timeout: 5000 }).catch(() => false);
    }
    
    if (!hasIframe) {
      console.log('ℹ️ No payment required');
      return;
    }
    
    console.log('✅ Payment iframe found, accessing content...');
    const paymentFrame = await paymentIframe.contentFrame();
    
    // Wait for React app to load
    console.log('⏳ Waiting for React app to load...');
    await this.fields.freedomPaymentRoot(paymentFrame).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(3000);
    await paymentFrame.locator('button').first().waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ React app loaded');
    
    // Click "Pay with Card"
    console.log('🔍 Looking for "Pay with Card" button...');
    const payWithCardBtn = this.fields.freedomPayWithCardBtn(paymentFrame);
    await payWithCardBtn.scrollIntoViewIfNeeded();
    await payWithCardBtn.click();
    console.log('✅ "Pay with Card" clicked');
    
    // Wait for FreedomPay nested iframe
    await this.page.waitForTimeout(4000);
    console.log('🔍 Looking for FreedomPay nested iframe...');
    const freedomIframe = this.fields.freedomNestedIframe(paymentFrame);
    await freedomIframe.waitFor({ state: 'visible', timeout: 15000 });
    const freedomFrame = await freedomIframe.contentFrame();
    console.log('✅ FreedomPay iframe loaded');
    
    // Fill card details
    await this.fillFreedomPayCardFields(freedomFrame);
    console.log('✅ Payment completed');
    
  } catch (error) {
    console.error('❌ FreedomPay error:', error.message);
    if (testInfo) {
      await this.captureScreenshot('freedompay-error', 'FAILED', error.message, testInfo);
    }
    throw error;
  }
}

async fillFreedomPayCardFields(freedomFrame) {
  console.log('💳 Filling card details...');
  await this.page.waitForTimeout(2000);
  
  // Card number
  const cardNumber = this.fields.freedomCardNumber(freedomFrame);
  await cardNumber.waitFor({ state: 'visible', timeout: 10000 });
  await cardNumber.click();
  await cardNumber.fill('4242 4242 4242 4242');
  console.log('✅ Card number filled');
  
  // Expiry
  const expiry = this.fields.freedomExpiry(freedomFrame);
  await expiry.click();
  await expiry.fill('02/32');
  console.log('✅ Expiry filled');
  
  // Security code
  const securityCode = this.fields.freedomSecurityCode(freedomFrame);
  await securityCode.click();
  await securityCode.fill('545');
  console.log('✅ Security code filled');
  
  // Postal code
  const postalCode = this.fields.freedomPostalCode(freedomFrame);
  await postalCode.click();
  await postalCode.fill('32145');
  console.log('✅ Postal code filled');
  
  // Submit
  const payButton = this.fields.freedomPayButton(freedomFrame);
  await payButton.click();
  console.log('✅ Payment submitted');
  
  await this.page.waitForTimeout(6000);
}





//===========================================================================

async fillFiservCardAndPay(testInfo = null) {
  try {
    console.log('💳 Starting Fiserv payment...');
    await this.page.waitForTimeout(3000);
    
    // Codegen shows .nth(1) is correct for Fiserv
    const paymentIframe = this.fields.fiservPaymentIframe().nth(1);
    const hasIframe = await paymentIframe.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (!hasIframe) {
      console.log('ℹ️ No payment required');
      return;
    }
    
    console.log('✅ Payment iframe found');
    const paymentFrame = await paymentIframe.contentFrame();
    
    // Wait for React app to load
    console.log('⏳ Waiting for React app to load...');
    await this.fields.fiservPaymentRoot(paymentFrame).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(3000);
    await paymentFrame.locator('button').first().waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ React app loaded');
    
    // Click "Pay with Card"
    console.log('🔍 Looking for "Pay with Card" button...');
    const payButton = this.fields.fiservPayWithCardBtn(paymentFrame);
    await payButton.scrollIntoViewIfNeeded();
    await payButton.click();
    console.log('✅ Pay with Card clicked');
    
    // Wait for nested iframe
    await this.page.waitForTimeout(4000);
    console.log('🔍 Looking for Fiserv nested iframe...');
    const cardIframe = this.fields.fiservNestedIframe(paymentFrame);
    await cardIframe.waitFor({ state: 'visible', timeout: 15000 });
    const cardFrame = await cardIframe.contentFrame();
    console.log('✅ Fiserv iframe loaded');
    
    // Fill card details
    await this.fillFiservCardFields(cardFrame, paymentFrame);
    console.log('✅ Payment completed');
    
  } catch (error) {
    console.error('❌ Fiserv payment error:', error.message);
    if (testInfo) {
      await this.captureScreenshot('fiserv-error', 'FAILED', error.message, testInfo);
    }
    throw error;
  }
}

async fillFiservCardFields(cardFrame, paymentFrame) {
  console.log('💳 Filling card details...');
  await this.page.waitForTimeout(2000);
  
  // Card number
  const cardNumber = this.fields.fiservCardNumber(cardFrame);
  await cardNumber.waitFor({ state: 'visible', timeout: 10000 });
  await cardNumber.click();
  await cardNumber.fill('4242 4242 4242 4242');
  console.log('✅ Card number filled');
  
  // Expiry
  const expiry = this.fields.fiservExpiry(cardFrame);
  await expiry.click();
  await expiry.fill('02 / 29');
  console.log('✅ Expiry filled');
  
  // CVC
  const cvc = this.fields.fiservCvc(cardFrame);
  await cvc.click();
  await cvc.fill('321');
  console.log('✅ CVC filled');
  
  // Postal code
  const postalCode = this.fields.fiservPostalCode(cardFrame);
  await postalCode.click();
  await postalCode.fill('32145');
  console.log('✅ Postal code filled');
  
  // Submit (Pay Now button is in paymentFrame, NOT cardFrame)
  const payNowBtn = this.fields.fiservPayNowBtn(paymentFrame);
  await payNowBtn.click();
  console.log('✅ Payment submitted');
  
  await this.page.waitForTimeout(6000);
}




//====================================================================================================
// async fillStripeCardAndPayWaitlist(testInfo = null) {
//   try {
//     console.log('💳 Starting Stripe payment...');
    
//     // Wait for payment iframe to load
//     await this.page.waitForTimeout(2000);
    
//     // Get the payment iframe
//     const paymentIframe = this.page
//       .getByRole('tabpanel', { name: 'Join Common Golf Waitlist' })
//       .locator('iframe[title="Payment"]')
//       .first();
    
//     const hasPayment = await paymentIframe.isVisible({ timeout: 5000 }).catch(() => false);
    
//     if (!hasPayment) {
//       console.log('ℹ️ No payment required');
//       return;
//     }
    
//     const paymentFrame = await paymentIframe.contentFrame();
//     console.log('✅ Payment iframe loaded');
    
//     // Wait for Stripe elements to load (no "Pay with Card" button in this flow)
//     await this.page.waitForTimeout(2000);
    
//     // Check if there are nested Stripe iframes (card fields)
//     const stripeIframes = await paymentFrame.locator('iframe[name*="__privateStripeFrame"]').count();
    
//     if (stripeIframes === 0) {
//       console.log('ℹ️ No Stripe card fields found - payment may not be required');
//       return;
//     }
    
//     console.log(`✅ Found ${stripeIframes} Stripe iframes`);
    
//     // Fill card number (first nested iframe)
//     const cardFrame = await paymentFrame.locator('iframe[name*="__privateStripeFrame"]').first().contentFrame();
//     await cardFrame.getByRole('textbox', { name: 'Credit or debit card number' }).fill('4242424242424242');
//     console.log('✅ Card number filled');
    
//     // Fill expiry (second nested iframe)
//     const expiryFrame = await paymentFrame.locator('iframe[name*="__privateStripeFrame"]').nth(1).contentFrame();
//     await expiryFrame.getByRole('textbox', { name: 'Credit or debit card' }).fill('1228');
//     console.log('✅ Expiry filled');
    
//     // Fill CVC (third nested iframe)
//     const cvcFrame = await paymentFrame.locator('iframe[name*="__privateStripeFrame"]').nth(2).contentFrame();
//     await cvcFrame.getByRole('textbox', { name: 'Credit or debit card CVC/CVV' }).fill('123');
//     console.log('✅ CVC filled');
    
//     // Fill zip code (in main payment frame - try multiple selectors)
//     const zipSelectors = [
//       paymentFrame.getByRole('textbox', { name: 'Zip Code' }),
//       paymentFrame.getByPlaceholder('Zip Code'),
//       paymentFrame.locator('input[name="postal"]')
//     ];
    
//     let zipFilled = false;
//     for (const zipField of zipSelectors) {
//       try {
//         if (await zipField.isVisible({ timeout: 2000 })) {
//           await zipField.fill('12345');
//           console.log('✅ Zip code filled');
//           zipFilled = true;
//           break;
//         }
//       } catch (e) {
//         continue;
//       }
//     }
    
//     if (!zipFilled) {
//       console.log('⚠️ Zip code field not found, continuing...');
//     }
    
//     // Look for Pay/Submit button in the main payment frame
//     const payButtonSelectors = [
//       paymentFrame.getByRole('button', { name: 'Pay Now' }),
//       paymentFrame.getByRole('button', { name: 'Submit' }),
//       paymentFrame.getByRole('button', { name: /pay/i }),
//       paymentFrame.locator('button[type="submit"]')
//     ];
    
//     let buttonClicked = false;
//     for (const button of payButtonSelectors) {
//       try {
//         if (await button.isVisible({ timeout: 2000 })) {
//           await button.click();
//           console.log('✅ Payment submitted');
//           buttonClicked = true;
//           break;
//         }
//       } catch (e) {
//         continue;
//       }
//     }
    
//     if (!buttonClicked) {
//       console.log('ℹ️ No submit button found - payment may auto-submit');
//     }
    
//     // Wait for payment to process
//     await this.page.waitForTimeout(5000);
//     console.log('✅ Payment completed');
    
//   } catch (error) {
//     console.error('❌ Stripe payment error:', error.message);
    
//     if (testInfo) {
//       const screenshotPath = `screenshots/stripe-payment-error-${Date.now()}.png`;
//       await this.page.screenshot({ path: screenshotPath, fullPage: true });
//       console.log(`📸 Screenshot saved: ${screenshotPath}`);
//     }
    
//     throw error;
//   }
// }
 
// async fillFreedomCardAndPayWaitlist(testInfo = null) {
//   try {
//     console.log('💳 Starting FreedomPay payment process...');
    
//     // Wait for payment iframe to appear and stabilize
//     await this.page.waitForTimeout(3000);
    
//     // Locate the payment iframe
//     const paymentIframe = this.page
//       .getByRole('tabpanel', { name: 'Join Common Golf Waitlist' })
//       .locator('iframe[title="Payment"]')
//       .first();
    
//     // Check if payment is required
//     const isPaymentVisible = await paymentIframe.isVisible({ timeout: 3000 }).catch(() => false);
    
//     if (!isPaymentVisible) {
//       console.log('ℹ️ No payment iframe found - payment may not be required');
//       return;
//     }
    
//     console.log('✅ Payment iframe is visible');
    
//     // Additional wait to ensure iframe content is loaded
//     await this.page.waitForTimeout(3000);
    
//     // Access the payment iframe content
//     const paymentFrame = await paymentIframe.contentFrame();
    
//     if (!paymentFrame) {
//       throw new Error('Failed to access payment iframe content');
//     }
    
//     console.log('✅ Successfully accessed payment frame');
    
//     // Scroll to make the "Pay with Card" button visible
//     // This is more elegant than multiple ArrowDown presses
//     const payWithCardButton = paymentFrame.getByRole('button', { name: 'Pay with Card' });
    
//     try {
//       // Scroll the button into view
//       await payWithCardButton.scrollIntoViewIfNeeded({ timeout: 5000 });
//       console.log('✅ Scrolled "Pay with Card" button into view');
//     } catch (scrollError) {
//       // Fallback: scroll the iframe body if scrollIntoView fails
//       console.log('⚠️ scrollIntoView failed, using alternative scroll method');
//       await paymentFrame.locator('#dvContent').click();
//       await paymentFrame.evaluate(() => {
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//       });
//     }
    
//     await this.page.waitForTimeout(2000);
    
//     // Click "Pay with Card" button
//     await payWithCardButton.waitFor({ state: 'visible', timeout: 5000 });
//     await payWithCardButton.click();
//     console.log('✅ Clicked "Pay with Card" button');
    
//     // Wait for FreedomPay iframe to load
//     await this.page.waitForTimeout(2000);
    
//     // Locate and wait for the nested FreedomPay iframe
//     const freedomPayIframe = paymentFrame.locator('iframe[title="FreedomPay iFrame"]');
//     await freedomPayIframe.waitFor({ state: 'attached', timeout: 10000 });
//     console.log('✅ FreedomPay iframe found');
    
//     // Access the FreedomPay iframe content
//     const freedomPayFrame = await freedomPayIframe.contentFrame();
    
//     if (!freedomPayFrame) {
//       throw new Error('Failed to access FreedomPay iframe content');
//     }
    
//     console.log('✅ Successfully accessed FreedomPay frame');
    
//     // Wait for card number field to be ready
//     const cardNumberField = freedomPayFrame.getByRole('textbox', { name: 'Card Number' });
//     await cardNumberField.waitFor({ state: 'visible', timeout: 10000 });
//     console.log('✅ Card input fields are ready');
    
//     // Test card details
//     const cardData = {
//       number: '4242424242424242',
//       expiry: '02/32',
//       securityCode: '321',
//       postalCode: '36985'
//     };
    
//     console.log('💳 Filling card details...');
    
//     // Fill card number
//     await cardNumberField.click();
//     await cardNumberField.fill(cardData.number);
//     console.log('✅ Card number filled');
    
//     // Fill expiration date
//     const expiryField = freedomPayFrame.getByRole('textbox', { name: 'Expiration Date' });
//     await expiryField.click();
//     await expiryField.fill(cardData.expiry);
//     console.log('✅ Expiration date filled');
    
//     // Fill security code (CVV)
//     const securityCodeField = freedomPayFrame.getByRole('textbox', { name: 'Security Code' });
//     await securityCodeField.click();
//     await securityCodeField.fill(cardData.securityCode);
//     console.log('✅ Security code filled');
    
//     // Fill postal code
//     const postalCodeField = freedomPayFrame.getByRole('textbox', { name: 'Postal Code' });
//     await postalCodeField.click();
//     await postalCodeField.fill(cardData.postalCode);
//     console.log('✅ Postal code filled');
    
//     // Submit payment
//     const payButton = freedomPayFrame.getByRole('button', { name: 'Pay' });
//     await payButton.waitFor({ state: 'visible', timeout: 5000 });
//     await payButton.click();
//     console.log('✅ Payment submitted - processing...');
    
//     // Wait for payment processing
//     await this.page.waitForTimeout(6000);
//     console.log('⏳ Waiting for payment confirmation...');
    
//     // Verify payment success by checking for "Return to Home" button
//     const returnHomeButton = this.page
//       .getByRole('tabpanel', { name: 'Join Common Golf Waitlist' })
//       .getByRole('button', { name: 'Return to Home' });
    
//     const isPaymentSuccessful = await returnHomeButton.isVisible({ timeout: 5000 }).catch(() => false);
    
//     if (isPaymentSuccessful) {
//       console.log('✅ Payment completed successfully!');
      
//       // Take screenshot of success state
//       if (testInfo) {
//         await this.page.screenshot({ 
//           path: `screenshots/payment-success-${testInfo.testId || Date.now()}.png`,
//           fullPage: true 
//         });
//       }
//     } else {
//       console.log('⚠️ Payment status unclear - "Return to Home" button not found');
//     }
    
//   } catch (error) {
//     console.error('❌ FreedomPay payment error:', error.message);
//     console.error('Stack trace:', error.stack);
    
//     // Take screenshot on error
//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     await this.page.screenshot({ 
//       path: `screenshots/payment-error-${timestamp}.png`,
//       fullPage: true 
//     }).catch(err => console.error('Failed to take error screenshot:', err));
    
//     throw error;
//   }
// }


// async fillFiservCardAndPayWaitlist(testInfo = null) {
//   try {
//     console.log('💳 Starting Fiserv payment...');
    
//     // Longer initial wait for iframe to appear
//     await this.page.waitForTimeout(3000);
    
//     // Locate payment iframe
//     const paymentIframe = this.page
//       .getByRole('tabpanel', { name: 'Join Common Golf Waitlist' })
//       .locator('iframe[title="Payment"]')
//       .first();
    
//     // Wait longer for payment iframe to be visible
//     const hasPayment = await paymentIframe.isVisible({ timeout: 10000 }).catch(() => false);
    
//     if (!hasPayment) {
//       console.log('ℹ️ No payment required');
//       return;
//     }
    
//     console.log('✅ Payment iframe visible');
    
//     // Additional wait for iframe content to load
//     await this.page.waitForTimeout(2000);
    
//     const paymentFrame = await paymentIframe.contentFrame();
    
//     if (!paymentFrame) {
//       throw new Error('Could not access payment iframe content');
//     }
    
//     console.log('✅ Payment frame accessed');
    
//     // Wait LONGER for Pay with Card button to appear - the button takes time to load!
//     await this.page.waitForTimeout(5000); // Increased from 2s to 5s
    
//     // Try multiple selectors for "Pay with Card" button
//     const payButtonSelectors = [
//       paymentFrame.getByRole('button', { name: 'Pay with Card' }),
//       paymentFrame.getByRole('button', { name: /pay.*card/i }),
//       paymentFrame.locator('button:has-text("Pay with Card")'),
//       paymentFrame.locator('button.squeez-payment-btn'),
//       paymentFrame.locator('button[class*="payment"]'),
//       paymentFrame.locator('button:has-text("Pay")'),
//     ];
    
//     let buttonVisible = false;
//     let payWithCardButton = null;
    
//     // Try each selector with retries
//     for (let attempt = 1; attempt <= 3; attempt++) {
//       console.log(`🔍 Attempt ${attempt}/3: Looking for Pay with Card button...`);
      
//       for (const button of payButtonSelectors) {
//         try {
//           if (await button.isVisible({ timeout: 3000 }).catch(() => false)) {
//             payWithCardButton = button;
//             buttonVisible = true;
//             console.log('✅ Pay with Card button found');
//             break;
//           }
//         } catch (e) {
//           continue;
//         }
//       }
      
//       if (buttonVisible) break;
      
//       if (attempt < 3) {
//         console.log('⚠️ Button not found, waiting 2s before retry...');
//         await this.page.waitForTimeout(2000);
//       }
//     }
    
//     if (!buttonVisible) {
//       console.log('⚠️ No "Pay with Card" button found after retries');
      
//       // Check if card fields are already visible (no payment needed or different flow)
//       await this.page.waitForTimeout(2000);
      
//       const directCardField = paymentFrame.locator('#card-number-input, input[name="cardNumber"], input[placeholder*="card number" i]').first();
//       const hasDirectCard = await directCardField.isVisible({ timeout: 3000 }).catch(() => false);
      
//       if (hasDirectCard) {
//         console.log('✅ Card fields already visible, skipping button click');
//         // Continue to fill card details below
//       } else {
//         // Try scrolling down in the iframe to reveal the button
//         console.log('🔽 Scrolling down in payment iframe...');
//         await paymentFrame.locator('body').evaluate((body) => {
//           body.scrollTop = body.scrollHeight;
//         });
//         await this.page.waitForTimeout(2000);
        
//         // Try finding button again after scroll
//         for (const button of payButtonSelectors) {
//           try {
//             if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
//               payWithCardButton = button;
//               buttonVisible = true;
//               console.log('✅ Pay with Card button found after scrolling');
//               break;
//             }
//           } catch (e) {
//             continue;
//           }
//         }
        
//         if (!buttonVisible) {
//           throw new Error('Pay with Card button not found even after scrolling and retries');
//         }
//       }
//     }
    
//     // Click the button if we found it
//     if (buttonVisible && payWithCardButton) {
//       await payWithCardButton.scrollIntoViewIfNeeded();
//       await payWithCardButton.click();
//       console.log('✅ Clicked Pay with Card button');
      
//       // CRITICAL: Wait longer for nested iframe to load after clicking
//       await this.page.waitForTimeout(5000);
//     }
    
//     // Try to find nested iframe with multiple attempts
//     let cardFrame = null;
//     let nestedIframeFound = false;
    
//     for (let attempt = 1; attempt <= 3; attempt++) {
//       console.log(`🔍 Attempt ${attempt}/3: Looking for nested iframe or card fields...`);
      
//       // First try nested iframe
//       const nestedIframe = paymentFrame.locator('iframe').first();
//       const hasNestedIframe = await nestedIframe.isVisible({ timeout: 5000 }).catch(() => false);
      
//       if (hasNestedIframe) {
//         const nestedContent = await nestedIframe.contentFrame();
//         if (nestedContent) {
//           cardFrame = nestedContent;
//           nestedIframeFound = true;
//           console.log('✅ Nested iframe found');
//           break;
//         }
//       }
      
//       // If no nested iframe, check if card fields are in main frame
//       const cardFieldInMain = paymentFrame.locator('#card-number-input, input[name="cardNumber"]').first();
//       if (await cardFieldInMain.isVisible({ timeout: 2000 }).catch(() => false)) {
//         cardFrame = paymentFrame;
//         console.log('✅ Card fields found in main payment frame');
//         break;
//       }
      
//       if (attempt < 3) {
//         console.log(`⚠️ Card fields not found, waiting 3s before retry...`);
//         await this.page.waitForTimeout(3000);
//       }
//     }
    
//     // If still no card frame, use main payment frame as fallback
//     if (!cardFrame) {
//       console.log('⚠️ Using main payment frame as fallback');
//       cardFrame = paymentFrame;
//     }
    
//     // Wait for card fields to be ready
//     await this.page.waitForTimeout(2000);
    
//     // Try to find card number input with multiple selectors
//     const cardSelectors = [
//       '#card-number-input',
//       'input[name="cardNumber"]',
//       'input[placeholder*="card number" i]',
//       'input[autocomplete="cc-number"]',
//       'input[id*="card"]',
//       'input[type="text"]'
//     ];
    
//     let cardNumberInput = null;
    
//     for (const selector of cardSelectors) {
//       try {
//         const input = cardFrame.locator(selector).first();
//         const isVisible = await input.isVisible({ timeout: 3000 }).catch(() => false);
        
//         if (isVisible) {
//           cardNumberInput = input;
//           console.log(`✅ Found card input with selector: ${selector}`);
//           break;
//         }
//       } catch (e) {
//         continue;
//       }
//     }
    
//     if (!cardNumberInput) {
//       throw new Error('Card number input not found in any frame');
//     }
    
//     // Fill card number
//     await cardNumberInput.fill('4242424242424242');
//     console.log('✅ Card number filled');
    
//     // Fill expiry
//     const expirySelectors = ['#expiration-input', 'input[name="expiry"]', 'input[placeholder*="expir" i]', 'input[autocomplete="cc-exp"]'];
    
//     for (const selector of expirySelectors) {
//       try {
//         const input = cardFrame.locator(selector).first();
//         if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
//           await input.fill('12/26');
//           console.log('✅ Expiry filled');
//           break;
//         }
//       } catch (e) {
//         continue;
//       }
//     }
    
//     // Fill CVC
//     const cvcSelectors = ['#cvc-input', 'input[name="cvc"]', 'input[placeholder*="cvc" i]', 'input[autocomplete="cc-csc"]'];
    
//     for (const selector of cvcSelectors) {
//       try {
//         const input = cardFrame.locator(selector).first();
//         if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
//           await input.fill('123');
//           console.log('✅ CVC filled');
//           break;
//         }
//       } catch (e) {
//         continue;
//       }
//     }
    
//     // Fill postal code
//     const postalSelectors = ['#postal-code-input', 'input[name="postalCode"]', 'input[placeholder*="zip" i]', 'input[autocomplete="postal-code"]'];
    
//     for (const selector of postalSelectors) {
//       try {
//         const input = cardFrame.locator(selector).first();
//         if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
//           await input.fill('12345');
//           console.log('✅ Postal code filled');
//           break;
//         }
//       } catch (e) {
//         continue;
//       }
//     }
    
//     // Wait before submitting
//     await this.page.waitForTimeout(1000);
    
//     // Submit payment - try both frames
//     const submitSelectors = [
//       paymentFrame.locator('button:has-text("Pay Now")'),
//       paymentFrame.locator('button:has-text("Pay")'),
//       paymentFrame.locator('button[type="submit"]'),
//       cardFrame.locator('button:has-text("Pay Now")'),
//       cardFrame.locator('button:has-text("Pay")'),
//       cardFrame.locator('button[type="submit"]'),
//     ];
    
//     let submitted = false;
    
//     for (const button of submitSelectors) {
//       try {
//         if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
//           await button.click();
//           console.log('✅ Payment submitted');
//           submitted = true;
//           break;
//         }
//       } catch (e) {
//         continue;
//       }
//     }
    
//     if (!submitted) {
//       console.log('⚠️ No submit button found, payment may auto-submit');
//     }
    
//     // Wait longer for payment processing
//     await this.page.waitForTimeout(5000);
//     console.log('✅ Payment completed');
    
//   } catch (error) {
//     console.error('❌ Fiserv payment error:', error.message);
    
//     if (testInfo) {
//       await this.captureScreenshot('fiserv-payment-error', 'FAILED', error.message, testInfo);
//     }
    
//     throw error;
//   }
// }

//=========================================================================================================


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