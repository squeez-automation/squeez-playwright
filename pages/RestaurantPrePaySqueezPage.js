// const { BasePage } = require("./BasePage");
// const { ImapEmailClient } = require("../utils/imap-email-client");
// const { parseBookingEmail } = require("../utils/email-parsers");

// class RestaurantPrePaySqueezPage extends BasePage {
//  constructor(page, timeout = 8000) {
//   super(page, timeout);
//   this.page = page;

//   this.fields = {
//    // Date & Time
//    dateInput: this.page.locator('input[placeholder="Select date"]').first(),
//    startTimeInput: this.page.locator("#timePicker1").first(),

//    // Form fields
//    priceInput: this.page.locator('input[placeholder="Price"]').first(),
//    peopleInput: this.page.locator('input[placeholder="People"]').first(),
//    occasionInput: this.page.locator("#react-select-2-input"),
//    descriptionInput: this.page.locator('input.form-control[placeholder="Description"]').first(),

//    // Checkbox + Submit
//    policyCheckbox: this.page.getByRole("checkbox", { name: /By clicking you agree/i }),
//    squeezButton: this.page.locator("button.squeez-btn[title='squeez-request']").first(),

//    popupModal: this.page.locator(".modal-content").filter({ hasText: "Best Way to Connect with You" }).last(),
//    firstNameInput: this.page.locator("input#firstName").last(),
//    lastNameInput: this.page.locator("input#lastName").last(),

//    countryDropdown: this.page.locator(".modal-content:visible .iti__selected-flag"),
//    countrySearchBox: this.page.locator('.iti__country-list input[type="text"]'),
//    countryOption: (country) => this.page.locator(`.iti__country-list li:has-text("${country}")`),

//    phoneInput: this.page.locator('.modal-content:visible input[placeholder="Phone number"]').last(),
//    emailInput: this.page.locator('.modal-content:visible input[placeholder="Email"]').first(),
//    popupSubmit: this.page.locator('.modal-content:visible button.squeez-form[type="submit"]').first(),

//    // Payment
//    tipDropdown: this.page.locator(".modal-content select.form-select.mb-2.mt-2").first(),
//    cardNumber: this.page.frameLocator('iframe[name^="__privateStripeFrame"]').nth(0).getByPlaceholder("Card number"),
//    cardExpiry: this.page.frameLocator('iframe[name^="__privateStripeFrame"]').nth(1).locator('input[placeholder="MM / YY"]'),
//    cardCVC: this.page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[placeholder="CVC"]'),
//    cardZip: this.page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[placeholder="ZIP"]'),

//    confirmButton: this.page
//     .getByRole("tabpanel", { name: /Squeez/ })
//     .locator("form")
//     .getByRole("button"),
//   };
//  }

//  formatExcelDate(dateValue) {
//   // Handle Excel-style date (e.g., numeric serial) or string (e.g., "Sun, 05 Oct 2026")
//   if (!dateValue) return "";

//   // If it's already a string like "Sun, 05 Oct 2026"
//   if (typeof dateValue === "string") {
//    const parsed = new Date(dateValue.replace(/,/g, "")); // clean commas
//    if (!isNaN(parsed)) {
//     // Format to "Sat, 04 Oct 2026" style for UI compatibility
//     const options = { weekday: "short", day: "2-digit", month: "short", year: "numeric" };
//     return parsed.toLocaleDateString("en-GB", options).replace(/ /g, " ");
//    }
//   }

//   // If Excel serial (e.g., 45256)
//   if (typeof dateValue === "number") {
//    const excelEpoch = new Date(1899, 11, 30);
//    const parsed = new Date(excelEpoch.getTime() + dateValue * 86400000);
//    const options = { weekday: "short", day: "2-digit", month: "short", year: "numeric" };
//    return parsed.toLocaleDateString("en-GB", options).replace(/ /g, " ");
//   }

//   return "";
//  }

//  // Excel Time → hh:mm AM/PM
//  formatExcelTime(excelValue) {
//   if (!excelValue) return "";

