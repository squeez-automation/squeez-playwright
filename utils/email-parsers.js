// utils/email-parsers.js

// Extract OTP code (default 6-digit)
export function parseOtpEmail(textBody, regex = /(?<!\d)(\d{6})(?!\d)/) {
  const match = textBody.match(regex);
  if (!match) throw new Error('No OTP code found in email');
  return match[1];
}

// Extract booking confirmation details (total + people)
export function parseBookingEmail(textBody) {
  // Many templates use "Total Amount" (or "Total:") and show dollars with cents
  const totalMatch = textBody.match(/Total Amount[^$]*\$\s*([\d.,]+)/i) || textBody.match(/\bTotal:\s*\$\s*([\d.,]+)/i);

  // Label varies between "People", "No. of People", "No. of People"
  const peopleMatch = textBody.match(/(?:No\.?\s*of\s*People|People)\D*(\d+)/i);

  return {
    totalPrice: totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : null,
    people: peopleMatch ? parseInt(peopleMatch[1], 10) : null,
  };
}
