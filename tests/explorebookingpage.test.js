const { test, expect } = require('@playwright/test');
const { ExploreBookingPage } = require('../pages/ExploreBookingPage');

// Booking Provider Types (matching API enum)
const BookingType = {
  LIGHTSPEED: 2,
  SUPREMEGOLF: 4,
  CLUB_CADDIE: 5,
};

test.describe('Booking Provider Tests', () => {
  /** @type {ExploreBookingPage} */
  let bookingPage;

  test.beforeEach(async ({ page }) => {
    bookingPage = new ExploreBookingPage(page);
    await page.goto('https://explore.sqzvip.com/');
  });

  // Helper: Login
  async function login(page) {
    // Check if already logged in by looking for the user profile/logged-in state
    const getStartedVisible = await page.getByRole('button', { name: 'Get Started Squeez Logo' }).isVisible().catch(() => false);
    
    if (!getStartedVisible) {
      console.log('✅ Already logged in, skipping login flow');
      return;
    }
    
    console.log('🔐 Starting login flow...');
    await bookingPage.clickGetStarted();
    await bookingPage.clickCountryDropdown();
    await bookingPage.searchCountry('india');
    await bookingPage.selectIndia();
    await bookingPage.fillPhoneNumber('870-938-4560');
    await bookingPage.clickSendAccessCode();
    await bookingPage.fillOTP('515151');
    await bookingPage.clickContinue();
    console.log('✅ Login completed');
  }

  // Helper: Complete booking flow
  async function completeBooking(page) {
    console.log('📅 Starting booking process...');
    
    try {
      await bookingPage.clickAboutSection();
      await bookingPage.scrollDown(9);
      await bookingPage.clickReset();
      await bookingPage.clickPickAvailable();
      await bookingPage.scrollDown(2);
      await bookingPage.clickAboutSection();
      await bookingPage.clickDateDisplay();

      const dateSelected = await bookingPage.selectRandomDate();
      if (!dateSelected) {
        throw new Error('❌ Date selection failed');
      }

      console.log('💳 Processing payment...');
      await bookingPage.scrollUp(5);
      await bookingPage.clickBookNow();
      await bookingPage.clickReserve();

      await bookingPage.completePayment({
        cardNumber: '4242424242424242',
        expirationDate: '0229',
        securityCode: '544',
        postalCode: '54545'
      });

      await bookingPage.clickViewBooking();
      await expect(page).toHaveURL(/booking|confirmation/i);
      console.log('✅ Booking confirmed! 🎉');
      
      return true;
    } catch (error) {
      console.error('❌ Booking flow error:', error.message);
      throw error;
    }
  }

  // Main Test: Run all available booking providers dynamically
  test('Run all available booking providers', async ({ page }) => {
    // Increase test timeout to 5 minutes for multiple bookings
    test.setTimeout(300000);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏌️  GOLF BOOKING PROVIDER TESTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await login(page);

    // Navigate to Golf - this will set up response listener AND navigate
    console.log('🔍 Navigating to Golf and fetching providers...');
    await bookingPage.clickGolf();
    
    // Get providers - this should use the already-captured response
    const providers = await bookingPage.getVenuesByBookingProvider();

    // Define provider mapping
    const providerMap = [
      { 
        type: BookingType.LIGHTSPEED, 
        name: 'LIGHTSPEED',
        venues: providers.lightspeed 
      },
      { 
        type: BookingType.SUPREMEGOLF, 
        name: 'SUPREMEGOLF',
        venues: providers.supremegolf 
      },
      { 
        type: BookingType.CLUB_CADDIE, 
        name: 'CLUB_CADDIE',
        venues: providers.clubCaddie 
      },
    ];

    // Check if any providers are available
    const availableProviders = providerMap.filter(p => p.venues.length > 0);

    if (availableProviders.length === 0) {
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `debug-no-providers-${Date.now()}.png`, 
        fullPage: true 
      });
      
      throw new Error('❌ No booking providers available in API response');
    }

    console.log(`\n📊 AVAILABLE PROVIDERS (${availableProviders.length} found):`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    availableProviders.forEach(p => {
      console.log(`   ✓ ${p.name.padEnd(15)} (Type ${p.type}) - ${p.venues.length} venue(s)`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let completedCount = 0;
    let failedCount = 0;
    const results = [];

    // Test each available provider
    for (const provider of availableProviders) {
      console.log(`\n┌─────────────────────────────────────────┐`);
      console.log(`│  Testing: ${provider.name.padEnd(28)} │`);
      console.log(`└─────────────────────────────────────────┘\n`);

      const startTime = Date.now();

      try {
        // Get the first venue for this provider
        const venue = provider.venues[0];
        const venueName = venue.name || venue.venueName;
        
        console.log(`📍 Selected venue: ${venueName}`);
        console.log(`   Provider Type: ${venue.bookingProviderType}`);
        console.log(`   Category: ${provider.name}`);

        // Navigate back to golf page if not the first test
        if (completedCount > 0 || failedCount > 0) {
          console.log('\n🔄 Navigating back to Golf page...');
          await page.goto('https://explore.sqzvip.com/');
          await bookingPage.clickGolf();
          await page.waitForTimeout(2000); // Wait for venues to load
        }

        // Click the venue
        console.log(`\n🖱️  Clicking venue: ${venueName}...`);
        const venueButton = page.getByRole('button', { name: new RegExp(venueName, 'i') }).first();
        await venueButton.waitFor({ state: 'visible', timeout: 10000 });
        await venueButton.click();
        await page.waitForTimeout(1000);

        // Complete the booking
        await completeBooking(page);
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        // Take success screenshot
        await page.screenshot({ 
          path: `success-${provider.name.toLowerCase()}-${Date.now()}.png`, 
          fullPage: true 
        });

        completedCount++;
        results.push({
          provider: provider.name,
          status: '✅ PASSED',
          venue: venueName,
          duration: `${duration}s`
        });
        
        console.log(`\n✅ ${provider.name} completed successfully in ${duration}s!\n`);

      } catch (error) {
        failedCount++;
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        results.push({
          provider: provider.name,
          status: '❌ FAILED',
          venue: provider.venues[0]?.name || provider.venues[0]?.venueName || 'Unknown',
          duration: `${duration}s`,
          error: error.message
        });
        
        console.error(`\n❌ ${provider.name} failed after ${duration}s:`);
        console.error(`   Error: ${error.message}\n`);
        
        // Take error screenshot
        await page.screenshot({ 
          path: `error-${provider.name.toLowerCase()}-${Date.now()}.png`, 
          fullPage: true 
        });
      }
    }

    // Final summary
    console.log('\n\n╔═════════════════════════════════════════════════════╗');
    console.log('║                   TEST SUMMARY                      ║');
    console.log('╠═════════════════════════════════════════════════════╣');
    console.log(`║  Total Providers Tested: ${availableProviders.length.toString().padEnd(27)} ║`);
    console.log(`║  ✅ Passed: ${completedCount.toString().padEnd(38)} ║`);
    console.log(`║  ❌ Failed: ${failedCount.toString().padEnd(38)} ║`);
    console.log(`║  Success Rate: ${((completedCount / availableProviders.length) * 100).toFixed(1)}%${' '.repeat(34)} ║`);
    console.log('╠═════════════════════════════════════════════════════╣');
    console.log('║                 DETAILED RESULTS                    ║');
    console.log('╠═════════════════════════════════════════════════════╣');
    
    results.forEach((result, index) => {
      console.log(`║  ${(index + 1).toString().padStart(2)}. ${result.provider.padEnd(15)} ${result.status.padEnd(10)} ${result.duration.padStart(8)} ║`);
      if (result.error) {
        const errorPreview = result.error.length > 35 ? result.error.substring(0, 32) + '...' : result.error;
        console.log(`║      Error: ${errorPreview.padEnd(40)} ║`);
      }
    });
    
    console.log('╚═════════════════════════════════════════════════════╝\n');

    // Fail the test if no providers completed successfully
    if (completedCount === 0) {
      throw new Error('❌ All booking provider tests failed');
    }
  });

  // Individual Tests (Optional - will skip if provider not available)
  test('LIGHTSPEED Provider - Complete booking', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes
    console.log(`\n🏢 Testing LIGHTSPEED (Type ${BookingType.LIGHTSPEED})\n`);
    
    await login(page);
    await bookingPage.clickGolf();
    
    const providers = await bookingPage.getVenuesByBookingProvider();
    
    if (providers.lightspeed.length === 0) {
      console.log('⚠️ LIGHTSPEED provider not available in API, skipping test');
      test.skip();
      return;
    }

    const venue = providers.lightspeed[0];
    const venueName = venue.name || venue.venueName;
    console.log(`📍 Testing venue: ${venueName}`);

    const venueButton = page.getByRole('button', { name: new RegExp(venueName, 'i') }).first();
    await venueButton.waitFor({ state: 'visible', timeout: 10000 });
    await venueButton.click();

    await completeBooking(page);
    await page.screenshot({ path: `booking-lightspeed-${Date.now()}.png`, fullPage: true });
  });

  test('SUPREMEGOLF Provider - Complete booking', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes
    console.log(`\n🏢 Testing SUPREMEGOLF (Type ${BookingType.SUPREMEGOLF})\n`);
    
    await login(page);
    await bookingPage.clickGolf();
    
    const providers = await bookingPage.getVenuesByBookingProvider();
    
    if (providers.supremegolf.length === 0) {
      console.log('⚠️ SUPREMEGOLF provider not available in API, skipping test');
      test.skip();
      return;
    }

    const venue = providers.supremegolf[0];
    const venueName = venue.name || venue.venueName;
    console.log(`📍 Testing venue: ${venueName}`);

    const venueButton = page.getByRole('button', { name: new RegExp(venueName, 'i') }).first();
    await venueButton.waitFor({ state: 'visible', timeout: 10000 });
    await venueButton.click();

    await completeBooking(page);
    await page.screenshot({ path: `booking-supremegolf-${Date.now()}.png`, fullPage: true });
  });

  test('CLUB_CADDIE Provider - Complete booking', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes
    console.log(`\n🏢 Testing CLUB_CADDIE (Type ${BookingType.CLUB_CADDIE})\n`);
    
    await login(page);
    await bookingPage.clickGolf();
    
    const providers = await bookingPage.getVenuesByBookingProvider();
    
    if (providers.clubCaddie.length === 0) {
      console.log('⚠️ CLUB_CADDIE provider not available in API, skipping test');
      test.skip();
      return;
    }

    const venue = providers.clubCaddie[0];
    const venueName = venue.name || venue.venueName;
    console.log(`📍 Testing venue: ${venueName}`);

    const venueButton = page.getByRole('button', { name: new RegExp(venueName, 'i') }).first();
    await venueButton.waitFor({ state: 'visible', timeout: 10000 });
    await venueButton.click();

    await completeBooking(page);
    await page.screenshot({ path: `booking-club-caddie-${Date.now()}.png`, fullPage: true });
  });
});

