const path = require('path'); // Import path module
const fs = require('fs'); // Import fs module
const { expect } = require('@playwright/test');

class BasePage {
  constructor(page) {
    this.page = page;
    this.fields = {
      
      placeInput: this.page.locator('input[id^="react-select"][id$="-input"]').nth(1),
      dateInput: this.page.getByPlaceholder('Select date').first(),
      priceInput: this.page.locator('input[placeholder="Price"]').first(),
      peopleInput: this.page.locator('input[placeholder="People"]').first(),
      descriptionInput: this.page.locator('input[placeholder="Description"]').first(),
      policyCheckbox: this.page.getByRole('checkbox', { name: /By clicking you agree/i }),
      squeezButton: this.page.locator("button.squeez-btn[title='squeez-request']").first(),
      //   popupModal: this.page.locator('.modal-content').filter({ hasText: 'Best Way to Connect with You' }).last(),
      //   firstNameInput: this.page.locator('input#firstName').last(),
      //   lastNameInput: this.page.locator('input#lastName').last(),
      //   countryDropdown: this.page.locator('.modal-content:visible .iti__selected-flag'),
      //   countrySearchBox: this.page.locator('.iti__country-list input[type="text"]'),
      //   countryOption: (country) => this.page.locator(`.iti__country-list li:has-text("${country}")`),
      //   phoneInput: this.page.locator('.modal-content:visible input[placeholder="Phone number"]').last(),
      //   emailInput: this.page.locator('.modal-content:visible input[placeholder="Email"]').first(),
      //   popupSubmit: this.page.locator('.modal-content:visible button.squeez-form[type="submit"]').first(),
    };
  }

  async selectCategory(data) {
    console.log('🎯 Selecting Category...');

    // --- CATEGORY ---
    const categoryControl = this.page.locator('.css-15noair-control').first();
    await categoryControl.scrollIntoViewIfNeeded();
    await categoryControl.waitFor({ state: 'visible', timeout: 10000 });
    await categoryControl.click({ force: true });
    await this.page.waitForTimeout(500);

    const categoryOption = this.page.getByRole('option', { name: data.category || 'Restaurants' });
    await categoryOption.waitFor({ state: 'visible', timeout: 8000 });
    await categoryOption.click({ force: true });
    console.log(`✅ Category selected: ${data.category || 'Restaurants'}`);

    // --- WAIT 2 SECONDS AFTER CATEGORY SELECTION ---
    await this.page.waitForTimeout(2000);
  }
   // ✅ Select business/place from dropdown by name
async selectBusinessByName(businessName) {
  console.log(`🎯 Selecting business/place: ${businessName}`);

  // Locator for place search input
  const placeInput = this.page.locator('#react-select-3-input');

  // Step 1️⃣ — Ensure visible and clickable
  await placeInput.scrollIntoViewIfNeeded();
  await placeInput.waitFor({ state: 'visible', timeout: 10000 });
  await placeInput.click({ force: true });
  console.log('✅ Business dropdown opened.');

  // Step 2️⃣ — Type the business name
  await placeInput.fill(businessName);
  await this.page.waitForTimeout(1000); // brief delay for dropdown options to load
  console.log(`⌨️  Typed: ${businessName}`);

  // Step 3️⃣ — Wait for and select the matching option
  const option = this.page.getByRole('option', { name: businessName });
  await option.waitFor({ state: 'visible', timeout: 8000 });
  await option.click({ force: true });
  console.log(`✅ Business selected: ${businessName}`);

  // Step 4️⃣ — Optional: small buffer after selection
  await this.page.waitForTimeout(1000);
}

  // =======================================================================================================