//   if (typeof excelValue === "string") {
//    const cleaned = excelValue.trim().toUpperCase();
//    if (/^\d{1,2}:\d{2} (AM|PM)$/.test(cleaned)) return cleaned;
//    console.warn("⚠️ Invalid string time format:", cleaned);
//    return "";
//   }

//   if (!isNaN(excelValue)) {
//    const totalMinutes = Math.round(excelValue * 24 * 60);
//    let roundedMinutes = Math.round(totalMinutes / 10) * 10;
//    if (roundedMinutes >= 24 * 60) roundedMinutes = 0;
//    const hours = Math.floor(roundedMinutes / 60) % 24;
//    const minutes = roundedMinutes % 60;
//    const period = hours >= 12 ? "PM" : "AM";
//    const hr12 = hours % 12 === 0 ? 12 : hours % 12;
//    const mm = minutes.toString().padStart(2, "0");
//    return `${hr12}:${mm} ${period}`;
//   }

//   return "";
//  }

//  // Convert Excel serial date (like 45962) → "MM / YY"
//  formatExcelExpiry(excelValue) {
//   if (!excelValue || isNaN(excelValue)) return String(excelValue);

//   const jsDate = new Date((excelValue - 25569) * 86400 * 1000);
//   const month = String(jsDate.getMonth() + 1).padStart(2, "0");
//   const year = jsDate.getFullYear().toString().slice(-2);
//   return `${month} / ${year}`;
//  }

//  // Fill Start Time Only
//  async fillStartTime(rawValue) {
//   const formattedTime = this.formatExcelTime(rawValue);
//   if (!formattedTime) return;

//   const [time, period] = formattedTime.split(" ");
//   let [hour, minute] = time.split(":");
//   hour = hour.padStart(2, "0");
//   minute = minute.padStart(2, "0");

//   await this.page.evaluate(() => {
//    const el = document.querySelector("#timePicker1");
//    if (el) el.removeAttribute("readonly");
//   });

//   await this.fields.startTimeInput.scrollIntoViewIfNeeded();
//   await this.fields.startTimeInput.waitFor({ state: "visible" });
//   await this.fields.startTimeInput.click();

//   await this.page.waitForSelector(".ant-picker-time-panel", { state: "visible", timeout: 5000 });

//   await this.page.locator(`.ant-picker-time-panel-column:nth-child(1) .ant-picker-time-panel-cell-inner`).filter({ hasText: hour }).first().click();
//   await this.page.locator(`.ant-picker-time-panel-column:nth-child(2) .ant-picker-time-panel-cell-inner`).filter({ hasText: minute }).first().click();

//   const ampmCol = this.page.locator(".ant-picker-time-panel-column").nth(2);
//   const currentAMPM = await ampmCol.locator(".ant-picker-time-panel-cell-selected").innerText();
//   if (currentAMPM.trim() !== period) {
//    await ampmCol.locator(`.ant-picker-time-panel-cell-inner:text-is("${period}")`).click();
//   }

//   await this.page.getByRole("button", { name: "OK" }).click();
//   console.log(`✅ Start time set: ${formattedTime}`);
//  }

//  async fillPopupForm(row) {
//   // Wait until modal is visible
//   await this.fields.popupModal.waitFor({ state: "visible", timeout: 8000 });

//   // First Name
//   if (row.firstNameInput) {
//    await this.fields.firstNameInput.click({ force: true });
//    await this.fields.firstNameInput.fill("");
//    await this.fields.firstNameInput.type(row.firstNameInput.toString().trim(), { delay: 100 });
//   }

//   // Last Name
//   if (row.lastNameInput) {
//    await this.fields.lastNameInput.click({ force: true });
//    await this.fields.lastNameInput.fill("");
//    await this.fields.lastNameInput.type(row.lastNameInput.toString().trim(), { delay: 100 });
//   }

