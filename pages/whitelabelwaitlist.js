class whitelabelwaitlist {
  constructor(page) {
    this.page = page;
    
    // Locators
    this.fields = {
      // Tabs
      // Second tab (index 1)
      waitlistTab: page.getByRole('tab').nth(1),
      
      // Form fields
      earliestTimeInput: page.locator('#timePicker2'),
      priceTextbox: page.getByRole('textbox', { name: 'Price' }),
      reasonDropdown: page.locator('#uncontrolled-tab-example-tabpane-Waitlist > .schedule-wrapper > .schedule-form > .row > div:nth-child(5) > #reason-select > .css-15noair-control > .css-hlgwow > .css-19bb58m'),
      birthdayOption: page.getByRole('option', { name: 'Birthday' }),
      descriptionTextbox: page.getByRole('textbox', { name: 'Description' }),
      waitlistButton: page.getByRole('button', { name: 'Waitlist' }),
      
      // Personal information fields
      firstNameInput: page.getByRole('tabpanel', { name: 'Join Common Golf Waitlist' }).getByPlaceholder('First Name'),
      lastNameInput: page.getByRole('tabpanel', { name: 'Join Common Golf Waitlist' }).getByPlaceholder('Last Name'),
      countrySelector: page.getByLabel('Join Common Golf').getByText('US+'),
      countrySearch: page.getByPlaceholder('Search country'),
      indiaOption: page.getByText('India+'),
      phoneInput: page.getByRole('tabpanel', { name: 'Join Common Golf Waitlist' }).getByPlaceholder('Phone number'),
      emailInput: page.getByRole('tabpanel', { name: 'Join Common Golf Waitlist' }).getByPlaceholder('Email'),
      
      // Buttons
      submitButton: page.getByLabel('Join Common Golf').getByText('Submit'),
      returnHomeButton: page.getByRole('button', { name: 'Return to Home' }).nth(1)
    };
  }

  // Navigation methods
  async navigateToWaitlist(url) {
    await this.page.goto(url);
  }

async clickWaitlistTab() {
  await this.fields.waitlistTab.click();
  // Wait for the time picker to be visible after tab opens
  await this.page.waitForSelector('#timePicker2', { state: 'visible', timeout: 5000 });
}


  // Form filling methods
  async fillPrice(price) {
    await this.fields.priceTextbox.click();
    await this.fields.priceTextbox.fill(price);
  }

  async selectReason(reason = 'Birthday') {
    await this.fields.reasonDropdown.click();
    if (reason === 'Birthday') {
      await this.fields.birthdayOption.click();
    }
  }

  async fillDescription(description) {
    await this.fields.descriptionTextbox.click();
    await this.fields.descriptionTextbox.fill(description);
  }

  async clickWaitlistButton() {
    await this.fields.waitlistButton.click();
  }

  // Personal information methods
  async fillFirstName(firstName) {
    await this.fields.firstNameInput.click();
    await this.fields.firstNameInput.fill(firstName);
    await this.fields.firstNameInput.press('Tab');
  }

  async fillLastName(lastName) {
    await this.fields.lastNameInput.fill(lastName);
  }

  async selectCountry(country = 'India') {
    await this.fields.countrySelector.click();
    await this.fields.countrySearch.click();
    await this.fields.countrySearch.fill(country.toLowerCase());
    
    if (country === 'India') {
      await this.fields.indiaOption.click();
    }
  }

  async fillPhoneNumber(phone) {
    await this.fields.phoneInput.click();
    await this.fields.phoneInput.fill(phone);
  }

  async fillEmail(email) {
    await this.fields.emailInput.click();
    await this.fields.emailInput.fill(email);
  }

  async submitForm() {
    await this.fields.submitButton.click();
  }

  async clickReturnHome() {
    await this.fields.returnHomeButton.click();
  }

  // Combined workflow methods
  async fillWaitlistForm(formData) {
    await this.fillPrice(formData.price);
    await this.selectReason(formData.reason);
    await this.fillDescription(formData.description);
    await this.clickWaitlistButton();
  }

  async fillPersonalInformation(personalData) {
    await this.fillFirstName(personalData.firstName);
    await this.fillLastName(personalData.lastName);
    await this.selectCountry(personalData.country);
    await this.fillPhoneNumber(personalData.phone);
    await this.fillEmail(personalData.email);
  }

  async completeWaitlistSubmission(formData, personalData) {
    await this.clickWaitlistTab();
    await this.fillWaitlistForm(formData);
    await this.fillPersonalInformation(personalData);
    await this.submitForm();
    await this.clickReturnHome();
  }
}

export default whitelabelwaitlist;