const BasePage = require('./BasePage');
const CryptoJS = require('crypto-js');

class Restaurant extends BasePage {
  constructor(page, request) {
    super(page);
    this.request = request;
  }

  /**
   * Main restaurant flow:
   * - Ensure page ready
   * - Call BasePage.selectCategory()
   * - Wait for API → decrypt → detect payment provider
   */
async handleRestaurantSelection() {
  console.log('🍽️ Starting Restaurant flow...');

  // 🧩 Debug listeners — show network & API responses
  this.page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('category') || url.includes('api')) {
      console.log(`🔍 [API RESPONSE] ${resp.request().method()} ${url} → ${resp.status()}`);
      try {
        const body = await resp.text();
        console.log(`📦 [BODY SNIPPET]: ${body.slice(0, 150)}...`);
      } catch {
        console.log('⚠️ Could not read response body');
      }
    }
  });

  // Step 0️⃣ — Wait for site fully ready
  await this.page.waitForLoadState('networkidle');

  // Step 1️⃣ — Select category using BasePage logic
  console.log('🎯 Selecting Restaurant category via BasePage...');
  await this.selectCategory({ category: 'Restaurants' });

  // Step 2️⃣ — Wait for encrypted API response
  console.log('⏳ Waiting for restaurant API response...');
  let response;
  try {
    [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.url().includes('getItemsDataFromCategory') &&
          resp.status() === 200,
        { timeout: 20000 }
      ),
      this.page.waitForTimeout(1500),
    ]);
  } catch (err) {
    console.warn('⚠️ No /getItemsDataFromCategory API response within timeout.');
    return;
  }

  const url = response.url();
  console.log(`✅ [MATCHED RESPONSE] URL: ${url}`);

  const encryptedText = await response.text();
  console.log(`🔒 Encrypted API response received (length: ${encryptedText.length})`);

  // Step 3️⃣ — Decrypt encryptedData
  let decryptedData;
  try {
    const parsedBody = JSON.parse(encryptedText);
    const encryptedBase64 = parsedBody?.data?.encryptedData;

    if (!encryptedBase64) {
      throw new Error('No encryptedData found in API response.');
    }

    console.log(`🔐 Extracted encryptedData (${encryptedBase64.length} chars)`);

    // AES Base64 Decryption (must match backend encryption config)
    const secretKey = CryptoJS.enc.Base64.parse('1QlDn5TlQNQ9ArpEvsqMtOrC+OB1iYpYRQDkN0gBUWA=');
    const iv = CryptoJS.enc.Base64.parse('GxTyJmGUXK2JxDj3bKondg==');

    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, secretKey, { iv });
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) throw new Error('Decryption returned empty string — invalid key/IV.');

    decryptedData = JSON.parse(decryptedText);
    console.log('📜 API decrypted successfully.');
  } catch (err) {
    console.error('❌ Failed to decrypt API:', err.message);
    return;
  }

  // Step 4️⃣ — Validate restaurants array
  const restaurants = Array.isArray(decryptedData) ? decryptedData : [decryptedData];
  if (!restaurants.length) {
    console.error('❌ No restaurants found after decryption.');
    return;
  }

  // Step 5️⃣ — Filter out null/invalid entries safely
  const validRestaurants = restaurants.filter((r) => r && typeof r === 'object' && r.name);
  if (!validRestaurants.length) {
    console.error('❌ No valid restaurant records found in decrypted API response.');
    return;
  }

  console.log(`📦 Total valid restaurants found: ${validRestaurants.length}`);

  // Step 6️⃣ — Group by payment provider type
  const grouped = {
    stripe: validRestaurants.filter(
      (r) => r.paymentProviderType && r.paymentProviderType.toLowerCase() === 'stripe'
    ),
    fiserv: validRestaurants.filter(
      (r) => r.paymentProviderType && r.paymentProviderType.toLowerCase() === 'fiserv'
    ),
    freedompay: validRestaurants.filter(
      (r) => r.paymentProviderType && r.paymentProviderType.toLowerCase() === 'freedompay'
    ),
  };

  console.log(
    `📊 Distribution — Stripe: ${grouped.stripe.length}, Fiserv: ${grouped.fiserv.length}, FreedomPay: ${grouped.freedompay.length}`
  );

  // Debug print restaurant names
  console.log('📋 Stripe:', grouped.stripe.map((r) => r.name));
  console.log('📋 Fiserv:', grouped.fiserv.map((r) => r.name));
  console.log('📋 FreedomPay:', grouped.freedompay.map((r) => r.name));

  // Step 7️⃣ — Select restaurant based on priority (Stripe > Fiserv > FreedomPay)
  let selectedRestaurant;
  let selectedType;

  if (grouped.stripe.length > 0) {
    selectedRestaurant = grouped.stripe[0];
    console.log('Amit',selectedRestaurant);
    selectedType = 'stripe';
  } else if (grouped.fiserv.length > 0) {
    selectedRestaurant = grouped.fiserv[0];
    selectedType = 'fiserv';
  } else if (grouped.freedompay.length > 0) {
    selectedRestaurant = grouped.freedompay[0];
    selectedType = 'freedompay';
  }

  if (!selectedRestaurant) {
    console.warn('⚠️ No supported payment provider found in decrypted response.');
    return;
  }

  console.log(`✅ Selected Restaurant: ${selectedRestaurant.name} (${selectedType})`);

  // Step 8️⃣ — Select this restaurant in dropdown (using BasePage method)
  await this.selectBusinessByName(selectedRestaurant.name);

  
  // Step 9️⃣ — Run respective payment flow
  switch (selectedType) {
    case 'stripe':
      console.log('💳 Running Stripe flow...');
      await this.stripe(selectedRestaurant);
      break;

    case 'fiserv':
      console.log('🏦 Running Fiserv flow...');
      await this.fiserv(selectedRestaurant);
      break;

    case 'freedompay':
      console.log('💰 Running FreedomPay flow...');
      await this.freedomPay(selectedRestaurant);
      break;

    default:
      console.warn(`⚠️ Unsupported payment provider: ${selectedType}`);
  }

  console.log('✅ Restaurant booking completed successfully.');
}


}

module.exports = Restaurant;
