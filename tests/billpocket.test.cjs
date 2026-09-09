const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "../outputs/bill-calendar-pwa/app.js"), "utf8").replace(/\ninit\(\);\s*$/, "");
function app(now = "2026-09-08T12:00:00") {
  const elements = new Map();
  const storage = new Map();
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return new Date(now).getTime(); }
  }
  const context = vm.createContext({
    Date: Clock, Intl, structuredClone, console,
    localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    document: { getElementById: (id) => {
      if (!elements.has(id)) elements.set(id, { value: "", checked: false, reportValidity: () => true,
        classList: { add() {}, remove() {}, toggle() {} }, close() {}, showModal() {} });
      return elements.get(id);
    } },
    window: { setTimeout() {}, clearTimeout() {} }
  });
  vm.runInContext(source, context);
  const run = (code) => vm.runInContext(code, context);
  run('render = () => {}; state.bills = []; state.payments = []; state.activity = [];');
  return { run, elements, context, storage };
}

test("annual and quarterly bills recur from their actual due month", () => {
  const { run } = app();
  assert.equal(run(`getBillDueDateForMonth({ dueDay: 20, frequency: "annual", dueDate: "2026-09-20" }, new Date(2027, 0, 1))`), null);
  assert.equal(run(`toDateInputValue(getBillDueDateForMonth({ dueDay: 20, frequency: "annual", dueDate: "2026-09-20" }, new Date(2027, 8, 1)))`), "2027-09-20");
  assert.equal(run(`toDateInputValue(getBillDueDateForMonth({ dueDay: 31, frequency: "quarterly", dueDate: "2026-08-31" }, new Date(2026, 10, 1)))`), "2026-11-30");
  assert.equal(run(`getBillDueDateForMonth({ dueDay: 20, frequency: "monthly", dueDate: "2026-09-20" }, new Date(2026, 7, 1))`), null);
});

test("editing a one-time purchase preserves its original month and metadata", () => {
  const { run, elements } = app();
  run(`state.bills = [{ id: 'purchase-1', name: 'Amazon', amount: 12, category: 'purchase', frequency: 'one-time', dueDay: 10, oneTimeMonth: 5, oneTimeYear: 2026, importedFrom: 'receipt' }]; openBillModal('purchase-1');`);
  assert.equal(elements.get("billDueDateInput").value, "2026-06-10");
  elements.get("billAmountInput").value = "15";
  run("saveBillFromForm()");
  assert.equal(run("state.bills[0].oneTimeMonth"), 5);
  assert.equal(run("state.bills[0].importedFrom"), "receipt");
  assert.equal(run("toDateInputValue(getNextDueDate(state.bills[0]))"), "2026-06-10");
});

test("editing a month-end bill in February keeps its 31st recurrence", () => {
  const { run, elements } = app("2027-02-10T12:00:00");
  run(`state.bills = [{ id: 'bill-1', name: 'Rent', amount: 100, category: 'rent', frequency: 'monthly', dueDay: 31, dueDate: '2026-01-31' }]; openBillModal('bill-1');`);
  assert.equal(elements.get("billDueDateInput").value, "2027-02-28");
  run("saveBillFromForm()");
  assert.equal(run("state.bills[0].dueDay"), 31);
});

test("overdue bills remain actionable for the current period and paid marks are idempotent", () => {
  const { run } = app();
  run(`state.bills = [{ id: 'bill-1', name: 'Rent', amount: 100, category: 'rent', frequency: 'monthly', dueDay: 1 }];`);
  assert.equal(run("toDateInputValue(getNextDueDate(state.bills[0]))"), "2026-09-01");
  const afterBills = run("getMonthStatus().afterBills");
  run("markBillPaidForPeriod('bill-1'); markBillPaidForPeriod('bill-1');");
  assert.equal(run("state.payments.length"), 1);
  assert.equal(run("state.payments[0].periodKey"), "2026-09-01");
  assert.equal(run("getMonthStatus().afterBills"), afterBills);
  run("unmarkBillPaidForPeriod('bill-1', '2026-09-01')");
  assert.equal(run("getMonthStatus().openTotal"), 100);
});

