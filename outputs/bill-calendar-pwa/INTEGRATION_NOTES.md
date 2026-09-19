# BillPocket Integration Notes

This prototype is a static PWA. Bill tracking, pasted-email capture, paid marks, forecasts, backup restore, exports, and offline access work locally. Bank linking and payment scheduling are explicitly labeled demos. No live bank, mailbox, or biller connection is configured, and no money is sent. Sync controls do not change amounts or claim to fetch live data.

Bills use a full `dueDate` as their recurrence anchor and retain `dueDay` for month-end clamping. Legacy monthly schedules and one-time month/year fields remain supported. Annual and quarterly bills recur from the chosen month. Editing an unchanged schedule preserves the original anchor and day.

Recurring schedule and amount changes retain earlier versions in `scheduleHistory`, with ordered `beforeMonth` boundaries. Changes apply from the selected due-date month; earlier months keep their saved dates and amounts. A paid period retains its recorded date and amount even when that month's schedule changes. The app supports one occurrence per bill per month; separate installments need separate bills. Historical versions are preserved from this update onward, not reconstructed from data already lost in older versions.

Email imports preserve a recurring month-end day when the statement matches the existing schedule (for example, a February 28 statement does not change a 31st-day schedule). A paid one-time bill's date and frequency stay locked until its manual paid mark is undone; imports cannot silently move that paid purchase into another month. The editor shows the latest schedule separately from historical paid dates.

Run the regression checks from the repository root with `node --test tests/billpocket.test.cjs tests/csv-import.test.cjs`.

## CSV Transactions

History includes a separate transaction log and Import CSV wizard. This checkout previously had text/email attachment capture, not a structured transaction importer. CSV import does not create bills, infer future due dates, or mark bills paid. CSV files chosen through email attachments also open this wizard; non-CSV email capture is unchanged.

The wizard auto-maps unambiguous common headers, supports manual mapping by column position, and previews the first five normalized transactions. Date and Description plus either Amount or both Debit and Credit are required; Category and Account are optional. Duplicate header names require an explicit selection. Numeric dates default to month/day/year with an explicit day/month/year option; ISO year-first dates and English month names are supported. Missing required cells, invalid dates, malformed quotes, inconsistent column counts, and invalid amounts block the entire import with physical source line numbers. Blank rows are ignored, including when quoted descriptions span several lines.

Amounts are stored as signed integer cents. In Amount mode, positive means money in unless the user selects money out. In Debit/Credit mode, the column determines direction: debits are negative, credits positive, and signed values are treated as magnitudes. Both nonzero sides or both blank sides require correction. Dollar signs, properly grouped commas, leading signs, and parenthesized negatives are accepted. No partial numeric parsing or silent date rollover is allowed. Limits: 5 MB, 10,000 data rows, 100 columns, and $1 billion per transaction.

Exact matching uses date, normalized description, signed cents, and account, preserving repeated identical rows within a file. Reimporting a file skips the number of matching saved occurrences; the user can turn that off for intentional duplicates. Category is not part of the identity. Matching is a local heuristic, not bank reconciliation. Failed or stale-tab saves preserve the preview and do not partially add transactions. Backups include the new optional `transactions` array and continue accepting older backups without it. Transaction exports use the auto-recognized Date/Description/Amount/Category/Account structure and the existing CSV formula-injection escaping.

CSV parsing uses the vendored MIT-licensed Papa Parse 5.7.0 package from the official npm registry. `vendor/LICENSE` contains its license. Files are parsed locally, never uploaded; the parser and import UI are included in the offline shell. There are no saved bank templates, format learning, multi-row headers, spreadsheet imports, formulas, or split transactions in this release.

Email capture now offers explicit update/create destinations. Ambiguous same-name bills cannot overwrite the first match; a blocked batch leaves all records unchanged. Date-sensitive views refresh on resume and at day boundaries without replacing bill forms, email drafts, or budget inputs. History displays the running app version and provides an update check without clearing device data.

Capture keeps sender and subject headers with their message, uses full dates and order IDs for receipt matching, and distinguishes a missing amount from an explicit zero. Review corrections remain in memory while navigating; raw pasted emails are cleared after import and are not stored in backups. Receipt matching without an order ID is limited to merchant, date, and amount. Recurring statements are imported in due-date order, and older statements cannot overwrite the latest captured amount.

The dashboard provides Upcoming, Overdue, and Paid filters with pagination. Upcoming bills cover the next 45 days; the Paid filter shows recent periods. Overdue bills remain visible from their stored tracking start until marked paid or removed. Legacy schedules without a full date start tracking from the previous 45-day lookback at migration, without inventing earlier unpaid history. Selecting a calendar date shows all bills for that day, including dates outside the queue range. Marking or undoing a payment targets that exact bill period.

Paid-period totals use the recorded payment amount even after the bill's current amount changes. Payment history supports search, recorded-month and status filters, and responsive phone rows with the bill's due date. CSV exports respect the active history filters and escape formula-like text. Backups still contain the complete local state regardless of those filters.

Before saving or restoring, the app compares the device's saved data with the copy loaded by this tab. A changed copy pauses writes and offers a backup download or an explicit reload, without replacing unfinished forms automatically. Storage events and returning to a tab also check for changes. Failed saves keep the in-memory records available for backup and offer Retry save; closing a tab with unsaved records triggers a browser warning. This is same-browser stale-tab protection, not cross-device sync or a transactional database.

Backup downloads do not modify the saved state. Restore validates record containers, numeric values, and the exact timestamp fields used by each view before replacing data. Unfinished forms and raw pasted emails are not included in backups. Removing a bill keeps its payment log and offers a temporary Undo action that restores the original bill and its paid-period links.

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
