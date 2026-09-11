# BillPocket Integration Notes

This prototype is a static PWA. Bill tracking, pasted-email capture, paid marks, forecasts, backup restore, exports, and offline access work locally. Bank linking and payment scheduling are explicitly labeled demos. No live bank, mailbox, or biller connection is configured, and no money is sent. Sync controls do not change amounts or claim to fetch live data.

Bills use a full `dueDate` as their recurrence anchor and retain `dueDay` for month-end clamping. Legacy monthly schedules and one-time month/year fields remain supported. Annual and quarterly bills recur from the chosen month. Editing an unchanged schedule preserves the original anchor and day.

Run the dependency-free regression checks from the repository root with `node --test tests/billpocket.test.cjs`.

Capture keeps sender and subject headers with their message, uses full dates and order IDs for receipt matching, and distinguishes a missing amount from an explicit zero. Review corrections remain in memory while navigating; raw pasted emails are cleared after import and are not stored in backups. Receipt matching without an order ID is limited to merchant, date, and amount. Recurring statements are imported in due-date order, and older statements cannot overwrite the latest captured amount.

The dashboard provides Upcoming, Overdue, and Paid filters with pagination. Upcoming bills cover the next 45 days; the Paid filter shows recent periods. Overdue bills remain visible from their stored tracking start until marked paid or removed. Legacy schedules without a full date start tracking from the previous 45-day lookback at migration, without inventing earlier unpaid history. Selecting a calendar date shows all bills for that day, including dates outside the queue range. Marking or undoing a payment targets that exact bill period.

Paid-period totals use the recorded payment amount even after the bill's current amount changes. Payment history supports search, recorded-month and status filters, and responsive phone rows with the bill's due date. CSV exports respect the active history filters and escape formula-like text. Backups still contain the complete local state regardless of those filters.

Real money movement needs a backend and regulated providers. A production build should use tokenized bank access, never store raw credentials, and route payments through approved rails.

## Suggested Production Services

- Bank linking: Plaid Link, Stripe Financial Connections, MX, Finicity, or a direct open-banking provider.
- Payments: Stripe ACH, Dwolla, bank partner APIs, biller direct-pay APIs, or card network push payments.
- Biller discovery: Plaid Liabilities, provider OAuth portals, email receipt parsing with user consent, or direct biller APIs.
- Email bill scanning: start with forwarded emails or pasted email text. For direct mailbox scanning, use Gmail API or Microsoft Graph OAuth with the narrowest practical read scope, store extracted bill fields only, and let users disconnect/delete scan data.
- Bill capture learning: store per-biller correction rules such as preferred amount type, category, frequency, and due-day behavior. Do not store full email bodies after extraction unless the user explicitly opts in.
- Attachments and screenshots: parse `.eml` and text exports directly. PDFs and images need an OCR/text-extraction worker such as Google Document AI, Azure AI Document Intelligence, Textract, or an on-device OCR library.
- SMS capture: use user-forwarded messages, carrier-compliant messaging providers, or mobile OS share extensions. Do not scrape phone messages without explicit platform permission.
- Online purchases: start with pasted or forwarded receipts from Amazon, Walmart, Target, Etsy, PayPal, and Shopify stores. Treat them as one-time items unless the user marks the merchant as recurring.
- Notifications: APNs, FCM, email, and SMS for due-date reminders and failed payments.
- Data storage: encrypted relational database with audit trails, webhook event tables, and immutable payment logs.

## Backend Shape

```text
POST /api/link-token
POST /api/bank/exchange-public-token
GET  /api/accounts
GET  /api/bills
POST /api/bills
POST /api/billers/:id/sync
POST /api/payments
GET  /api/payments
GET  /api/forecast
POST /api/forecast/snapshots
```

## Payment Safety

- Require MFA or step-up verification for new payees and large payments.
- Confirm amount, date, payment rail, and destination before scheduling.
- Use idempotency keys for payment creation.
- Store provider tokens encrypted and scoped by user.
- Reconcile every provider webhook against the local payment log.
- Keep audit records for bill edits, service syncs, payment creation, cancellation, and failures.
