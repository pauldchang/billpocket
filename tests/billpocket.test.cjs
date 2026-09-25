const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const CsvImport = require("../outputs/bill-calendar-pwa/csv-import.js");
const TransactionSplits = require("../outputs/bill-calendar-pwa/transaction-splits.js");

const source = fs.readFileSync(path.join(__dirname, "../outputs/bill-calendar-pwa/app.js"), "utf8").replace(/\ninit\(\);\s*$/, "");
function app(now = "2026-09-08T12:00:00", storage = new Map()) {
  const elements = new Map();
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return new Date(now).getTime(); }
  }
  const context = vm.createContext({
    Date: Clock, Intl, structuredClone, console, CsvImport, TransactionSplits,
    localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    document: { getElementById: (id) => {
      if (!elements.has(id)) elements.set(id, { value: "", checked: false, reportValidity: () => true,
        classList: { add() {}, remove() {}, toggle() {} }, close() {}, showModal() {} });
      return elements.get(id);
    } },
    window: { setTimeout() {}, clearTimeout() {}, confirm: () => true }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../outputs/bill-calendar-pwa/transaction-ui.js'), 'utf8'), context);
  vm.runInContext(source, context);
  const run = (code) => vm.runInContext(code, context);
  run('render = () => {}; state.bills = []; state.payments = []; state.activity = [];');
  return { run, elements, context, storage, setNow: (value) => { now = value; } };
}

test('transaction import commits atomically and does not change bills or payments', () => {
  const {run} = app();
  run(`globalThis.parsedCsv = CsvImport.read('Date,Description,Amount\\n2026-09-17,Shop,-25');
    csvDraft = {parsed:parsedCsv,mapping:parsedCsv.mapping,skipDuplicates:true}; saveState();`);
  const bills = run('JSON.stringify(state.bills)');
  const payments = run('JSON.stringify(state.payments)');
  assert.equal(run('commitCsvImport()'), true);
  assert.equal(run('state.transactions.length'),1);
  assert.equal(run('state.transactions[0].amountCents'),-2500);
  assert.equal(run('JSON.stringify(state.bills)'),bills);
  assert.equal(run('JSON.stringify(state.payments)'),payments);
  assert.equal(run('getBackupState(buildDataBackup()) !== null'),true);
  run('state = loadState()');
  assert.equal(run('state.transactions.length'),1);
});

test('transaction preview rejects invalid rows without partially importing good rows', () => {
  const {run} = app();
  run(`globalThis.parsedCsv = CsvImport.read('Date,Description,Amount\\n2026-09-17,Shop,-25\\n2026-02-30,Bad,nope');
    csvDraft = {parsed:parsedCsv,mapping:parsedCsv.mapping,skipDuplicates:true}; saveState();`);
  const before = run('JSON.stringify(state)');
  assert.equal(run('commitCsvImport()'),false);
  assert.equal(run('JSON.stringify(state)'),before);
  assert.equal(run('csvDraft !== null'),true);
});

test('transaction imports retain preview and existing records on storage failure or stale tabs', () => {
  for (const fail of ["localStorage.setItem = () => {throw new Error('Full');}", "localStorage.setItem(STORAGE_KEY, '{}')"]) {
    const {run} = app();
    run(`globalThis.parsedCsv = CsvImport.read('Date,Description,Amount\\n2026-09-17,Shop,-25');
      csvDraft = {parsed:parsedCsv,mapping:parsedCsv.mapping,skipDuplicates:true}; saveState(); ${fail}`);
    const before = run('JSON.stringify(state)');
    assert.equal(run('commitCsvImport()'),false);
    assert.equal(run('JSON.stringify(state)'),before);
    assert.equal(run('csvDraft !== null'),true);
  }
});

test('old backups load without transactions and malformed transaction records are rejected', () => {
  const {run} = app();
  assert.equal(run('hydrateState({bills:[],payments:[]}).transactions.length'),0);
  run(`globalThis.tx = {id:'txn-1',date:'2026-09-17',description:'Shop',amountCents:-1234,category:'Shopping',account:'Checking'}`);
  assert.equal(run('getBackupState({...state,transactions:[tx]}) !== null'),true);
  for (const change of ["amountCents:1.234", "amountCents:null", "date:'2026-02-30'", "description:''", "account:null"]) {
    assert.equal(run(`getBackupState({...state,transactions:[{...tx,${change}}]})`),null);
  }
  assert.equal(run('getBackupState({...state,transactions:[tx,tx]})'),null);
});

function splitFixture(harness) {
  harness.run(`state.transactions = [{id:'txn-split',date:'2026-09-20',description:'Mixed shop',amountCents:-12345,category:'Shopping',account:'Checking'}];
    saveState(); openTransactionSplit('txn-split');
    splitDraft.parts = [{category:'Groceries',amount:'100.00',direction:'out'},{category:'Household',amount:'23.45',direction:'out'}];`);
}

test('saving and editing splits keeps original bank identity and net total without touching bills', () => {
  const harness = app();
  const {run,elements} = harness;
  splitFixture(harness);
  const untouched = run('JSON.stringify([state.bills,state.payments,state.settings])');
  assert.equal(run('commitTransactionSplit()'),true);
  assert.equal(run('state.transactions.length'),1);
  assert.equal(run('state.transactions[0].category'),'Shopping');
  assert.equal(run('state.transactions[0].amountCents'),-12345);
  assert.equal(run('state.transactions[0].splits.length'),2);
  assert.equal(elements.get('transactionSummary').textContent,'1 transactions - Net -$123.45');
  run(`openTransactionSplit('txn-split'); splitDraft.parts[0].amount='90'; splitDraft.parts[1].amount='33.45';`);
  assert.equal(run('commitTransactionSplit()'),true);
  assert.equal(run('state.transactions[0].splits[0].amountCents'),-9000);
  assert.equal(run('JSON.stringify([state.bills,state.payments,state.settings])'),untouched);
});

test('imbalanced, invalid and empty-category splits do not mutate saved data', () => {
  for (const change of ["splitDraft.parts[0].amount='100.01'", "splitDraft.parts[1].category=' '", "splitDraft.parts[0].amount='abc'"]) {
    const harness = app(); const {run} = harness;
    splitFixture(harness);
    const before = run('JSON.stringify(state)');
    run(change);
    assert.equal(run('commitTransactionSplit()'),false);
    assert.equal(run('JSON.stringify(state)'),before);
    assert.equal(run('splitDraft !== null'),true);
  }
});

test('split draft preserves edits on quota errors, stale saves and missing or changed source records', () => {
  for (const fail of ["localStorage.setItem=()=>{throw new Error('Full')}" , "localStorage.setItem(STORAGE_KEY,'{}')",
    "state.transactions=[]", "state.transactions[0].amountCents=-10000"]) {
    const harness = app(); const {run} = harness;
    splitFixture(harness);
    run(fail);
    const before = run('JSON.stringify(state)');
    assert.equal(run('commitTransactionSplit()'),false);
    assert.equal(run('JSON.stringify(state)'),before);
    assert.equal(run('splitDraft.parts[0].amount'),'100.00');
  }
});

test('split backups survive reload and malformed child totals or metadata are rejected', () => {
  const harness = app(); const {run} = harness;
  splitFixture(harness);
  run('commitTransactionSplit()');
  assert.equal(run('getBackupState(buildDataBackup()) !== null'),true);
  run('state=loadState()');
  assert.equal(run('unreadableStorage'),false);
  assert.equal(run('state.transactions[0].splits.length'),2);
  const snapshot = run('JSON.stringify(state)');
  for (const change of ["splits=[]", "splits=null", "splits[0].amountCents=-9999", "splits[0].date='2026-01-01'", "splits[0].category='' "]) {
    run(`state=${snapshot}; state.transactions[0].${change};`);
    assert.equal(run('getBackupState(buildDataBackup())'),null);
  }
});

test('Undo split restores original category and toast Undo restores the exact portions', () => {
  const harness = app(); const {run,elements} = harness;
  splitFixture(harness);
  run('commitTransactionSplit()');
  const split = run('JSON.stringify(state.transactions[0])');
  run(`openTransactionSplit('txn-split')`);
  assert.equal(run('commitTransactionSplit(true)'),true);
  assert.equal(run('state.transactions[0].splits'),undefined);
  assert.equal(run('state.transactions[0].category'),'Shopping');
  elements.get('toastUndoBtn').onclick();
  assert.equal(run('JSON.stringify(state.transactions[0])'),split);
});

test('toast Undo cannot overwrite a later transaction edit and cancellation never mutates the original', () => {
  const harness = app(); const {run,elements} = harness;
  splitFixture(harness);
  const original = run('JSON.stringify(state.transactions)');
  run(`splitDraft.parts[0].amount='1'; splitDraft=null;`);
  assert.equal(run('JSON.stringify(state.transactions)'),original);
  splitFixture(harness);
  run('commitTransactionSplit()');
  const undo = elements.get('toastUndoBtn').onclick;
  run(`state.transactions[0].account='Changed'; saveState();`);
  undo();
  assert.equal(run('state.transactions[0].account'),'Changed');
  assert.equal(run('state.transactions[0].splits.length'),2);
});

test('original CSV reimport skips a split transaction and preserves its portions', () => {
  const harness = app(); const {run} = harness;
  splitFixture(harness);
  run(`commitTransactionSplit();
    globalThis.parsedSplitCsv=CsvImport.read('Date,Description,Amount,Account\\n2026-09-20,Mixed shop,-123.45,Checking');
    csvDraft={parsed:parsedSplitCsv,mapping:parsedSplitCsv.mapping,skipDuplicates:true};`);
  assert.equal(run('commitCsvImport()'),false);
  assert.equal(run('state.transactions.length'),1);
  assert.equal(run('state.transactions[0].splits.length'),2);
});

function scanForm(harness, candidates) {
  harness.run(`emailScanCandidates = ${JSON.stringify(candidates)}.map(item => ({...item, dueDate:parseLocalDate(item.dueDate), dateFound:true, amountFound:true})); showView = () => {};`);
  const inputs = new Map();
  for (const candidate of candidates) {
    const fields = { name: candidate.name, amount: String(candidate.amount), 'due-date': candidate.dueDate,
      category: candidate.category, frequency: candidate.frequency, target: candidate.importTarget || 'auto', 'amount-choice': '0' };
    inputs.set(`[data-scan-select="${candidate.id}"]`, { checked: true });
    for (const [field, value] of Object.entries(fields)) {
      inputs.set(`[data-scan-${field}="${candidate.id}"]`, { value, reportValidity: () => true });
    }
  }
  harness.context.document.querySelector = (selector) => inputs.get(selector);
  return inputs;
}

test("same-name recurring bills require an explicit import destination", () => {
  const { run } = app();
  run(`state.bills = ['card-a','card-b'].map((id,i) => ({id, name:'City Bank', category:'credit', amount:50+i, frequency:'monthly', dueDay:20, dueDate:'2026-09-20'}));
    globalThis.candidate = {name:'City Bank', frequency:'monthly', amount:40, dueDate:parseLocalDate('2026-09-20'), dateFound:true};`);
  assert.equal(run('findMatchingCapturedBill(candidate)'), undefined);
  assert.equal(run('getCandidateMatch(candidate).status'), 'ambiguous-match');
  assert.equal(run("getCaptureDestination({...candidate, importTarget:'bill:card-b'}).bill.id"), 'card-b');
  assert.equal(run("getCandidateMatch({...candidate, importTarget:'new'}).status"), 'new-bill');
  assert.equal(run("Boolean(getCaptureDestination({...candidate, importTarget:'bill:missing'}).error)"), true);
});

test("a blocked batch changes no bills, rules, storage, or pasted text", () => {
  const harness = app();
  const { run, elements } = harness;
  run(`state.bills = ['card-a','card-b'].map(id => ({id, name:'City Bank', category:'credit', amount:50, frequency:'monthly', dueDay:20, dueDate:'2026-09-20'})); saveState();`);
  const inputs = scanForm(harness, [
    {id:'scan-a', name:'Water', category:'utilities', frequency:'monthly', amount:25, dueDate:'2026-09-15'},
    {id:'scan-b', name:'City Bank', category:'credit', frequency:'monthly', amount:40, dueDate:'2026-09-20'}
  ]);
  elements.get('emailPasteInput').value = 'Keep this draft';
  const before = run('JSON.stringify(state)');
  const saved = run('localStorage.getItem(STORAGE_KEY)');
  run('importScannedBills()');
  assert.equal(run('JSON.stringify(state)'), before);
  assert.equal(run('localStorage.getItem(STORAGE_KEY)'), saved);
  assert.equal(run('emailScanCandidates.length'), 2);
  assert.equal(elements.get('emailPasteInput').value, 'Keep this draft');
  inputs.get('[data-scan-target="scan-b"]').value = 'bill:card-b';
  run('importScannedBills()');
  assert.equal(run('state.bills.length'), 3);
  assert.equal(run("state.bills.find(bill => bill.id === 'card-a').amount"), 50);
  assert.equal(run("state.bills.find(bill => bill.id === 'card-b').amount"), 40);
  assert.equal(run('getBackupState(buildDataBackup()) !== null'), true);
});

test("a separate import does not overwrite the matching account", () => {
  const harness = app();
  harness.run(`state.bills = [{id:'card', name:'City Bank', category:'credit', amount:50, frequency:'monthly', dueDay:20, dueDate:'2026-09-20'}];`);
  scanForm(harness, [{id:'scan', name:'City Bank', category:'credit', amount:80, frequency:'monthly', dueDate:'2026-09-20', importTarget:'new'}]);
  harness.run('importScannedBills()');
  assert.equal(harness.run('state.bills.length'), 2);
  assert.equal(harness.run('state.bills[0].amount'), 50);
  assert.equal(harness.run('state.bills[1].amount'), 80);
});

test("automatic batch statements still update in due-date order and preserve amounts", () => {
  const harness = app();
  scanForm(harness, [
    {id:'later', name:'Water', category:'utilities', amount:80, frequency:'monthly', dueDate:'2026-10-20'},
    {id:'earlier', name:'Water', category:'utilities', amount:50, frequency:'monthly', dueDate:'2026-09-20'}
  ]);
  harness.run('importScannedBills()');
  assert.equal(harness.run('state.bills.length'), 1);
  assert.equal(harness.run('getMonthStatus().total'), 50);
  assert.equal(harness.run('getMonthStatus(new Date(2026,9,1)).total'), 80);
});

test("explicit destinations retain older-statement and paid-purchase safeguards", () => {
  const { run } = app();
  run(`state.bills = [{id:'card', name:'City Bank', category:'credit', amount:50, frequency:'monthly', dueDay:20, dueDate:'2026-09-20'},
    {id:'order', name:'Amazon', category:'purchase', amount:20, frequency:'one-time', dueDay:5, dueDate:'2026-09-05'}];
    markBillPaidForPeriod('order','2026-09-05');`);
  assert.equal(run("getCandidateMatch({name:'New label', frequency:'monthly', dueDate:parseLocalDate('2026-08-20'), dateFound:true, importTarget:'bill:card'}).status"), 'older-statement');
  assert.equal(run("getCandidateMatch({name:'Amazon', frequency:'one-time', dueDate:parseLocalDate('2026-10-05'), dateFound:true, importTarget:'bill:order'}).status"), 'paid-date');
  assert.equal(run("Boolean(getCaptureDestination({frequency:'monthly', importTarget:'bill:order'}).error)"), true);
});

test("resuming after midnight refreshes due status without replacing drafts", () => {
  const { run, elements, setNow } = app('2026-09-30T23:59:00');
  run(`state.bills = [{id:'water', name:'Water', category:'utilities', amount:50, frequency:'monthly', dueDay:30, dueDate:'2026-09-30'}];
    renderPocketOverview = renderMetrics = renderCalendar = renderAgenda = renderForecastBars = renderBills = () => {};`);
  elements.get('incomeInput').value = '7654';
  elements.get('reserveInput').value = '1234';
  elements.get('includeAutopayInput').checked = false;
  elements.get('emailPasteInput').value = 'Unfinished email';
  run("document.getElementById('billNameInput').value = 'Unfinished bill'");
  assert.equal(run('refreshDateSensitiveViews()'), false);
  assert.equal(run('getOverdueBills().length'), 0);
  setNow('2026-10-01T00:01:00');
  assert.equal(run('refreshDateSensitiveViews()'), true);
  assert.equal(run('getOverdueBills().length'), 1);
  assert.equal(run('toDateInputValue(displayDate)'), '2026-10-01');
  assert.equal(elements.get('incomeInput').value, '7654');
  assert.equal(elements.get('reserveInput').value, '1234');
  assert.equal(elements.get('includeAutopayInput').checked, false);
  assert.equal(elements.get('emailPasteInput').value, 'Unfinished email');
  assert.equal(elements.get('billNameInput').value, 'Unfinished bill');
  assert.match(elements.get('todayLabel').textContent, /October 1/);
  assert.equal(run('refreshDateSensitiveViews()'), false);
});

test("date refresh respects a browsed month or selected calendar day", () => {
  const { run, setNow } = app('2026-09-30T23:59:00');
  run(`renderTodayLabel = renderPocketOverview = renderMetrics = renderCalendar = renderAgenda = renderForecastBars = renderBills = renderBudget = () => {};
    displayDate = new Date(2027,0,1);`);
  setNow('2026-10-01T00:01:00');
  run('handleAppResume()');
  assert.equal(run('toDateInputValue(displayDate)'), '2027-01-01');
  run("displayDate = new Date(2026,9,1); selectedAgendaDate = '2026-10-05'");
  setNow('2026-11-01T00:01:00');
  run('handleAppResume()');
  assert.equal(run('toDateInputValue(displayDate)'), '2026-10-01');
  assert.equal(run('selectedAgendaDate'), '2026-10-05');
});

test("update checks report offline and failures without changing bill storage", async () => {
  const { run, elements } = app();
  run('saveState(); globalThis.navigator = {serviceWorker:{}, onLine:false}');
  const saved = run('localStorage.getItem(STORAGE_KEY)');
  await run('checkForAppUpdate()');
  assert.match(elements.get('appUpdateStatus').textContent, /Offline/);
  run("navigator.onLine = true; navigator.serviceWorker.getRegistration = async () => { throw new Error('Network'); }");
  await run('checkForAppUpdate()');
  assert.match(elements.get('appUpdateStatus').textContent, /Could not check/);
  assert.equal(elements.get('checkAppUpdateBtn').disabled, false);
  assert.equal(run('localStorage.getItem(STORAGE_KEY)'), saved);
});

test("update checks compare the active worker version with the running app", async () => {
  const { run, elements } = app();
  run(`globalThis.navigator = {onLine:true, serviceWorker:{getRegistration:async () => ({update:async () => {}, active:{}})}};
    getWorkerVersion = async () => APP_VERSION;`);
  await run('checkForAppUpdate()');
  assert.equal(elements.get('appUpdateStatus').textContent, `${run('APP_VERSION')}: no newer update found.`);
  run("getWorkerVersion = async () => 'v-next'");
  await run('checkForAppUpdate()');
  assert.equal(elements.get('updateNotice').hidden, false);
  assert.match(elements.get('appUpdateStatus').textContent, /Update ready/);
});

test("service worker reports the same version as the app", () => {
  const listeners = new Map();
  const worker = fs.readFileSync(path.join(__dirname, '../outputs/bill-calendar-pwa/sw.js'), 'utf8');
  const context = vm.createContext({self:{addEventListener:(name, fn) => listeners.set(name, fn)}});
  vm.runInContext(worker, context);
  let message;
  listeners.get('message')({data:{type:'GET_VERSION'}, ports:[{postMessage:value => { message = value; }}]});
  assert.equal(message.version, app().run('APP_VERSION'));
  assert.equal(vm.runInContext('CACHE_NAME', context), `billpocket-${message.version}`);
});

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

test("one-time and recurring overdue bills remain visible beyond 45 days", () => {
  const { run } = app();
  run(`state.bills = [
    {id:'old-order', name:'Purchase', category:'purchase', amount:25, frequency:'one-time', dueDay:10, dueDate:'2026-06-10'},
    {id:'rent', name:'Rent', category:'rent', amount:100, frequency:'monthly', dueDay:1, dueDate:'2026-01-01'}
  ]; state.payments = [{id:'paid-may', billId:'rent', amount:100, date:'2026-05-01', periodKey:'2026-05-01', status:'Paid'}];`);
  assert.equal(run("getAgendaGroups().overdue.some(item => item.bill.id === 'old-order')"), true);
  assert.equal(run("getAgendaGroups().overdue.filter(item => item.bill.id === 'rent').length"), 8);
  assert.equal(run("getUpcomingBills(7, {allOverdue:true}).some(item => toDateInputValue(item.dueDate) === '2026-01-01')"), true);
  assert.equal(run("getAgendaGroups().overdue.some(item => toDateInputValue(item.dueDate) === '2026-05-01')"), false);
});

test("legacy tracking migration preserves its start after later reloads", () => {
  const first = app();
  first.run(`state.bills = [{id:'legacy', name:'Rent', category:'rent', amount:100, frequency:'monthly', dueDay:1}]; saveState();`);
  const saved = first.run('JSON.stringify(state)');
  const started = first.run('state.bills[0].trackingStartedOn');
  const later = app('2027-01-08T12:00:00');
  later.run(`state = hydrateState(${saved})`);
  assert.equal(later.run('state.bills[0].trackingStartedOn'), started);
  assert.equal(later.run("getOverdueBills().some(item => toDateInputValue(item.dueDate) === '2026-08-01')"), true);
  assert.equal(later.run("getOverdueBills().some(item => toDateInputValue(item.dueDate) === '2026-06-01')"), false);
});

test("editing a bill amount does not rewrite a paid period or its forecast", () => {
  const { run } = app();
  run(`state.bills = [{id:'bill', name:'Utilities', category:'utilities', amount:100, frequency:'monthly', dueDay:5, dueDate:'2026-09-05'}];
    markBillPaidForPeriod('bill', '2026-09-05'); state.bills[0].amount = 175;`);
  assert.equal(run('getMonthStatus().paidTotal'), 100);
  assert.equal(run('getMonthStatus().total'), 100);
  assert.equal(run('getForecast(2)[0].total'), 100);
  assert.equal(run('getForecast(2)[1].total'), 175);
  assert.equal(run('state.payments[0].amount'), 100);
});

test("older recurring statements cannot overwrite newer amounts", () => {
  const { run } = app();
  run(`state.bills = [{id:'bill', name:'Water', category:'utilities', amount:75, frequency:'monthly', dueDay:14, dueDate:'2026-06-14', lastStatementDate:'2026-09-14'}];
    globalThis.candidate = {name:'Water', amount:50, frequency:'monthly', dueDate:parseLocalDate('2026-08-14'), dateFound:true};`);
  assert.equal(run('getCandidateMatch(candidate).status'), 'older-statement');
  run("candidate.dueDate = parseLocalDate('2026-10-14')");
  assert.equal(run('getCandidateMatch(candidate).status'), 'updates-existing');
  assert.equal(run('isOlderStatement(undefined, candidate)'), false);
});

test("history filters combine merchant, recorded month, and status", () => {
  const { run } = app();
  run(`state.payments = [
    {id:'p1', billName:'City Water', date:'2026-09-08', amount:75, status:'Paid', reference:'WATER-1'},
    {id:'p2', billName:'City Water', date:'2026-08-08', amount:60, status:'Paid'},
    {id:'p3', billName:'City Water', date:'2026-09-09', amount:80, status:'Demo'},
    {id:'p4', billName:'Rent', date:'2026-09-01', amount:1000, status:'Paid'}];`);
  assert.equal(run("getFilteredPayments({query:'water', month:'2026-09', status:'Paid'}).length"), 1);
  assert.equal(run("getFilteredPayments({query:'water-1'})[0].id"), 'p1');
  assert.equal(run("getFilteredPayments({status:'Demo'})[0].id"), 'p3');
  assert.equal(run("getFilteredPayments({month:'2027-01'}).length"), 0);
});

test("CSV exports preserve numeric negatives and treat formula-like labels as text", () => {
  const { run } = app();
  assert.equal(run(`createCsv([['=1+2', '-50.00', 'Water, City']])`), '"\'=1+2","-50.00","Water, City"');
});

test("legacy month-end one-time dates agree with the calendar", () => {
  const { run } = app();
  run(`globalThis.bill = {frequency:'one-time', dueDay:31, oneTimeMonth:1, oneTimeYear:2026}`);
  assert.equal(run('toDateInputValue(getNextDueDate(bill))'), '2026-02-28');
});

test("a stale tab cannot overwrite a newer payment and can back up its own edits", () => {
  const shared = new Map();
  const first = app(undefined, shared);
  first.run(`state.bills = [{id:'water', name:'Water', category:'utilities', amount:75, frequency:'monthly', dueDay:5, dueDate:'2026-09-05'}]; saveState();`);
  const second = app(undefined, shared);
  second.run('state = loadState()');
  first.run("markBillPaidForPeriod('water', '2026-09-05')");
  const latest = shared.get('billflow-pwa-state-v1');
  second.run('state.bills[0].amount = 100');
  assert.equal(second.run('saveState()'), false);
  assert.equal(shared.get('billflow-pwa-state-v1'), latest);
  assert.equal(JSON.parse(latest).payments.length, 1);
  assert.equal(second.run('buildDataBackup().state.bills[0].amount'), 100);
  assert.equal(second.run('unsavedChanges'), true);
  assert.equal(second.elements.get('loadLatestDataBtn').hidden, false);
  assert.equal(second.elements.get('retrySaveBtn').hidden, true);
});

test("storage checks ignore own saves but catch removed storage", () => {
  const { run, storage } = app();
  run('saveState(); checkForStorageChanges()');
  assert.equal(run('storageConflict'), false);
  storage.set('unrelated-key', 'changed');
  run('checkForStorageChanges()');
  assert.equal(run('storageConflict'), false);
  storage.delete('billflow-pwa-state-v1');
  run('checkForStorageChanges()');
  assert.equal(run('storageConflict'), true);
  assert.equal(run('saveState()'), false);
  assert.equal(storage.has('billflow-pwa-state-v1'), false);
});

test("failed saves can be retried without losing the in-memory changes", () => {
  const { run, elements } = app();
  run(`saveState(); globalThis.write = localStorage.setItem;
    localStorage.setItem = () => { throw new Error('Quota exceeded'); };
    state.settings.monthlyIncome = 6000;`);
  assert.equal(run('saveState()'), false);
  assert.equal(run('unsavedChanges'), true);
  assert.equal(elements.get('retrySaveBtn').hidden, false);
  run('localStorage.setItem = write');
  assert.equal(run('saveState()'), true);
  assert.equal(run('unsavedChanges'), false);
  assert.equal(elements.get('storageNotice').hidden, true);
  assert.equal(run('JSON.parse(localStorage.getItem(STORAGE_KEY)).settings.monthlyIncome'), 6000);
});

test("backup download does not change saved data or the activity log", () => {
  const { run } = app();
  run('saveState(); exportJson = (filename, payload) => { globalThis.downloaded = structuredClone(payload); }');
  const stored = run('localStorage.getItem(STORAGE_KEY)');
  const activity = run('JSON.stringify(state.activity)');
  run('exportDataBackup()');
  assert.equal(run('localStorage.getItem(STORAGE_KEY)'), stored);
  assert.equal(run('JSON.stringify(state.activity)'), activity);
  assert.equal(run('downloaded.app'), 'BillPocket');
});

test("restore rejects malformed timestamps, coerced amounts, and invalid containers", () => {
  const { run } = app();
  for (const value of ['null', 'false', '[]', '""', '" "']) {
    assert.equal(run(`getBackupState({bills:[], payments:[{id:'payment', date:'2026-09-05', amount:${value}}]})`), null);
  }
  for (const snapshot of [
    "{id:'snapshot', at:'2026-09-05T12:00:00', months:6, total:100, average:20}",
    "{id:'snapshot', createdAt:'2026-02-30T12:00:00', months:6, total:100, average:20}",
    "{id:'snapshot', createdAt:null, months:6, total:100, average:20}"
  ]) assert.equal(run(`getBackupState({bills:[], payments:[], snapshots:[${snapshot}]})`), null);
  for (const extra of ['settings:null', 'captureRules:[]', 'captureRules:{water:null}', 'activity:[{id:"a", createdAt:"2026-09-05T12:00:00"}]']) {
    assert.equal(run(`getBackupState({bills:[], payments:[], ${extra}})`), null);
  }
  assert.equal(run('getBackupState({app:"BillPocket", version:0, state})'), null);
  assert.equal(run('getBackupState({bills:[], payments:[{id:"p", date:"2026-09-05", amount:75, manualMark:true}]})'), null);
  assert.equal(run('getBackupState({bills:[], payments:[{id:"p", date:"2026-09-05", amount:"75.00"}]}) !== null'), true);
  assert.equal(run('getBackupState(buildDataBackup()) !== null'), true);
});

test("a failed backup restore keeps both current data and the saved copy", async () => {
  const { run } = app();
  run(`saveState(); globalThis.backup = buildDataBackup(); backup = structuredClone(backup);
    backup.state.settings.monthlyIncome = 9000;
    localStorage.setItem = () => { throw new Error('Quota exceeded'); };`);
  const before = run('JSON.stringify(state)');
  const stored = run('localStorage.getItem(STORAGE_KEY)');
  await run('importDataBackup([{text:async () => JSON.stringify(backup)}])');
  assert.equal(run('JSON.stringify(state)'), before);
  assert.equal(run('localStorage.getItem(STORAGE_KEY)'), stored);
});

test("backup restore cannot bypass stale-tab protection", async () => {
  const { run } = app();
  run(`saveState(); globalThis.before = JSON.stringify(state);
    globalThis.latest = structuredClone(state); latest.settings.monthlyIncome = 7000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(latest));`);
  await run('importDataBackup([{text:async () => JSON.stringify(buildDataBackup())}])');
  assert.equal(run('JSON.stringify(state) === before'), true);
  assert.equal(run('JSON.parse(localStorage.getItem(STORAGE_KEY)).settings.monthlyIncome'), 7000);
  assert.equal(run('storageConflict'), true);
});

test("undoing a removal restores the bill and existing paid period exactly once", () => {
  const { run, elements } = app();
  run(`state.bills = [{id:'water', name:'Water', category:'utilities', amount:75, frequency:'monthly', dueDay:5, dueDate:'2026-09-05', notes:'Keep this note', lastStatementDate:'2026-09-05'}];
    markBillPaidForPeriod('water', '2026-09-05');`);
  const bill = run('JSON.stringify(state.bills[0])');
  const history = run('JSON.stringify(state.payments)');
  run("deleteBill('water')");
  assert.equal(run('state.bills.length'), 0);
  assert.equal(run('JSON.stringify(state.payments)'), history);
  const undo = elements.get('toastUndoBtn').onclick;
  undo(); undo();
  assert.equal(run('state.bills.length'), 1);
  assert.equal(run('JSON.stringify(state.bills[0])'), bill);
  assert.equal(run('JSON.stringify(state.payments)'), history);
  assert.equal(run("Boolean(getPaidRecordForPeriod(state.bills[0], parseLocalDate('2026-09-05')))"), true);
});

test("a future schedule change keeps older unpaid periods and their amounts", () => {
  const { run, elements } = app();
  run(`state.bills = [{id:'water', name:'Water', category:'utilities', amount:75, frequency:'monthly', dueDay:5, dueDate:'2026-06-05'}];
    markBillPaidForPeriod('water', '2026-08-05'); openBillModal('water');`);
  elements.get('billDueDateInput').value = '2026-10-20';
  elements.get('billAmountInput').value = '100';
  run('saveBillFromForm()');
  assert.equal(run("toDateInputValue(getBillDueDateForMonth(state.bills[0], new Date(2026, 8, 1)))"), '2026-09-05');
  assert.equal(run('getMonthStatus().openTotal'), 75);
  assert.equal(run('getOverdueBills().length'), 3);
  assert.equal(run('getMonthStatus(new Date(2026, 7, 1)).paidTotal'), 75);
  assert.equal(run("toDateInputValue(getBillDueDateForMonth(state.bills[0], new Date(2026, 9, 1)))"), '2026-10-20');
  assert.equal(run('getForecast(2)[1].total'), 100);
  run("markBillPaidForPeriod('water', '2026-07-05')");
  assert.equal(run('state.payments.at(-1).amount'), 75);
});

test("moving a recurring due date does not reopen a paid month", () => {
  const { run, elements } = app();
  run(`state.bills = [{id:'water', name:'Water', category:'utilities', amount:75, frequency:'monthly', dueDay:5, dueDate:'2026-06-05'}];
    markBillPaidForPeriod('water', '2026-09-05'); openBillModal('water');`);
  elements.get('billDueDateInput').value = '2026-09-20';
  run('saveBillFromForm()');
  assert.equal(run('getMonthStatus().paidTotal'), 75);
  assert.equal(run('getMonthStatus().openTotal'), 0);
  assert.equal(run("toDateInputValue(getBillDueDateForMonth(state.bills[0], new Date(2026, 8, 1)))"), '2026-09-05');
  assert.equal(run("toDateInputValue(getBillDueDateForMonth(state.bills[0], new Date(2026, 9, 1)))"), '2026-10-20');
});

test("February statements keep a recurring 31st and preserve the previous amount", () => {
  const { run } = app('2027-02-10T12:00:00');
  run(`globalThis.original = {id:'water', name:'Water', category:'utilities', amount:75, frequency:'monthly', dueDay:31, dueDate:'2027-01-31'};
    globalThis.date = parseLocalDate('2027-02-28');
    state.bills = [preserveBillSchedule(original, {...original, amount:80, ...getCapturedSchedule(original, date, 'monthly')}, date)];`);
  assert.equal(run('state.bills[0].dueDay'), 31);
  assert.equal(run('state.bills[0].dueDate'), '2027-01-31');
  assert.equal(run("toDateInputValue(getBillDueDateForMonth(state.bills[0], new Date(2027, 2, 1)))"), '2027-03-31');
  assert.equal(run('getMonthStatus(new Date(2027, 0, 1)).openTotal'), 75);
  assert.equal(run('getMonthStatus(new Date(2027, 1, 1)).openTotal'), 80);
});

test("changing quarterly to annual keeps earlier quarters without creating extra dates", () => {
  const { run, elements } = app();
  run(`state.bills = [{id:'policy', name:'Policy', category:'insurance', amount:90, frequency:'quarterly', dueDay:20, dueDate:'2026-01-20'}]; openBillModal('policy');`);
  assert.equal(elements.get('billDueDateInput').value, '2026-10-20');
  elements.get('billDueDateInput').value = '2026-11-15';
  elements.get('billFrequencyInput').value = 'annual';
  elements.get('billAmountInput').value = '300';
  run('saveBillFromForm()');
  assert.equal(run('getOverdueBills().length'), 3);
  assert.equal(run('getMonthStatus(new Date(2026, 9, 1)).total'), 90);
  assert.equal(run('getMonthStatus(new Date(2026, 10, 1)).total'), 300);
  assert.equal(run('getMonthStatus(new Date(2027, 0, 1)).total'), 0);
  assert.equal(run('getMonthStatus(new Date(2027, 10, 1)).total'), 300);
});

test("repeated edits in the same month keep one history boundary and unchanged edits are inert", () => {
  const { run, elements } = app();
  run(`state.bills = [{id:'water', name:'Water', category:'utilities', amount:75, frequency:'monthly', dueDay:5, dueDate:'2026-06-05'}]; openBillModal('water');`);
  elements.get('billDueDateInput').value = '2026-10-20';
  run('saveBillFromForm(); openBillModal("water")');
  elements.get('billDueDateInput').value = '2026-10-25';
  elements.get('billAmountInput').value = '100';
  run('saveBillFromForm()');
  assert.equal(run('state.bills[0].scheduleHistory.length'), 1);
  assert.equal(run('getMonthStatus().openTotal'), 75);
  assert.equal(run("toDateInputValue(getBillDueDateForMonth(state.bills[0], new Date(2026, 9, 1)))"), '2026-10-25');
  const before = run('JSON.stringify(state.bills[0])');
  run('openBillModal("water"); saveBillFromForm()');
  assert.equal(run('JSON.stringify(state.bills[0])'), before);
});

test("paid one-time dates cannot move until undone and the editor unlocks afterward", () => {
  const { run, elements } = app();
  run(`state.bills = [{id:'order', name:'Amazon', category:'purchase', amount:25, frequency:'one-time', dueDay:5, dueDate:'2026-09-05'}];
    markBillPaidForPeriod('order', '2026-09-05'); openBillModal('order');`);
  assert.equal(elements.get('billDueDateInput').disabled, true);
  assert.equal(elements.get('billScheduleError').hidden, false);
  const before = run('JSON.stringify(state)');
  elements.get('billDueDateInput').value = '2026-10-05';
  run('saveBillFromForm()');
  assert.equal(run('JSON.stringify(state)'), before);
  run("unmarkBillPaidForPeriod('order', '2026-09-05'); openBillModal('order')");
  assert.equal(elements.get('billDueDateInput').disabled, false);
  assert.equal(elements.get('billScheduleError').hidden, true);
  elements.get('billDueDateInput').value = '2026-10-05';
  run('saveBillFromForm()');
  assert.equal(run('getMonthStatus().total'), 0);
  assert.equal(run('getMonthStatus(new Date(2026, 9, 1)).total'), 25);
});

test("schedule history survives a backup and malformed or unsorted history is rejected", () => {
  const { run, elements } = app();
  run(`state.bills = [{id:'water', name:'Water', category:'utilities', amount:75, frequency:'monthly', dueDay:5, dueDate:'2026-06-05'}]; openBillModal('water');`);
  elements.get('billDueDateInput').value = '2026-10-20';
  run('saveBillFromForm(); globalThis.backup = JSON.parse(JSON.stringify(buildDataBackup()))');
  assert.equal(run('getBackupState(backup) !== null'), true);
  run('state = hydrateState(getBackupState(backup))');
  assert.equal(run('getMonthStatus().openTotal'), 75);
  for (const history of ['{}', '[null]', '[{beforeMonth:"2026-99"}]', '[{...backup.state.bills[0].scheduleHistory[0], amount:null}]', '[...backup.state.bills[0].scheduleHistory, ...backup.state.bills[0].scheduleHistory]']) {
    assert.equal(run(`getBackupState({...state, bills:[{...state.bills[0], scheduleHistory:${history}}]})`), null);
  }
});

test("frequency changes retain one-time and recurring history in overdue lookups", () => {
  const { run, elements } = app();
  run(`state.bills = [{id:'bill', name:'Bill', category:'utilities', amount:75, frequency:'monthly', dueDay:5, dueDate:'2026-06-05'}]; openBillModal('bill');`);
  elements.get('billDueDateInput').value = '2026-10-05';
  elements.get('billFrequencyInput').value = 'one-time';
  run('saveBillFromForm()');
  assert.equal(run('getOverdueBills().length'), 4);
  assert.equal(run('getMonthStatus(new Date(2026, 10, 1)).total'), 0);
  run('openBillModal("bill")');
  elements.get('billDueDateInput').value = '2026-12-05';
  elements.get('billFrequencyInput').value = 'monthly';
  run('saveBillFromForm()');
  assert.equal(run('getMonthStatus(new Date(2026, 9, 1)).total'), 75);
  assert.equal(run('getMonthStatus(new Date(2026, 10, 1)).total'), 0);
  assert.equal(run('getMonthStatus(new Date(2026, 11, 1)).total'), 75);
  assert.equal(run('getOverdueBills().length'), 4);
});

test("old recurring payments do not lock a later unpaid one-time schedule", () => {
  const { run, elements } = app();
  run(`state.bills = [{id:'bill', name:'Bill', category:'utilities', amount:75, frequency:'monthly', dueDay:5, dueDate:'2026-06-05'}];
    markBillPaidForPeriod('bill', '2026-08-05'); openBillModal('bill');`);
  elements.get('billDueDateInput').value = '2026-10-05';
  elements.get('billFrequencyInput').value = 'one-time';
  run('saveBillFromForm(); openBillModal("bill")');
  assert.equal(elements.get('billDueDateInput').disabled, false);
  elements.get('billDueDateInput').value = '2026-11-05';
  run('saveBillFromForm()');
  assert.equal(run('getMonthStatus(new Date(2026, 9, 1)).total'), 0);
  assert.equal(run('getMonthStatus(new Date(2026, 10, 1)).total'), 75);
  assert.equal(run('getMonthStatus(new Date(2026, 7, 1)).paidTotal'), 75);
});