test("overdue lookup spans the full requested range across month boundaries", () => {
  const { run } = app("2026-03-01T12:00:00");
  run(`state.bills = [{ id: 'bill-1', name: 'Rent', amount: 100, frequency: 'monthly', dueDay: 20 }];`);
  assert.equal(run("getUpcomingBills(0, { lateDays: 45 }).some(item => toDateInputValue(item.dueDate) === '2026-01-20')"), true);
});

test("explicit past email dates keep their year and invalid dates are rejected", () => {
  const { run } = app();
  for (const date of ["June 10, 2026", "06/10/2026", "06/10/26", "2026-06-10"]) {
    assert.equal(run(`toDateInputValue(parseDueDateText(${JSON.stringify(date)}))`), "2026-06-10");
  }
  for (const date of ["2026-02-30", "02/30/2026", "February 30, 2026", "13/10/2026"]) {
    assert.equal(run(`parseDueDateText(${JSON.stringify(date)})`), null);
  }
  assert.equal(run(`toDateInputValue(findDueDate("Minimum payment due $35.00. Payment due date: 2026-06-10"))`), "2026-06-10");
});

test("subscription receipts and store credit statements keep their bill type", () => {
  const { run } = app();
  assert.equal(run(`inferCategory("Amazon Prime membership renewal receipt")`), "subscription");
  assert.equal(run(`inferFrequency("Amazon Prime membership renewal receipt", "subscription")`), "monthly");
  assert.equal(run(`inferCategory("Amazon Visa statement balance $900 minimum payment $35")`), "credit");
});

test("sync cannot mutate bill amounts or claim a successful connection", () => {
  const { run } = app();
  const before = run("JSON.stringify(state)");
  run("syncService('brightgrid'); syncAllServices();");
  assert.equal(run("JSON.stringify(state)"), before);
});

test("backup validation rejects corrupt records but accepts old complete backups", () => {
  const { run } = app();
  assert.equal(run("getBackupState(buildDataBackup()) !== null"), true);
  assert.equal(run("getBackupState({ bills: [null], payments: [] })"), null);
  assert.equal(run("getBackupState({ settings: {} })"), null);
  assert.equal(run("getBackupState({ bills: [], payments: [{ id: 'pay-1', date: '2026-02-30', amount: 10 }] })"), null);
  assert.equal(run("getBackupState({ app: 'BillPocket', version: 99, state })"), null);
});

test("storage failures leave a visible warning and keep backup export available", () => {
  const { run, elements } = app();
  run("localStorage.setItem = () => { throw new Error('Quota exceeded'); }");
  assert.equal(run("saveState()"), false);
  assert.equal(elements.get("storageNotice").hidden, false);
  assert.equal(run("buildDataBackup().app"), "BillPocket");
});

test("capture keeps email headers with their own message", () => {
  const { run } = app();
  const text = 'From: BrightGrid Electric <billing@brightgrid.com>\nSent: September 1, 2026\nTo: Customer\nSubject: Your statement\nAmount due: $148.64\nDue date: September 14, 2026\n\nFrom: City Water <billing@citywater.com>\nSubject: Monthly bill\nAmount due: $72.20\nDue date: September 21, 2026';
  run(`globalThis.captured = parseBillingEmails(${JSON.stringify(text)})`);
  assert.equal(run('captured.length'), 2);
  assert.equal(run('captured[0].name'), 'Brightgrid Electric');
  assert.equal(run('captured[1].name'), 'City Water');
  assert.equal(run('captured[0].amount'), 148.64);
});

test("receipts in different months or with different order IDs are not discarded", () => {
  const { run } = app();
  const receipt = (date, order) => `From: Amazon <orders@amazon.com>\nSubject: Order confirmation\nOrder # ${order}\nOrder placed ${date}. Order total: $53.42.`;
  const a = receipt('June 10, 2026', '111-2222222-3333333');
  const b = receipt('July 10, 2026', '111-2222222-4444444');
  const c = receipt('July 10, 2026', '111-2222222-5555555');
  assert.equal(run(`parseBillingEmails(${JSON.stringify([a, b, c, a].join('\n\n'))}).length`), 3);
});

