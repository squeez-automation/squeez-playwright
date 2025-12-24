const CryptoJS = require('crypto-js');

class ExploreBookingPage {
  constructor(page) {
    this.page = page;
    this.cachedGolfResponse = null;
    this.getStartedButton = page.getByRole('button', { name: 'Get Started Squeez Logo' });
    this.countryDropdown = page.getByRole('button', { name: 'US US +1 ▾' });
    this.indiaDropdown = page.getByRole('button', { name: 'IN IN +91 ▾' });
    this.countrySearchInput = page.getByRole('textbox', { name: 'Search country' });
    this.indiaOption = page.getByRole('button', { name: 'IN India +' });
    this.phoneNumberInput = page.getByRole('textbox', { name: 'Phone number' });
    this.continueButton = page.locator('button.btn-orange.w-100');
    this.restaurantsButton = page.getByRole('button', { name: 'Restaurants' });
    this.resetButton = page.getByText('Reset', { exact: true });
    this.timeSlotButtons = page.locator('button.btn.btn-light.btn-sm.bg-white.text-orange');
    this.dateDisplay = page.getByText(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/);
    this.bookNowButton = page.locator('.btn.book-now').first();
    this.reserveButton = page.getByRole('button', { name: 'Reserve' });
    this.viewBookingButton = page.locator('button.btn.btn-primary:has-text("View booking")');
  }

  async clickGetStarted() {
    await this.getStartedButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.getStartedButton.click();
  }

  async clickCountryDropdown() {
    const isIndiaVisible = await this.indiaDropdown.isVisible().catch(() => false);
    if (isIndiaVisible) {
      await this.indiaDropdown.click();
    } else {
      await this.countryDropdown.click();
    }
  }

  async searchCountry(text) {
    await this.countrySearchInput.click();
    await this.countrySearchInput.fill(text);
  }

  async selectIndia() {
    await this.indiaOption.click();
  }

  async fillPhoneNumber(phoneNumber) {
    await this.phoneNumberInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.phoneNumberInput.click();
    await this.phoneNumberInput.fill(phoneNumber);
  }

  async clickSendAccessCode() {
    await this.page.getByRole('button', { name: 'Send Access Code' }).click();
    await this.page.getByRole('textbox', { name: 'Please enter OTP character 1' }).waitFor({ state: 'visible', timeout: 10000 });
  }

  async fillOTP(otp) {
    const digits = otp.split('');
    for (let i = 0; i < digits.length; i++) {
      await this.page.getByRole('textbox', { name: `Please enter OTP character ${i + 1}` }).fill(digits[i]);
    }
  }

  async clickContinue() {
    await this.continueButton.waitFor({ state: 'visible' });
    await this.page.waitForFunction(() => {
      const btn = document.querySelector('button.btn-orange.w-100');
      return btn && !btn.disabled;
    }, { timeout: 10000 });
    await this.continueButton.click();
    await this.restaurantsButton.waitFor({ state: 'visible', timeout: 15000 });
  }

  async clickGolf() {
    this.cachedGolfResponse = null;
    const responsePromise = this.page.waitForResponse(
      resp => resp.url().includes('ActiveBusinessItemsDetails') && resp.url().includes('65c61866ea562b9cfd579468') && resp.status() === 200,
      { timeout: 30000 }
    );
    
    await this.restaurantsButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.restaurantsButton.click();
    await this.page.waitForTimeout(1000);
    
    const golfSelector = this.page.locator('text=Golf').first();
    await golfSelector.waitFor({ state: 'visible', timeout: 5000 });
    await golfSelector.click();
    
    this.cachedGolfResponse = await responsePromise.catch(() => null);
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  }