//   // Country selection
//   if (row.countryInput) {
//    const countryButton = this.page.locator(".modal-content:visible button.country-button").first();
//    await countryButton.waitFor({ state: "visible", timeout: 5000 });
//    await countryButton.click({ force: true });

//    const countrySearch = this.page.locator("input.searchCountry");
//    await countrySearch.waitFor({ state: "visible", timeout: 5000 });

//    await countrySearch.click({ force: true });
//    await countrySearch.fill("");
//    await countrySearch.type(row.countryInput.toString().trim(), { delay: 80 });
//    await this.page.waitForTimeout(700);

//    const countryOption = this.page.locator(`.dropdown-menu.show li:has-text("${row.countryInput}")`).first();
//    if (await countryOption.count()) {
//     await countryOption.click({ force: true });
//    } else {
//     await this.page.keyboard.press("Enter");
//    }

//    console.log(`✅ Country selected: ${row.countryInput}`);
//   }

//   // Phone
//   if (row.phoneInput) {
//    await this.fields.phoneInput.click({ force: true });
//    await this.fields.phoneInput.fill("");
//    await this.fields.phoneInput.type(String(row.phoneInput), { delay: 80 });
//   }

//   // EMAIL INPUT
//   if (row.emailInput) {
//    const emailField = this.page.locator('input#email[placeholder="Email"]').last();
//    await emailField.waitFor({ state: "visible", timeout: 8000 });
//    await emailField.scrollIntoViewIfNeeded();
//    await this.page.waitForTimeout(300);

//    await emailField.click({ force: true });
//    await emailField.fill("");
//    await emailField.type(row.emailInput.toString().trim(), { delay: 120 });

//    await this.page.waitForTimeout(500);
//    await emailField.press("Tab");

//    const finalVal = await emailField.inputValue();
//    if (!finalVal || finalVal.trim() === "") {
//     console.warn("⚠️ Email cleared by UI — retrying once...");
//     await emailField.click({ force: true });
//     await emailField.type(row.emailInput.toString().trim(), { delay: 100 });
//     await this.page.waitForTimeout(400);
//     await emailField.press("Tab");
//    }

//    console.log(`✅ Email confirmed and React state synced: ${row.emailInput}`);
//   }

//   // SUBMIT POPUP
//   const popupSubmitBtn = this.page.locator('.modal-content:visible button.squeez-form[type="submit"]').last();
//   await popupSubmitBtn.waitFor({ state: "visible", timeout: 8000 });
//   await popupSubmitBtn.scrollIntoViewIfNeeded();
//   await popupSubmitBtn.click({ force: true });
//   await this.page.waitForTimeout(2000);
//   console.log(`✅ Popup form submitted for ${row.firstNameInput} ${row.lastNameInput}`);
//  }

//  // Main Flow
//  async runRestaurantPrePayFlow(row) {
//   await this.page.goto("https://figo.sqzvip.com/squeez", { waitUntil: "domcontentloaded" });

//   await this.page.waitForSelector('input[placeholder="Select date"]', { state: "visible" });
//   await this.page.$eval('input[placeholder="Select date"]', (el) => el.removeAttribute("readonly"));

//   const formattedDate = this.formatExcelDate(row.dateInput);

//   await this.fields.dateInput.click({ force: true });
//   await this.fields.dateInput.fill(""); // clear any existing date
//   await this.fields.dateInput.type(formattedDate, { delay: 50 });

//   // Force Flatpickr to accept the typed value even if the year isn't visible
//   await this.page.evaluate(() => {
//    const el = document.querySelector('input[placeholder="Select date"]');
//    if (el && el._flatpickr) el._flatpickr.setDate(el.value, true);
//   });

//   await this.page.keyboard.press("Enter");
//   console.log(`✅ Filled input with: ${formattedDate}`);

//   await this.fillStartTime(row.startTimeInput);
//   await this.fill(this.fields.priceInput, String(row.priceInput));
//   await this.fill(this.fields.peopleInput, String(row.peopleInput));