test("zero minimum beats a nonzero statement balance", () => {
  const { run } = app();
  for (const text of ['Statement balance: $923.44\nMinimum payment due: $0.00', 'Minimum payment due: 0.00\nStatement balance: $923.44']) {
    assert.equal(run(`findAmount(${JSON.stringify(text)}).value`), 0);
    assert.equal(run(`findAmount(${JSON.stringify(text)}).type`), 'minimum');
  }
});

test("dates and card account suffixes are not imported as amounts", () => {
  const { run } = app();
  assert.equal(run(`findAmount('Order confirmation. Charged to Visa ending 4821.').choices.length`), 0);
  assert.equal(run(`findAmount('Order # 12345. Charged to Visa ending 4821.').choices.length`), 0);
  assert.equal(run(`findAmount('Payment due date: 2026-09-14. Amount due: $72.20').value`), 72.2);
  assert.equal(run(`findAmount('Payment due date: 2026-09-14.').choices.length`), 0);
});

test("a purchase uses its order date before its delivery date", () => {
  const { run } = app();
  const text = 'From: Amazon\nSubject: Order confirmation\nArrives on September 20, 2026.\nOrder placed September 10, 2026. Order total $25.00';
  assert.equal(run(`toDateInputValue(extractBillCandidate(${JSON.stringify(text)}).dueDate)`), '2026-09-10');
});

test("order IDs control duplicate imports and amount changes update the same order", () => {
  const { run } = app();
  run(`state.bills = [{id:'order-1', name:'Amazon', category:'purchase', frequency:'one-time', amount:25, dueDay:10, dueDate:'2026-09-10', orderId:'111-2222222-3333333'}]`);
  const candidate = {name:'Amazon', frequency:'one-time', amount:30, dueDate:'2026-09-10', dateFound:true, orderId:'111-2222222-3333333'};
  run(`globalThis.candidate = ${JSON.stringify(candidate)}; candidate.dueDate = parseLocalDate(candidate.dueDate)`);
  assert.equal(run('findMatchingCapturedBill(candidate).id'), 'order-1');
  run("candidate.orderId = '111-2222222-4444444'");
  assert.equal(run('findMatchingCapturedBill(candidate)'), undefined);
  assert.equal(run('getCandidateMatch(candidate).status'), 'new-bill');
});

test("agenda separates unpaid upcoming, overdue, and paid periods without dropping items", () => {
  const { run } = app();
  run(`state.bills = Array.from({length:10}, (_,i) => ({id:'next-'+i, name:'Bill '+i, amount:10, frequency:'one-time', dueDay:15, dueDate:'2026-09-15'}));
    state.bills.push({id:'late', name:'Late bill', amount:15, frequency:'one-time', dueDay:1, dueDate:'2026-09-01'});
    state.payments = [{id:'paid-1', billId:'next-0', status:'Paid', periodKey:'2026-09-15'}];`);
  assert.equal(run('getAgendaGroups().upcoming.length'), 9);
  assert.equal(run('getAgendaGroups().overdue.length'), 1);
  assert.equal(run('getAgendaGroups().paid.length'), 1);
  assert.equal(run('getAgendaGroups().paid[0].bill.id'), 'next-0');
});

test("a missing amount remains missing while an explicit zero is reviewable", () => {
  const { run } = app();
  const missing = 'From: City Water\nDue date: September 21, 2026';
  const zero = 'From: City Water\nAmount due: $0.00';
  assert.equal(run(`extractBillCandidate(${JSON.stringify(missing)}).amountFound`), false);
  assert.equal(run(`extractBillCandidate(${JSON.stringify(zero)}).amountFound`), true);
});

test("bare email senders resolve to a name rather than an email address", () => {
  const { run } = app();
  const text = 'From: billing@brightgrid.com\nSubject: Your statement';
  assert.equal(run(`findBillerName(${JSON.stringify(text)})`), 'Brightgrid');
});
