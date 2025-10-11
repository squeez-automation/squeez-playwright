const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

class ImapEmailClient {
  constructor(host, port, secure, user, pass) {
    this.host = host;
    this.port = port;
    this.secure = secure;
    this.user = user;
    this.pass = pass;
    this.client = new ImapFlow({
      host: this.host,
      port: this.port,
      secure: this.secure,
      auth: { user: this.user, pass: this.pass },
    });
    this.connected = false;
    this.currentMailbox = 'INBOX';
  }

  async connect() {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
      console.log(`[IMAP] Connected to ${this.host}`);
    }
  }

  async close() {
    if (this.connected) {
      await this.client.logout();
      this.connected = false;
      console.log(`[IMAP] Disconnected`);
    }
  }

  async openMailbox(folder = 'INBOX') {
    await this.connect();
    await this.client.mailboxOpen(folder);
    this.currentMailbox = folder;
  }

  async getUidNext(folder = this.currentMailbox) {
    const status = await this.client.status(folder, { uidNext: true });
    return status.uidNext;
  }

  /**
   * Fetch the latest confirmation email after a booking.
   */
  async fetchLatestEmail({
    startUid,
    fromContains,
    toContains,
    subjectContains,
    bookingDate, // e.g. "Sat, 4 October 2025"
    totalAmount, // e.g. "$95.43"
    folder = 'INBOX',
    waitTimeoutMs = 60000,
    pollIntervalMs = 3000,
    newerThanMinutes = 90,
  }) {
    await this.openMailbox(folder);
    const deadline = Date.now() + waitTimeoutMs;

    // Build Gmail search query
    let raw = '';
    if (subjectContains) raw += ` subject:"${subjectContains}"`;
    if (fromContains) raw += ` from:${fromContains}`;
    if (toContains) raw += ` to:${toContains}`;
    raw += ` newer_than:${Math.max(1, Math.floor(newerThanMinutes))}m`;

    console.log(`[IMAP] Searching for emails with query: ${raw}`);

    while (Date.now() < deadline) {
      const searchCriteria = { gmailRaw: raw };
      if (startUid) searchCriteria.uid = `${startUid}:*`;

      const uids = await this.client.search(searchCriteria);
      if (uids.length) {
        for (let uid of uids.reverse()) {
          const dl = await this.client.download(uid);
          const parsed = await simpleParser(dl.content);

          const body = String(parsed.text || parsed.html || '');
          const subject = parsed.subject || '';

          const bodyMatchesDate = bookingDate
            ? body.includes(bookingDate) || subject.includes(bookingDate) || new RegExp(bookingDate.replace(/[\.,]/g, ''), 'i').test(body)
            : false;

          const bodyMatchesAmount = totalAmount ? body.includes(totalAmount) : false;

          if (bodyMatchesDate || bodyMatchesAmount) {
            console.log(`[IMAP] ✅ Match found for ${bookingDate || totalAmount}`);
            return {
              uid,
              subject,
              from: parsed.from?.value?.[0]?.address || '',
              to: parsed.to?.value?.[0]?.address || parsed.headers.get('to') || '',
              date: parsed.date || new Date(),
              textBody: body,
            };
          }
        }
      }

      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }

    throw new Error('No matching email found within timeout');
  }
}
module.exports = { ImapEmailClient };
