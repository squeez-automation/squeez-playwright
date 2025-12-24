const BasePage = require('./BasePage');

class WhiteLabelSqueez extends BasePage {
  constructor(page) {
    super(page);
    
    // Override locators for WhiteLabel
    this.fields = {
      ...this.fields,
      
      dateInput: () => this.page.getByPlaceholder('Select date').first(),
      priceInput: () => this.page.locator('input[placeholder="Price"]').first(),
      peopleInput: () => this.page.locator('input[placeholder="People"]').first(),
      descInput: () => this.page.locator('input[placeholder="Description"]').first(), // UNCOMMENT THIS
      submitButton: () => this.page.locator('button.squeez-btn').first(),
    };
  }
  
  async fillBookingForm(data) {
    await this.fillRandomDateInField();
    await this.clickAndFillTime(data.startTimeInput);
    await this.clickAndFillPriceField(data.priceInput);
    await this.clickAndFillPeopleField(data.peopleInput);
    await this.clickAndFillDesc(data.descInput);
    await this.clickSqueezWaitlistButton();
  }
}

module.exports = WhiteLabelSqueez;