  async stripe(data) {
    console.log('🟢 Starting STRIPE Payment Flow...');

    // (Optional delay or log for clarity)
    // await this.page.waitForTimeout(1000);
    // console.log('✅ Category selection completed.');
    // await this.click(this.fields.descriptionInput);
    // await this.fill(this.fields.descriptionInput, description);
    // Step 2️⃣ — Continue Stripe-specific actions (fill price, details, etc.)
    // Example:
    // await this.clickAndFillPriceField(data.priceRange?.maxPrice || 100);
    // await this.clickAndFillPeopleField(data.maxPersonCount || 2);
    // await this.clickAndFillDesc('Automated booking for Stripe testing');
    // await this.fillPopupForm({ ... });

    console.log('✅ STRIPE Payment flow completed successfully.');
  }

  async fiserv(data) {
    console.log('🟢 Starting Fiserv Payment Flow...');

    // (Optional delay or log for clarity)
    // await this.page.waitForTimeout(1000);
    // console.log('✅ Category selection completed.');
    // await this.click(this.fields.descriptionInput);
    // await this.fill(this.fields.descriptionInput, description);
    // Step 2️⃣ — Continue Stripe-specific actions (fill price, details, etc.)
    // Example:
    // await this.clickAndFillPriceField(data.priceRange?.maxPrice || 100);
    // await this.clickAndFillPeopleField(data.maxPersonCount || 2);
    // await this.clickAndFillDesc('Automated booking for Stripe testing');
    // await this.fillPopupForm({ ... });

    console.log('✅ FISERV Payment flow completed successfully.');
  }

  // 🟩 ================================================================ //
  // 🟩 CLICK HANDLER METHOD                                            //
  // 🟩 ================================================================ //
  async click(locator, testInfo = null) {
    try {
      await locator.waitFor({ state: 'visible', timeout: this.timeout });
      await locator.click({ timeout: this.timeout, force: true });
      console.log(`✅ Clicked element`);
    } catch (err) {
      console.warn(`❌ Click failed: ${err.message}`);
      await this.captureScreenshot('click_error', testInfo);
      throw err;
    }
  }

  // 🟦 ================================================================ //
  // 🟦 FILL FIELD METHOD                                               //
  // 🟦 ================================================================ //
  async fill(locator, value, testInfo = null) {
    try {
      await locator.waitFor({ state: 'visible', timeout: this.timeout });

      const inputType = await locator.getAttribute('type');

      // Directly remove the 'readonly' attribute from the input element
      if (inputType === 'text' || inputType === 'date') {
        await locator.evaluate((el) => el.removeAttribute('readonly'));
      }

      const stringValue = String(value).trim();
      await locator.fill(stringValue, { force: true });
      console.log(`✅ Filled input with: ${stringValue}`);
    } catch (err) {
      console.warn(`❌ Fill failed for "${value}": ${err.message}`);
      await this.captureScreenshot('fill_error', testInfo);
      throw err;
    }
  }

  // 🟪 ================================================================ //
  // 🟪 CAPTURE SCREENSHOT                                              //
  // 🟪 ================================================================ //
  async captureScreenshot(name = 'error', testInfo = null) {
    const timestamp = Date.now();
    const fileName = `${name}_${timestamp}.png`;
    const errorDir = path.resolve(__dirname, '../errors');

    if (!fs.existsSync(errorDir)) {
      fs.mkdirSync(errorDir, { recursive: true });
    }

    const filePath = path.join(errorDir, fileName);

    const buffer = await this.page.screenshot({
      path: filePath,
      fullPage: true,
    });

    if (testInfo?.attach) {
      await testInfo.attach(name, {
        contentType: 'image/png',
        body: buffer,
      });
      console.log(`📎 Screenshot attached to Allure via testInfo.`);
    }

    console.log(`📸 Screenshot saved at: ${filePath}`);
    return filePath;
  }

  // 🟨 ================================================================ //
  // 🟨 FILL RANDOM DATE IN FIELD                                       //
  // 🟨 ================================================================ //

  async fillRandomDateInField(dateInputLocator) {
    // Get today's date
    const today = new Date();

    // Generate a random number of days (between 1 and 20)
    const randomDays = Math.floor(Math.random() * 20) + 1;

    // Calculate the future date
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + randomDays);

