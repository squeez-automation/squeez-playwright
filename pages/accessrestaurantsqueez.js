const BasePage = require('./BasePage');

class Restaurant extends BasePage {
  constructor(page, request) {
    super(page);
    this.request = request;
  }

  async handleRestaurantSelection(data) {
    console.log('🎯 Starting restaurant booking flow...');
    
    try {
      // Step 1: Select category
      await this.selectCategory(data, 'Squeez');
      
      // Step 2: Select business/restaurant
      await this.selectBusinessByName(data.businessName, 'Squeez');
      
      // Step 3: Fill booking form
      await this.fillBookingFormAndOpenPopup(data);
      
      console.log('✅ Restaurant selection completed');
      
    } catch (error) {
      console.error('❌ Error in handleRestaurantSelection:', error.message);
      throw error;
    }
  }

  async fillBookingFormAndOpenPopup(data) {
    console.log('📝 Filling booking form...');

    try {
      // Fill all required fields
      await this.fillRandomDateInField();
      await this.clickAndFillTime(data.startTimeInput);
      await this.clickAndFillPriceField(data.priceInput);
      await this.clickAndFillPeopleField(data.peopleInput);
      await this.clickAndFillDesc(data.descriptionInput);
      
      // Submit the form
      await this.clickSqueezWaitlistButton();
      console.log('✅ Booking form submitted');
      
      // Wait for popup/payment modal
      await this.page.waitForTimeout(2000);
      
    } catch (error) {
      console.error('❌ Error filling booking form:', error.message);
      throw error;
    }
  }
}

module.exports = Restaurant;