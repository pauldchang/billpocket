# BillPocket Integration Notes

This prototype is a static PWA. The updated UI is a phone-first bill manager with bank linking, biller syncing, payment scheduling, exports, local storage, and installable mobile behavior.

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