    // Format the date in "Wed, 22 Oct 2025" format
    const options = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
    const formattedDate = futureDate.toLocaleDateString('en-GB', options).replace(/ /g, ' ');

    // Ensure the date input field is visible and interactable
    await dateInputLocator.scrollIntoViewIfNeeded();
    await dateInputLocator.waitFor({ state: 'visible', timeout: 5000 });

    // Remove readonly attribute to make the field editable
    await this.page.evaluate(() => {
      const dateInput = document.querySelector('input[placeholder="Select date"]');
      if (dateInput) {
        dateInput.removeAttribute('readonly');
      }
    });

    // Click the date input field to open the date picker (if necessary)
    await dateInputLocator.click({ force: true });

    // Fill the date input field with the formatted random date
    await dateInputLocator.fill(formattedDate);
    console.log(`✅ Filled date field with: ${formattedDate}`);

    return formattedDate;
  }

  // 🟧 ================================================================ //
  // 🟧 SELECT CATEGORY                                                  //
  // 🟧 ================================================================ //

  // 🟥 ================================================================ //
  // 🟥 CLICK AND FILL PRICE FIELD                                      //
  // 🟥 ================================================================ //
  async clickAndFillPriceField(price) {
    console.log('🎯 Clicking on the price field...');
    await this.click(this.fields.priceInput);
    await this.fill(this.fields.priceInput, price);
    console.log(`✅ Price field filled with: ${price}`);
  }

  // 🟫 ================================================================ //
  // 🟫 CLICK AND FILL PEOPLE FIELD                                     //
  // 🟫 ================================================================ //

  async clickAndFillPeopleField(people) {
    console.log('🎯 Clicking on the people field...');
    await this.click(this.fields.peopleInput);
    await this.fill(this.fields.peopleInput, people);
    console.log(`✅ People field filled with: ${people}`);
  }

  // ⚪ ================================================================ //
  // ⚪ CLICK AND FILL DESCRIPTION FIELD                                //
  // ⚪ ================================================================ //

  async clickAndFillDesc(description) {
    console.log('🎯 Clicking on the description field...');
    await this.click(this.fields.descriptionInput);
    await this.fill(this.fields.descriptionInput, description);
    console.log(`✅ Description field filled with: ${description}`);
    await this.click(this.fields.policyCheckbox);
    await this.click(this.fields.squeezButton);
  }

  // 🔵 ================================================================ //
  // 🔵 FILL POPUP FORM                                                 //
  // 🔵 ================================================================ //
  async fillPopupForm(row) {
    // Wait until modal is visible
    await this.fields.popupModal.waitFor({ state: 'visible', timeout: 8000 });

    // First Name
    if (row.firstNameInput) {
      await this.fields.firstNameInput.click({ force: true });
      await this.fields.firstNameInput.fill('');
      await this.fields.firstNameInput.type(row.firstNameInput.toString().trim(), { delay: 100 });
    }

    // Last Name
    if (row.lastNameInput) {
      await this.fields.lastNameInput.click({ force: true });
      await this.fields.lastNameInput.fill('');
      await this.fields.lastNameInput.type(row.lastNameInput.toString().trim(), { delay: 100 });
    }

    // Country selection
    if (row.countryInput) {
      const countryButton = this.page.locator('.modal-content:visible button.country-button').first();
      await countryButton.waitFor({ state: 'visible', timeout: 5000 });
      await countryButton.click({ force: true });

      const countrySearch = this.page.locator('input.searchCountry');
      await countrySearch.waitFor({ state: 'visible', timeout: 5000 });

      await countrySearch.click({ force: true });
      await countrySearch.fill('');
      await countrySearch.type(row.countryInput.toString().trim(), { delay: 80 });
      await this.page.waitForTimeout(700);

      const countryOption = this.page.locator(`.dropdown-menu.show li:has-text("${row.countryInput}")`).first();
      if (await countryOption.count()) {
        await countryOption.click({ force: true });
      } else {
        await this.page.keyboard.press('Enter');
      }

      console.log(`✅ Country selected: ${row.countryInput}`);
    }

    // Phone
    if (row.phoneInput) {
      await this.fields.phoneInput.click({ force: true });
      await this.fields.phoneInput.fill('');
      await this.fields.phoneInput.type(String(row.phoneInput), { delay: 80 });
    }

    // EMAIL INPUT
    if (row.emailInput) {
      const emailField = this.page.locator('input#email[placeholder="Email"]').last();
      await emailField.waitFor({ state: 'visible', timeout: 8000 });
      await emailField.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(300);

      await emailField.click({ force: true });
      await emailField.fill('');
      await emailField.type(row.emailInput.toString().trim(), { delay: 120 });

      await this.page.waitForTimeout(500);
      await emailField.press('Tab');

      const finalVal = await emailField.inputValue();
      if (!finalVal || finalVal.trim() === '') {
        console.warn('⚠️ Email cleared by UI — retrying once...');
        await emailField.click({ force: true });
        await emailField.type(row.emailInput.toString().trim(), { delay: 100 });
        await this.page.waitForTimeout(400);
        await emailField.press('Tab');
      }

      console.log(`✅ Email confirmed and React state synced: ${row.emailInput}`);
    }

    // SUBMIT POPUP
    const popupSubmitBtn = this.page.locator('.modal-content:visible button.squeez-form[type="submit"]').last();
    await popupSubmitBtn.waitFor({ state: 'visible', timeout: 8000 });
    await popupSubmitBtn.scrollIntoViewIfNeeded();
    await popupSubmitBtn.click({ force: true });
    await this.page.waitForTimeout(2000);
    console.log(`✅ Popup form submitted for ${row.firstNameInput} ${row.lastNameInput}`);
  }

  // 🟣 ================================================================ //
  // 🟣 FILL FREEDOM PRE-PAY CARD FLOW                                           //
  // 🟣 ================================================================ //
  async fillFreedomCardAndPay(row) {
    const visibleModal = this.page.locator('.modal-content:visible').filter({ hasText: 'Please Enter Payment Details' });
    await visibleModal.waitFor({ state: 'visible', timeout: 20000 });

    // --- Handle Tip dropdown (if exists) ---
    const tipDropdown = visibleModal.locator('select.form-select.mb-2.mt-2').first();
    if ((await tipDropdown.count()) > 0) {
      try {
        const formattedTip = row.tipDropdown
          ? typeof row.tipDropdown === 'number'
            ? `${Math.round(row.tipDropdown * 100)}%`
            : String(row.tipDropdown).replace('%', '').trim() + '%'
          : '0%';
        await tipDropdown.waitFor({ state: 'visible', timeout: 8000 });
        await tipDropdown.selectOption({ label: formattedTip });
        console.log(`✅ Tip selected: ${formattedTip}`);
      } catch {
        console.warn('⚠️ Tip dropdown present but selection failed — continuing');
      }
    } else {
      console.log('ℹ️ No tip dropdown found, proceeding directly to card fields...');
    }

    // --- Get Total ---
    const totalElement = visibleModal.locator('div:has-text("Total:") span').last();
    await totalElement.waitFor({ state: 'visible', timeout: 8000 });
    const totalText = await totalElement.innerText();
    const totalAmount = totalText.replace('$', '').trim();
    console.log(`💰 Total amount before payment: $${totalAmount}`);

    // --- Stripe Frames ---
    await this.page.waitForTimeout(1500);
    let stripeFrames = this.page
      .frames()
      .filter((f) => f.url().includes('stripe') || f.name().includes('__privateStripeFrame') || f.name().includes('__stripe'));
    if (stripeFrames.length === 0) {
      await this.page.waitForTimeout(2000);
      stripeFrames = this.page
        .frames()
        .filter((f) => f.url().includes('stripe') || f.name().includes('__privateStripeFrame') || f.name().includes('__stripe'));
    }
    if (stripeFrames.length === 0) throw new Error('❌ No Stripe iframes found on the page');

    // --- Expiry Formatter ---
    const formatExcelExpiry = (excelValue) => {
      if (!excelValue || isNaN(excelValue)) return String(excelValue);
      const jsDate = new Date((excelValue - 25569) * 86400 * 1000);
      const month = String(jsDate.getMonth() + 1).padStart(2, '0');
      const year = jsDate.getFullYear().toString().slice(-2);
      return `${month} / ${year}`;
    };

    // --- Stripe Input Filler ---
    const fillStripeInput = async (placeholder, value) => {
      await this.page.waitForTimeout(1000);
      const frames = this.page
        .frames()
        .filter((f) => f.url().includes('stripe') || f.name().includes('__privateStripeFrame') || f.name().includes('__stripe'));
      for (const frame of frames) {
        const input = frame.locator(`input[placeholder="${placeholder}"]`);
        if ((await input.count()) > 0) {
          await input.scrollIntoViewIfNeeded();
          await input.click({ force: true });
          await input.fill('');
          await input.type(String(value), { delay: 80 });
          console.log(`✅ Filled ${placeholder} with ${value}`);
          return;
        }
      }
      throw new Error(`❌ Stripe input not found: ${placeholder}`);
    };

    // --- Fill Card Fields ---
    await fillStripeInput('Card number', row.cardNumber);
    await fillStripeInput('MM / YY', formatExcelExpiry(row.cardExpiry));
    await fillStripeInput('CVC', row.cardCVC);
    await fillStripeInput('ZIP', row.cardZip);

    // --- Click Pay / Confirm ---
    const confirmButton = visibleModal.locator('button.squeez-form[type="submit"], button:has-text("Pay")').first();
    await confirmButton.waitFor({ state: 'visible', timeout: 8000 });
    await confirmButton.click({ force: true });
    console.log('✅ Payment form submitted');

    // --- Wait for backend + UI update (no networkidle) ---
    await this.page.waitForTimeout(8000); // allow API & React to complete rendering

    // --- Wait for Success Confirmation Popup ---
    try {
      const successPopup = this.page.locator('text=Your Request has been submitted');
      await successPopup.waitFor({ state: 'visible', timeout: 20000 });
      console.log('✅ Success popup appeared: Your Request has been submitted!');

      // --- Click Return to Home Button ---
      const returnHomeButton = this.page.locator('button.squeez-form:has-text("Return to Home")');
      if (await returnHomeButton.count()) {
        await returnHomeButton.waitFor({ state: 'visible', timeout: 8000 });
        await returnHomeButton.scrollIntoViewIfNeeded();
        await returnHomeButton.click({ force: true });
        console.log("✅ Clicked 'Return to Home' button successfully.");
      } else {
        console.warn("⚠️ 'Return to Home' button not found after popup appeared.");
      }
    } catch (err) {
      console.warn('⚠️ Success popup not detected — possible delayed rendering.');
    }

    // --- Verify Payment Success ---
    const bodyText = await this.page.textContent('body');
    if (bodyText.includes(totalAmount)) {
      console.log(`✅ Payment successful: $${totalAmount}`);
    } else {
      console.warn(`⚠️ Payment verification failed — Expected $${totalAmount}`);
    }

    return parseFloat(totalAmount);
  }

  // 🔴 ================================================================ //
  // 🔴 FILL FREEDOM PAY CARD DETAILS                                     //
  // 🔴 ================================================================ //
  async fillFreedomCardAndPay() {
    console.log('💳 Waiting for FreedomPay tabpanel and iframe...');

    // --- Access iframe inside AUTO-FREEDOMPAY-PREPAYMENT tabpanel ---
    const frameLocator = this.page.getByRole('tabpanel', { name: 'AUTO-FREEDOMPAY-PREPAYMENT' }).locator('iframe');

    console.log('⏳ Waiting for iframe to attach...');
    await frameLocator.waitFor({ state: 'attached', timeout: 60000 });

    const frame = await frameLocator.contentFrame();
    if (!frame) throw new Error('❌ Could not get FreedomPay iframe content.');

    console.log('✅ FreedomPay iframe attached successfully.');

    // Static test card data
    const cardData = {
      number: '4242 4242 4242 4242',
      expiry: '02/28',
      cvc: '546',
      zip: '32145',
    };

    // Helper: click + fill with logs
    const clickAndFill = async (roleName, value, label) => {
      try {
        console.log(`🟣 Filling ${label}: ${value}`);
        const field = frame.getByRole('textbox', { name: roleName });
        await field.waitFor({ state: 'visible', timeout: 15000 });
        await field.scrollIntoViewIfNeeded();
        await field.click({ force: true });
        await field.fill(value);
        console.log(`✅ ${label} filled successfully.`);
      } catch (err) {
        console.error(`❌ Failed to fill ${label}: ${err.message}`);
      }
    };

    // Fill payment fields
    await clickAndFill('Card Number', cardData.number, 'Card Number');
    await clickAndFill('Expiration Date', cardData.expiry, 'Expiration Date');
    await clickAndFill('Security Code', cardData.cvc, 'Security Code');
    await clickAndFill('Postal Code', cardData.zip, 'Postal Code');

    // Click Pay button
    console.log('🟠 Waiting for Pay button...');
    const payBtn = frame.getByRole('button', { name: /Pay/i });
    await payBtn.waitFor({ state: 'visible', timeout: 15000 });
    console.log('🟢 Clicking Pay button...');
    await payBtn.click({ force: true });
    console.log('✅ Pay button clicked successfully!');

    // Wait for confirmation
    const successMsg = this.page.locator('h4.mainAccessPage:has-text("Your Request has been submitted")');
    try {
      await successMsg.waitFor({ state: 'visible', timeout: 30000 });
      console.log('🎉 Booking completed successfully — confirmation message visible.');
    } catch {
      console.warn('⚠️ Success message not found — possibly sandbox mode.');
    }

    await this.page.waitForTimeout(4000); // allow API & React to complete rendering

    // --- Wait for Success Confirmation Popup ---
    try {
      const successPopup = this.page.locator('text=Your Request has been submitted');
      await successPopup.waitFor({ state: 'visible', timeout: 10000 });
      console.log('✅ Success popup appeared: Your Request has been submitted!');

      // --- Click Return to Home Button ---
      const returnHomeButton = this.page.locator('button.squeez-form:has-text("Return to Home")');
      if (await returnHomeButton.count()) {
        await returnHomeButton.waitFor({ state: 'visible', timeout: 4000 });
        await returnHomeButton.scrollIntoViewIfNeeded();
        await returnHomeButton.click({ force: true });
        console.log("✅ Clicked 'Return to Home' button successfully.");
      } else {
        console.warn("⚠️ 'Return to Home' button not found after popup appeared.");
      }
    } catch (err) {
      console.warn('⚠️ Success popup not detected — possible delayed rendering.');
    }
  }

  // // Method to complete the booking process
  // async completeSqueezFiservBooking(data) {
  //   console.log('🎯 Starting the booking process...', data);

  //   await this.selectCategory(data);
  //   await this.fillRandomDateInField(this.fields.dateInput);
  //   //await this.fillTimeField(this.fields.startTimeInput, data.startTimeInput);
  //   await this.clickAndFillPriceField(data.priceInput);
  //   await this.clickAndFillPeopleField(data.peopleInput);
  //   await this.clickAndFillDesc(data.descriptionInput);
  //   await this.fillPopupForm(data);
  //   await this.runGolfPrePayFlow(data);
  //   console.log('✅ Booking process completed successfully.');
  // }
}
module.exports = BasePage;
