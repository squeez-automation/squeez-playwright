// Whitelabelbookingpage.test.js
const { test, expect } = require('@playwright/test');
const WhiteLabelBookingPage = require('../pages/WhiteLabelBookingPage');

test('complete booking with payment', async ({ page }) => {
  const bookingPage = new WhiteLabelBookingPage(page);
  
  await bookingPage.navigate('https://commongolf.sqzvip.com');
  
  await bookingPage.selectFirstTimeSlot();
  await bookingPage.selectNumberOfGuests('2');
  await bookingPage.selectFirstAvailableDate(); // Selects 3 days from now
  await bookingPage.selectFirstTimeSlotWithPrice();
  
  await bookingPage.scrollDown(10);
  await bookingPage.proceedToBooking();
  
  await bookingPage.fillPersonalInformation('Amit', 'Kumar', 'amittestingone@gmail.com');
  await bookingPage.selectCountryCode('ind', 'IN India +91');
  await bookingPage.fillPhoneNumber('829-445-2109');
  await bookingPage.submitReservation();
  
  await bookingPage.fillPaymentDetails('4242 4242 4242 4242', '02 / 28', '3256', '65654');
  await bookingPage.scrollInPaymentFrame(3);
  await bookingPage.completePayment();
  await bookingPage.closeConfirmation();
});