  async getVenuesByBookingProvider() {
    if (!this.cachedGolfResponse) {
      return { lightspeed: [], supremegolf: [], clubCaddie: [] };
    }
    
    const decrypted = await this.decryptResponse(this.cachedGolfResponse);
    if (!decrypted) return { lightspeed: [], supremegolf: [], clubCaddie: [] };
    
    const venues = decrypted.docs || decrypted.data || (Array.isArray(decrypted) ? decrypted : [decrypted]);
    const valid = venues.filter(v => v?.name || v?.venueName);
    
    console.log(`\n📋 ALL VENUES FROM API (${valid.length} total):`);
    debugger;
    valid.forEach((v, i) => console.log(`   ${i + 1}. ${v.name || v.venueName}`));
    //console.log(`\n⚠️ bookingProviderType NOT in list API - must click each venue to detect\n`);
    
    const lightspeed = [], supremegolf = [], clubCaddie = [];
    
    // Detect by venue name patterns (based on your API data)
    for (const venue of valid) {
      const name = (venue.name || venue.venueName || '').toLowerCase();
      
      if (name.includes('lightspeed') || name.includes('lightspeed')) {
        venue.bookingProviderType = 2;
        lightspeed.push(venue);
      } else if (name.includes('supreme') || name.includes('bloomingdale')) {
        venue.bookingProviderType = 4;
        supremegolf.push(venue);
      } else if (name.includes('caddie') || name.includes('freedom')) {
        venue.bookingProviderType = 5;
        clubCaddie.push(venue);
      }
    }
    
    console.log(`\n📊 Summary (name-based): Lightspeed: ${lightspeed.length} | SupremeGolf: ${supremegolf.length} | Club Caddie: ${clubCaddie.length}\n`);
    return { lightspeed, supremegolf, clubCaddie };
  }

  async clickAboutSection() {
    try {
      await this.page.locator('div').filter({ hasText: 'About SqueezSqueez for' }).nth(2).click({ timeout: 3000 });
    } catch (e) {
      // About section not found, skip
    }
  }

  async scrollDown(times = 1) {
    for (let i = 0; i < times; i++) await this.page.locator('body').press('ArrowDown');
  }

  async scrollUp(times = 1) {
    for (let i = 0; i < times; i++) await this.page.locator('body').press('ArrowUp');
  }

  async clickReset() {
    try {
      await this.resetButton.click({ timeout: 5000 });
    } catch (e) {
      console.log('⚠️ Reset button not found, skipping');
    }
  }

  async clickPickAvailable() {
    try {
      await this.timeSlotButtons.first().click({ timeout: 5000 });
      console.log('✅ Time slot selected');
    } catch (e) {
      console.log('⚠️ No time slots available');
      throw e;
    }
  }

  async clickDateDisplay() {
    await this.dateDisplay.first().click();
  }

  async selectRandomDate() {
    await this.page.waitForSelector('button[role="gridcell"]:not([disabled])', { state: 'visible', timeout: 5000 });
    const dates = await this.page.locator('button[role="gridcell"]:not([disabled]):not(.Mui-disabled)').all();
    if (dates.length === 0) return false;
    
    const today = Date.now();
    const futureDates = [];
    for (const date of dates) {
      const ts = await date.getAttribute('data-timestamp');
      if (ts && parseInt(ts) > today) futureDates.push(date);
    }
    
    const targetDates = futureDates.length > 0 ? futureDates : dates;
    await targetDates[Math.floor(Math.random() * targetDates.length)].click();
    return true;
  }

  async clickBookNow() {
    try {
      await this.bookNowButton.scrollIntoViewIfNeeded({ timeout: 5000 });
      await this.bookNowButton.click({ timeout: 5000 });
      console.log('✅ Book Now clicked');
    } catch (e) {
      console.log('⚠️ Book Now button not found');
      throw e;
    }
  }

  async clickReserve() {
    await this.reserveButton.click();
  }

  async completePayment(cardDetails) {
    const frame1 = this.page.frameLocator('#businessFilteModal iframe');
    const frame2 = frame1.frameLocator('#root iframe');
    await frame1.locator('button:has-text("Pay")').first().click();
    await frame2.getByRole('textbox', { name: 'Card Number' }).fill(cardDetails.cardNumber);
    await frame2.getByRole('textbox', { name: 'Expiration Date' }).fill(cardDetails.expirationDate);
    await frame2.getByRole('textbox', { name: 'Security Code' }).fill(cardDetails.securityCode);
    await frame2.getByRole('textbox', { name: 'Postal Code' }).fill(cardDetails.postalCode);
    await frame2.getByRole('button', { name: 'Pay' }).click();
    await this.page.locator('button:has-text("View booking")').waitFor({ state: 'visible' });
  }

  async clickViewBooking() {
    await this.viewBookingButton.click();
  }

  async decryptResponse(response) {
    try {
      const parsed = JSON.parse(await response.text());
      if (!parsed?.data?.encryptedData) return null;
      const key = CryptoJS.enc.Base64.parse('1QlDn5TlQNQ9ArpEvsqMtOrC+OB1iYpYRQDkN0gBUWA=');
      const iv = CryptoJS.enc.Base64.parse('GxTyJmGUXK2JxDj3bKondg==');
      const decrypted = CryptoJS.AES.decrypt(parsed.data.encryptedData, key, { iv });
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (e) {
      return null;
    }
  }
}

module.exports = { ExploreBookingPage };