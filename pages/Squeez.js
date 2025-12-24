const BasePage = require('./BasePage');

class Squeez extends BasePage {
  constructor(page, excelData) {
    super(page);
    this.excelData = excelData;
  }

  async fillBookingFormAndOpenPopup(data) {
    console.log('📝 Filling booking form...');

    // Fill all required fields
    await this.fillRandomDateInField(this.fields.dateInput);
    await this.clickAndFillTime(data.startTimeInput);
    await this.clickAndFillPriceField(data.priceInput, 'Squeez');
    await this.clickAndFillPeopleField(data.peopleInput);
    await this.clickAndFillDesc(data.descriptionInput);
    await this.clickSqueezWaitlistButton();
    console.log('✅ Payment popup opened');
  }
}

module.exports = Squeez;