//   if (row.occasionInput) {
//    await this.fields.occasionInput.fill("");
//    await this.fields.occasionInput.type(String(row.occasionInput), { delay: 80 });
//    await this.page.getByRole("option", { name: new RegExp(row.occasionInput, "i") }).click();
//   }

//   await this.fill(this.fields.descriptionInput, String(row.descriptionInput));
//   await this.click(this.fields.policyCheckbox);
//   await this.click(this.fields.squeezButton);
//   await this.fillPopupForm(row);

//   // Payment
//   await this.page.waitForSelector(".modal-content:visible", { timeout: 15000 });

//   if (row.tipDropdown) {
//    const formattedTip = typeof row.tipDropdown === "number" ? `${Math.round(row.tipDropdown * 100)}%` : String(row.tipDropdown).replace("%", "").trim() + "%";
//    const visibleModal = this.page.locator(".modal-content:visible").filter({ hasText: "Please Enter Payment Details" });
//    const tipDropdown = visibleModal.locator("select.form-select.mb-2.mt-2").first();

//    await tipDropdown.waitFor({ state: "visible", timeout: 10000 });
//    await tipDropdown.scrollIntoViewIfNeeded();
//    await tipDropdown.focus();
//    await tipDropdown.click({ force: true });
//    await this.page.waitForTimeout(500);

//    try {
//     await tipDropdown.selectOption({ label: formattedTip });
//     console.log(`✅ Tip selected via label: ${formattedTip}`);
//    } catch {
//     const valueText = formattedTip.replace("%", "").trim() + "%";
//     const allOptions = await tipDropdown.locator("option").allInnerTexts();
//     const matched = allOptions.find((opt) => opt.toLowerCase().includes(valueText.toLowerCase()));
//     if (matched) {
//      await tipDropdown.selectOption({ label: matched });
//      console.log(`✅ Tip selected via fallback match: ${matched}`);
//     } else {
//      await tipDropdown.selectOption({ index: 1 });
//      console.warn(`⚠️ No matching tip found; fallback to default option`);
//     }
//    }
//    await this.page.waitForTimeout(500);
//   }

//   const visibleModal = this.page.locator(".modal-content:visible").filter({ hasText: "Please Enter Payment Details" });
//   const totalElement = visibleModal.locator('div:has-text("Total:") span').last();
//   await totalElement.waitFor({ state: "visible", timeout: 5000 });

//   const totalText = await totalElement.innerText();
//   const totalAmount = totalText.replace("$", "").trim();
//   console.log(`💰 Total amount before payment: $${totalAmount}`);

//   await this.page.waitForSelector('iframe[name^="__privateStripeFrame"]', { timeout: 20000 });

//   await this.fillStripeInput("Card number", row.cardNumber);
//   await this.fillStripeInput("MM / YY", this.formatExcelExpiry(row.cardExpiry));
//   await this.fillStripeInput("CVC", row.cardCVC);
//   await this.fillStripeInput("ZIP", row.cardZip);

//   await this.click(this.fields.confirmButton);
//   console.log(`✅ Payment form submitted`);

//   await this.page.waitForSelector("body", { timeout: 15000 });
//   const bodyText = await this.page.textContent("body");

//   if (bodyText.includes(totalAmount)) {
//    console.log(`✅ Total verified after payment: $${totalAmount}`);
//   } else {
//    console.warn(`⚠️ Total mismatch — Expected $${totalAmount}, but could not confirm after payment`);
//   }

//   // --- Return total for test verification ---
//   return parseFloat(totalAmount);
//  }

//  async fillStripeInput(placeholder, value) {
//   for (const frame of this.page.frames()) {
//    const input = frame.locator(`input[placeholder="${placeholder}"]`);
//    if ((await input.count()) > 0) {
//     await input.fill("");
//     await input.type(String(value), { delay: 80 });
//     console.log(`✅ Filled ${placeholder} with ${value}`);
//     return;
//    }
//   }
//   throw new Error(`❌ Stripe input not found: ${placeholder}`);
//  }
// }

// module.exports = RestaurantPrePaySqueezPage;
