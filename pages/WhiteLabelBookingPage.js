// WhiteLabelBookingPage.js
class WhiteLabelBookingPage {
  constructor(page) {
    this.page = page;
    
    // Locators
    this.timeSlotButtons = page.getByRole('button').filter({ hasText: /\d+:\d+\s*(AM|PM)/i });
    this.timeSlotButton = (time) => page.getByRole('button', { name: time, exact: true });
    this.guestsCombobox = page.getByRole('combobox');
    this.dateTextbox = page.getByRole('textbox', { name: 'Select date' });
    this.calendarDates = page.locator('[class*="date"]:visible, [role="gridcell"]:visible');
    this.dateOption = (date) => page.getByText(date, { exact: true });
    this.timeSlotWithPriceButtons = page.getByRole('button').filter({ hasText: /\$\d+/ });
    this.timeSlotWithPrice = (time) => page.getByRole('button', { name: time });
    this.modal = page.locator('[role="dialog"], .modal-content, .modal').first();
    this.reserveButton = this.modal.getByRole('button', { name: 'Reserve' });
    this.firstNameInput = page.getByRole('textbox', { name: 'Enter first name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Enter last name' });
    this.emailInput = page.getByRole('textbox', { name: 'Enter your email address' });
    this.countryCodeButton = page.getByRole('button', { name: 'US US +' });
    this.countrySearchInput = page.getByRole('textbox', { name: 'Search country' });
    this.countryOption = (country) => page.getByRole('button', { name: country, exact: true });
    this.phoneNumberInput = page.getByRole('textbox', { name: 'Phone number' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.closeButton = page.getByRole('button', { name: 'Close', exact: true });
  }

  // Payment iframe locators
  async getPaymentFrame() {
  const frame = await this.page.locator('iframe[title="Payment"]').contentFrame();
  if (!frame) {
    throw new Error('Payment frame not found');
  }
  return frame;
}

 async getCardNumberFrame() {
  const paymentFrame = await this.getPaymentFrame();
  return paymentFrame.locator('iframe').first().contentFrame();
}

async getExpiryFrame() {
  const paymentFrame = await this.getPaymentFrame();
  return paymentFrame.locator('iframe').nth(1).contentFrame();
}

async getCvcFrame() {
  const paymentFrame = await this.getPaymentFrame();
  return paymentFrame.locator('iframe').nth(2).contentFrame();
}
  // Methods
  async navigate(url) {
    await this.page.goto(url);
  }
  async selectFirstTimeSlot() {
    await this.timeSlotButtons.first().click();
  }
  async selectTimeSlot(time) {
    await this.timeSlotButton(time).click();
  }
  async selectNumberOfGuests(numberOfGuests) {
    await this.guestsCombobox.selectOption(numberOfGuests);
  }
  async selectFirstAvailableDate() {
    await this.dateTextbox.click();
    // Get current date
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
    const dateToClick = threeDaysLater.getDate().toString();
    
    try {
      await this.page.getByText(dateToClick, { exact: true }).click();
    } catch {
      
      await this.calendarDates.nth(2).click();
    }
  }

  async selectDate(date) {
    await this.dateTextbox.click();
    await this.dateOption(date).click();
  }
  async selectFirstTimeSlotWithPrice() {
  
    await this.timeSlotWithPriceButtons.first().click();
  }
  async selectTimeSlotWithPrice(timeAndPrice) {
    await this.timeSlotWithPrice(timeAndPrice).click();
  }
  async scrollDown(times = 14) {
    
    const scrollAmount = times * 50; // Approximate pixel amount per arrow press
    await this.page.evaluate((pixels) => {
      window.scrollBy(0, pixels);
    }, scrollAmount);
  }
  async proceedToBooking() {
   
    await this.reserveButton.click();
  }
  async fillPersonalInformation(firstName, lastName, email) {
    await this.firstNameInput.click();
    await this.firstNameInput.fill(firstName);
    await this.firstNameInput.press('Tab');
    await this.lastNameInput.fill(lastName);
    await this.emailInput.click();
    await this.emailInput.fill(email);
  }
  async selectCountryCode(searchTerm, countryOption) {
    await this.countryCodeButton.click();
    await this.countrySearchInput.click();
    await this.countrySearchInput.fill(searchTerm);
    await this.countryOption(countryOption).click();
  }
  async fillPhoneNumber(phoneNumber) {
    await this.phoneNumberInput.click();
    await this.phoneNumberInput.fill(phoneNumber);
  }
  async submitReservation() {
    await this.submitButton.click();
  }
  async fillPaymentDetails(cardNumber, expiry, cvc, zipCode) {
  const paymentFrame = await this.getPaymentFrame();
  
  // Fixed: Match "Pay with Card" button specifically
  await paymentFrame.locator('button:has-text("Card")').click();
  await this.page.waitForTimeout(2000);
  
  const cardFrame = await this.getCardNumberFrame();
  await cardFrame.getByPlaceholder('1234 1234 1234 1234').fill(cardNumber);
  
  const expiryFrame = await this.getExpiryFrame();
  await expiryFrame.getByPlaceholder('MM / YY').fill(expiry);
  
  const cvcFrame = await this.getCvcFrame();
  await cvcFrame.getByPlaceholder('CVC').fill(cvc);
  
  await paymentFrame.getByPlaceholder('Zip Code').fill(zipCode);
}

  async scrollInPaymentFrame(times = 3) {
    return;
  }

  async completePayment() {
    const paymentFrame = await this.getPaymentFrame();
    // Scroll the Pay Now button into view before clicking
    await paymentFrame.getByRole('button', { name: 'Pay Now' }).scrollIntoViewIfNeeded();
    await paymentFrame.getByRole('button', { name: 'Pay Now' }).click();
  }

  async closeConfirmation() {
    await this.closeButton.click();
  }
}

module.exports = WhiteLabelBookingPage;