test.describe.configure({ mode: 'serial' });

// ═══════════════════════════════════════════════════════════════════
// DIAGNOSTIC TEST (Separate describe block)
// ═══════════════════════════════════════════════════════════════════

test.describe('Diagnostic Tests', () => {
  test('Diagnostic: Capture ALL network requests', async ({ page }) => {
    const bookingPage = new ExploreBookingPage(page);
    
    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║          🔍 DIAGNOSTIC MODE ACTIVATED             ║');
    console.log('║      Capturing all network activity...            ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');
    
    const allRequests = [];
    const allResponses = [];
    const apiCalls = [];
    
    // Capture ALL requests
    page.on('request', request => {
      allRequests.push({
        method: request.method(),
        url: request.url(),
        resourceType: request.resourceType()
      });
    });
    
    // Capture ALL responses
    page.on('response', async response => {
      const url = response.url();
      const status = response.status();
      
      allResponses.push({
        url,
        status,
        contentType: response.headers()['content-type']
      });
      
      // Log API-like responses
      if (url.includes('/api/') || 
          url.includes('venue') || 
          url.includes('golf') ||
          url.includes('category') ||
          url.includes('ActiveBusinessItemsDetails')) {
        
        const apiCall = {
          url,
          status,
          contentType: response.headers()['content-type']
        };
        
        console.log(`\n🎯 POTENTIAL API CALL:`);
        console.log(`   URL: ${url}`);
        console.log(`   Status: ${status}`);
        console.log(`   Content-Type: ${response.headers()['content-type']}`);
        
        // Try to get response body
        try {
          const body = await response.text();
          apiCall.bodyLength = body.length;
          apiCall.bodyPreview = body.substring(0, 150);
          
          console.log(`   Body preview: ${body.substring(0, 150)}...`);
          console.log(`   Body length: ${body.length} characters`);
          
          // Check if it's encrypted data
          if (body.includes('encryptedData')) {
            console.log(`   🔐 Contains encrypted data`);
            apiCall.encrypted = true;
          }
        } catch (e) {
          console.log(`   ⚠️ Could not read body`);
          apiCall.error = e.message;
        }
        
        apiCalls.push(apiCall);
      }
    });
    
    // Navigate and perform actions
    await page.goto('https://explore.sqzvip.com/');
    
    console.log('\n🔐 Logging in...');
    await bookingPage.clickGetStarted();
    await bookingPage.clickCountryDropdown();
    await bookingPage.searchCountry('india');
    await bookingPage.selectIndia();
    await bookingPage.fillPhoneNumber('870-938-4560');
    await bookingPage.clickSendAccessCode();
    await bookingPage.fillOTP('515151');
    await bookingPage.clickContinue();
    
    console.log('\n🏌️ Navigating to Golf...');
    await bookingPage.clickGolf();
    
    // Wait longer to capture all requests
    console.log('\n⏳ Waiting 10 seconds to capture all network activity...');
    await page.waitForTimeout(10000);
    
    // Summary
    console.log('\n\n╔═══════════════════════════════════════════════════╗');
    console.log('║              DIAGNOSTIC SUMMARY                   ║');
    console.log('╠═══════════════════════════════════════════════════╣');
    console.log(`║  Total Requests:  ${allRequests.length.toString().padStart(4)}                           ║`);
    console.log(`║  Total Responses: ${allResponses.length.toString().padStart(4)}                           ║`);
    console.log(`║  API Calls Found: ${apiCalls.length.toString().padStart(4)}                           ║`);
    console.log('╠═══════════════════════════════════════════════════╣');
    console.log('║           API-LIKE REQUESTS SUMMARY               ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');
    
    const apiRequests = allRequests.filter(r => 
      r.url.includes('/api/') || 
      r.url.includes('venue') || 
      r.url.includes('golf') ||
      r.url.includes('category') ||
      r.url.includes('ActiveBusinessItemsDetails')
    );
    
    apiRequests.forEach((req, i) => {
      console.log(`${(i + 1).toString().padStart(2)}. ${req.method.padEnd(6)} ${req.url}`);
    });
    
    // Golf-specific API calls
    console.log('\n📊 Golf-specific API calls:');
    const golfCalls = apiCalls.filter(call => 
      call.url.includes('65c61866ea562b9cfd579468') || 
      call.url.includes('golf')
    );
    
    if (golfCalls.length > 0) {
      golfCalls.forEach((call, i) => {
        console.log(`\n${i + 1}. ${call.url}`);
        console.log(`   Status: ${call.status}`);
        console.log(`   Body Length: ${call.bodyLength || 'N/A'}`);
        console.log(`   Encrypted: ${call.encrypted ? 'Yes' : 'No'}`);
      });
    } else {
      console.log('   ⚠️ No Golf-specific API calls found!');
    }
    
    console.log('\n✅ Diagnostic complete. Check the logs above for API endpoints.');
    console.log('═══════════════════════════════════════════════════\n');
  });
});