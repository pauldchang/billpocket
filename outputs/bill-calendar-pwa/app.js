const STORAGE_KEY = "billflow-pwa-state-v1";

const categoryLabels = {
  rent: "Rent",
  mortgage: "Mortgage",
  utilities: "Utilities",
  phone: "Phone",
  loan: "Loan",
  insurance: "Insurance",
  credit: "Credit card",
  subscription: "Subscription",
  medical: "Medical",
  tax: "Taxes",
  childcare: "Childcare",
  purchase: "Online purchase",
  other: "Other"
};

const providerLabels = {
  manual: "Manual",
  brightgrid: "BrightGrid Utilities",
  rentnest: "RentNest Portal",
  homekey: "HomeKey Mortgage",
  northstar: "NorthStar Loans",
  clearcard: "ClearCard",
  sureline: "SureLine Insurance"
};

const seedState = {
  bankConnected: false,
  selectedProvider: null,
  settings: {
    monthlyIncome: 5400,
    reserveTarget: 900,
    includeAutopay: true
  },
  bills: [
    {
      id: "bill-rent",
      name: "Oak Street Rent",
      category: "rent",
      amount: 1625,
      dueDay: 1,
      frequency: "monthly",
      provider: "rentnest",
      autopay: false,
      notes: "Portal accepts ACH"
    },
    {
      id: "bill-mortgage",
      name: "HomeKey Mortgage",
      category: "mortgage",
      amount: 1842.5,
      dueDay: 1,
      frequency: "monthly",
      provider: "homekey",
      autopay: false,
      notes: "Escrow included"
    },
    {
      id: "bill-electric",
      name: "BrightGrid Electric",
      category: "utilities",
      amount: 148.64,
      dueDay: 14,
      frequency: "monthly",
      provider: "brightgrid",
      autopay: true,
      notes: "Usage varies in summer"
    },
    {
      id: "bill-water",
      name: "City Water",
      category: "utilities",
      amount: 72.2,
      dueDay: 21,
      frequency: "monthly",
      provider: "manual",
      autopay: false,
      notes: "Manual city portal"
    },
    {
      id: "bill-auto",
      name: "NorthStar Auto Loan",
      category: "loan",
      amount: 418.32,
      dueDay: 18,
      frequency: "monthly",
      provider: "northstar",
      autopay: true,
      notes: "Loan payment"
    },
    {
      id: "bill-card",
      name: "ClearCard Visa",
      category: "credit",
      amount: 220,
      dueDay: 25,
      frequency: "monthly",
      provider: "clearcard",
      autopay: false,
      notes: "Budgeted payoff"
    },
    {
      id: "bill-insurance",
      name: "SureLine Insurance",
      category: "insurance",
      amount: 186.4,
      dueDay: 9,
      frequency: "monthly",
      provider: "sureline",
      autopay: true,
      notes: "Auto and renters"
    },
    {
      id: "bill-stream",
      name: "StreamWave",
      category: "subscription",
      amount: 19.99,
      dueDay: 28,
      frequency: "monthly",
      provider: "manual",
      autopay: true,
      notes: "Entertainment"
    }
  ],
  services: [
    {
      id: "brightgrid",
      name: "BrightGrid Utilities",
      category: "Utilities",
      status: "connected",
      lastSync: "2026-06-07T18:30:00",
      nextSync: "2026-06-08T07:00:00",
      scope: "Due dates, balances, autopay status"
    },
    {
      id: "rentnest",
      name: "RentNest Portal",
      category: "Rent",
      status: "pending",
      lastSync: null,
      nextSync: null,
      scope: "Lease ledger, due amount, payment status"
    },
    {
      id: "homekey",
      name: "HomeKey Mortgage",
      category: "Mortgage",
      status: "manual",
      lastSync: null,
      nextSync: null,
      scope: "Monthly payment, escrow, due date, payoff balance"
    },
    {
      id: "northstar",
      name: "NorthStar Loans",
      category: "Loans",
      status: "connected",
      lastSync: "2026-06-07T15:15:00",
      nextSync: "2026-06-08T06:30:00",
      scope: "Loan payment, payoff balance, confirmation"
    },
    {
      id: "clearcard",
      name: "ClearCard",
      category: "Credit cards",
      status: "manual",
      lastSync: null,
      nextSync: null,
      scope: "Statement due date, minimum due, posted payment"
    },
    {
      id: "sureline",
      name: "SureLine Insurance",
      category: "Insurance",
      status: "connected",
      lastSync: "2026-06-07T10:00:00",
      nextSync: "2026-06-08T10:00:00",
      scope: "Premium amount, policy due date, autopay status"
    }
  ],
  accounts: [],
  payments: [
    {
      id: "pay-1001",
      date: "2026-06-01",
      billId: "bill-rent",
      billName: "Oak Street Rent",
      amount: 1625,
      source: "Manual",
      method: "ACH",
      status: "Paid",
      reference: "RENT-0601"
    },
    {
      id: "pay-1002",
      date: "2026-06-09",
      billId: "bill-insurance",
      billName: "SureLine Insurance",
      amount: 186.4,
      source: "Autopay",
      method: "ACH",
      status: "Scheduled",
      reference: "AUTO-0609"
    }
  ],
  snapshots: [
    {
      id: "snap-1",
      createdAt: "2026-06-07T20:15:00",
      months: 6,
      total: 16141.3,
      average: 2690.22
    }
  ],
  emailScanHistory: [],
  captureRules: {},
  captureSources: [
    {
      id: "inbox",
      name: "Gmail / Outlook",
      category: "Email",
      status: "ready",
      scope: "Receipts, statements, due-date reminders"
    },
    {
      id: "sms",
      name: "Text messages",
      category: "Phone",
      status: "ready",
      scope: "Short-code reminders and renewal texts"
    },
    {
      id: "attachments",
      name: "Files",
      category: "Statements",
      status: "ready",
      scope: "Forwarded emails, text exports, copied PDFs"
    },
    {
      id: "bank-feed",
      name: "Bank feed",
      category: "Transactions",
      status: "ready",
      scope: "Recurring charges and posted payments"
    },
    {
      id: "online-purchases",
      name: "Online purchases",
      category: "Shopping",
      status: "ready",
      scope: "Amazon, Walmart, Target, Etsy, PayPal receipts"
    },
    {
      id: "biller-directory",
      name: "Biller directory",
      category: "Portals",
      status: "ready",
      scope: "Utility, rent, loan, insurance portals"
    }
  ],
  activity: [
    {
      id: "act-1",
      at: "2026-06-07T18:30:00",
      title: "BrightGrid synced",
      detail: "Electric bill due date and amount refreshed"
    },
    {
      id: "act-2",
      at: "2026-06-07T15:15:00",
      title: "NorthStar synced",
      detail: "Loan payment status confirmed"
    }
  ]
};

let state = loadState();
let displayDate = startOfMonth(new Date());
let deferredInstallPrompt = null;
let emailScanCandidates = [];
let emailScanTimer = null;

const els = {
  todayLabel: document.getElementById("todayLabel"),
  viewTitle: document.getElementById("viewTitle"),
  quickPayHeading: document.getElementById("quickPayHeading"),
  quickPayMeta: document.getElementById("quickPayMeta"),
  quickPayDate: document.getElementById("quickPayDate"),
  quickPayAmount: document.getElementById("quickPayAmount"),
  quickPayBtn: document.getElementById("quickPayBtn"),
  quickMarkPaidBtn: document.getElementById("quickMarkPaidBtn"),
  heroStrip: document.getElementById("heroStrip"),
  metricGrid: document.getElementById("metricGrid"),
  calendarGrid: document.getElementById("calendarGrid"),
  calendarMonthLabel: document.getElementById("calendarMonthLabel"),
  agendaList: document.getElementById("agendaList"),
  forecastBars: document.getElementById("forecastBars"),
  billList: document.getElementById("billList"),
  billSearchInput: document.getElementById("billSearchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  incomeInput: document.getElementById("incomeInput"),
  reserveInput: document.getElementById("reserveInput"),
  includeAutopayInput: document.getElementById("includeAutopayInput"),
  budgetRows: document.getElementById("budgetRows"),
  snapshotList: document.getElementById("snapshotList"),
  discoveryEmailInput: document.getElementById("discoveryEmailInput"),
  discoveryPhoneInput: document.getElementById("discoveryPhoneInput"),
  captureSourceGrid: document.getElementById("captureSourceGrid"),
  captureInsights: document.getElementById("captureInsights"),
  emailPasteInput: document.getElementById("emailPasteInput"),
  emailFileInput: document.getElementById("emailFileInput"),
  emailPasteStatus: document.getElementById("emailPasteStatus"),
  emailScanResults: document.getElementById("emailScanResults"),
  emailScanSummary: document.getElementById("emailScanSummary"),
  serviceGrid: document.getElementById("serviceGrid"),
  activityList: document.getElementById("activityList"),
  accountList: document.getElementById("accountList"),
  paymentRows: document.getElementById("paymentRows"),
  dataBackupStatus: document.getElementById("dataBackupStatus"),
  restoreDataInput: document.getElementById("restoreDataInput"),
  bankStatusDot: document.getElementById("bankStatusDot"),
  bankStatusTitle: document.getElementById("bankStatusTitle"),
  bankStatusMeta: document.getElementById("bankStatusMeta"),
  bankCardLabel: document.getElementById("bankCardLabel"),
  bankCardName: document.getElementById("bankCardName"),
  bankCardMeta: document.getElementById("bankCardMeta"),
  toast: document.getElementById("toast"),
  installBtn: document.getElementById("installBtn")
};

const billForm = document.getElementById("billForm");
const bankForm = document.getElementById("bankForm");
const payForm = document.getElementById("payForm");

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return structuredClone(seedState);
    }
    const parsed = JSON.parse(stored);
    return hydrateState(parsed);
  } catch {
    return structuredClone(seedState);
  }
}

function hydrateState(parsed = {}) {
  const seed = structuredClone(seedState);
  const source = parsed && typeof parsed === "object" ? parsed : {};
  return {
    ...seed,
    ...source,
    settings: { ...seed.settings, ...(source.settings || {}) },
    bills: Array.isArray(source.bills) ? source.bills : seed.bills,
    services: mergeById(source.services, seed.services),
    accounts: Array.isArray(source.accounts) ? source.accounts : seed.accounts,
    payments: Array.isArray(source.payments) ? source.payments : seed.payments,
    snapshots: Array.isArray(source.snapshots) ? source.snapshots : seed.snapshots,
    emailScanHistory: Array.isArray(source.emailScanHistory) ? source.emailScanHistory : seed.emailScanHistory,
    captureRules: { ...(source.captureRules || {}) },
    captureSources: mergeById(source.captureSources, seed.captureSources),
    activity: Array.isArray(source.activity) ? source.activity : seed.activity
  };
}

function mergeById(savedItems = [], defaultItems = []) {
  const defaults = Array.isArray(defaultItems) ? defaultItems : [];
  const saved = Array.isArray(savedItems) ? savedItems : [];
  const byId = new Map(defaults.map((item) => [item.id, { ...item }]));
  saved.forEach((item) => {
    if (!item?.id) return;
    byId.set(item.id, { ...(byId.get(item.id) || {}), ...item });
  });
  return [...byId.values()];
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(date);
}

function toDateInputValue(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseLocalDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function dayDiff(a, b) {
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((end - start) / 86400000);
}

function getBillDueDateForMonth(bill, monthDate) {
  const targetMonth = monthDate.getMonth();
  const targetYear = monthDate.getFullYear();
  const day = Math.min(Number(bill.dueDay), endOfMonth(monthDate).getDate());

  if (bill.frequency === "quarterly" && targetMonth % 3 !== 0) {
    return null;
  }

  if (bill.frequency === "annual" && targetMonth !== 0) {
    return null;
  }

  if (bill.frequency === "one-time") {
    const oneTimeMonth = bill.oneTimeMonth ?? new Date().getMonth();
    const oneTimeYear = bill.oneTimeYear ?? new Date().getFullYear();
    if (targetMonth !== oneTimeMonth || targetYear !== oneTimeYear) {
      return null;
    }
  }

  return new Date(targetYear, targetMonth, day);
}

function getUpcomingBills(days = 45, options = {}) {
  const today = new Date();
  const results = [];
  const lateDays = Number.isFinite(Number(options.lateDays)) ? Number(options.lateDays) : 7;
  const startOffset = lateDays > today.getDate() ? -1 : 0;
  for (let offset = startOffset; offset <= Math.ceil(days / 31) + 1; offset += 1) {
    const monthDate = addMonths(today, offset);
    state.bills.forEach((bill) => {
      const dueDate = getBillDueDateForMonth(bill, monthDate);
      if (!dueDate) return;
      const diff = dayDiff(today, dueDate);
      if (diff >= -lateDays && diff <= days) {
        results.push({ bill, dueDate, diff });
      }
    });
  }
  return results.sort((a, b) => a.dueDate - b.dueDate);
}

function getBillsForMonth(monthDate) {
  return state.bills
    .map((bill) => ({ bill, dueDate: getBillDueDateForMonth(bill, monthDate) }))
    .filter((item) => item.dueDate)
    .sort((a, b) => a.dueDate - b.dueDate || a.bill.amount - b.bill.amount);
}

function getForecast(months = 6) {
  const today = startOfMonth(new Date());
  return Array.from({ length: months }, (_, index) => {
    const month = addMonths(today, index);
    const bills = getBillsForMonth(month).filter((item) => {
      return state.settings.includeAutopay || !item.bill.autopay;
    });
    const total = bills.reduce((sum, item) => sum + Number(item.bill.amount), 0);
    const afterBills = Number(state.settings.monthlyIncome || 0) - total;
    const reserveGap = Math.max(0, Number(state.settings.reserveTarget || 0) - afterBills);
    return { month, bills, total, afterBills, reserveGap };
  });
}

function getMonthStatus(monthDate = new Date()) {
  const bills = getBillsForMonth(monthDate);
  const paid = bills.filter((item) => getPaidRecordForPeriod(item.bill, item.dueDate));
  const open = bills.filter((item) => !getPaidRecordForPeriod(item.bill, item.dueDate));
  const total = bills.reduce((sum, item) => sum + Number(item.bill.amount || 0), 0);
  const paidTotal = paid.reduce((sum, item) => sum + Number(item.bill.amount || 0), 0);
  const openTotal = open.reduce((sum, item) => sum + Number(item.bill.amount || 0), 0);
  const afterOpen = Number(state.settings.monthlyIncome || 0) - openTotal;

  return {
    bills,
    paid,
    open,
    total,
    paidTotal,
    openTotal,
    afterOpen
  };
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  renderStatus();
  renderPocketOverview();
  renderMetrics();
  renderCalendar();
  renderAgenda();
  renderForecastBars();
  renderBills();
  renderBudget();
  renderCaptureTools();
  renderEmailScan();
  renderConnections();
  renderPayments();
  renderDataBackupStatus();
}

function renderPocketOverview() {
  const monthStatus = getMonthStatus(new Date());
  const upcoming = getUpcomingBills(60, { lateDays: 45 }).filter((item) => !getPaidRecordForPeriod(item.bill, item.dueDate));
  const next = upcoming[0];
  const connectedServices = state.services.filter((service) => service.status === "connected").length;
  const subscriptionTotal = getBillsForMonth(new Date())
    .filter((item) => item.bill.category === "subscription")
    .reduce((sum, item) => sum + Number(item.bill.amount), 0);
  const purchaseTotal = getBillsForMonth(new Date())
    .filter((item) => item.bill.category === "purchase")
    .reduce((sum, item) => sum + Number(item.bill.amount), 0);

  if (!next) {
    els.quickPayHeading.textContent = "No unpaid bills queued";
    els.quickPayMeta.textContent = "Everything in the current queue is marked paid.";
    els.quickPayDate.textContent = "Clear";
    els.quickPayAmount.textContent = "$0.00";
    els.quickPayBtn.disabled = true;
    els.quickPayBtn.removeAttribute("data-next-bill");
    els.quickPayBtn.removeAttribute("data-next-due-date");
    els.quickMarkPaidBtn.disabled = true;
    els.quickMarkPaidBtn.removeAttribute("data-next-bill");
    els.quickMarkPaidBtn.removeAttribute("data-next-due-date");
  } else {
    const dueText = next.diff < 0 ? `${Math.abs(next.diff)} days late` : next.diff === 0 ? "Due today" : `Due in ${next.diff} days`;
    els.quickPayHeading.textContent = next.bill.name;
    els.quickPayMeta.textContent = `${dueText} - ${categoryLabels[next.bill.category] || "Other"} - ${providerLabels[next.bill.provider] || "Manual"}`;
    els.quickPayDate.textContent = formatDate(next.dueDate);
    els.quickPayAmount.textContent = formatMoney(next.bill.amount);
    els.quickPayBtn.disabled = false;
    els.quickPayBtn.dataset.nextBill = next.bill.id;
    els.quickPayBtn.dataset.nextDueDate = toDateInputValue(next.dueDate);
    els.quickMarkPaidBtn.disabled = false;
    els.quickMarkPaidBtn.dataset.nextBill = next.bill.id;
    els.quickMarkPaidBtn.dataset.nextDueDate = toDateInputValue(next.dueDate);
  }

  const stripItems = [
    {
      label: "Open bills",
      value: formatMoney(monthStatus.openTotal)
    },
    {
      label: "Paid",
      value: formatMoney(monthStatus.paidTotal)
    },
    {
      label: "After open",
      value: formatMoney(monthStatus.afterOpen)
    },
    {
      label: "Purchases",
      value: formatMoney(purchaseTotal)
    },
    {
      label: "Subs",
      value: formatMoney(subscriptionTotal)
    },
    {
      label: "Synced",
      value: `${connectedServices}/${state.services.length}`
    }
  ];

  els.heroStrip.innerHTML = stripItems.map((item) => `
    <div class="hero-stat">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
    </div>
  `).join("");
}

function renderStatus() {
  const connected = state.bankConnected && state.accounts.length > 0;
  els.bankStatusDot.classList.toggle("connected", connected);
  els.bankStatusTitle.textContent = connected ? "Bank connected" : "Bank not connected";
  els.bankStatusMeta.textContent = connected ? `${state.accounts.length} payment source${state.accounts.length === 1 ? "" : "s"}` : "Ready for setup";
  els.bankCardLabel.textContent = connected ? state.selectedProvider || "Linked bank" : "Checking";
  els.bankCardName.textContent = connected ? state.accounts[0].name : "Not connected";
  els.bankCardMeta.textContent = connected ? `${state.accounts[0].type} account ending ${state.accounts[0].last4}` : "ACH and card payment rails";
}

function renderMetrics() {
  const monthStatus = getMonthStatus(new Date());
  const dueSoon = getUpcomingBills(7, { lateDays: 45 }).filter((item) => !getPaidRecordForPeriod(item.bill, item.dueDate));
  const purchases = monthStatus.bills.filter((item) => item.bill.category === "purchase");
  const purchaseTotal = purchases.reduce((sum, item) => sum + Number(item.bill.amount), 0);
  const metrics = [
    {
      label: "Open",
      value: formatMoney(monthStatus.openTotal),
      meta: `${monthStatus.open.length} unpaid this month`
    },
    {
      label: "Due soon",
      value: formatMoney(dueSoon.reduce((sum, item) => sum + Number(item.bill.amount), 0)),
      meta: `${dueSoon.length} late or due in 7 days`
    },
    {
      label: "Paid",
      value: formatMoney(monthStatus.paidTotal),
      meta: `${monthStatus.paid.length} marked paid`
    },
    {
      label: "Purchases",
      value: formatMoney(purchaseTotal),
      meta: `${purchases.length} this month`
    }
  ];

  els.metricGrid.innerHTML = metrics.map((metric) => `
    <article class="metric-card">
      <span>${metric.label}</span>
      <strong>${metric.value}</strong>
      <small>${metric.meta}</small>
    </article>
  `).join("");
}

function renderCalendar() {
  const today = new Date();
  const first = startOfMonth(displayDate);
  const last = endOfMonth(displayDate);
  const monthBills = getBillsForMonth(displayDate);
  const byDate = new Map();

  monthBills.forEach((item) => {
    const key = toDateInputValue(item.dueDate);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(item.bill);
  });

  els.calendarMonthLabel.textContent = formatMonth(displayDate);
  const cells = [];

  for (let i = 0; i < first.getDay(); i += 1) {
    cells.push(`<div class="calendar-cell is-muted" aria-hidden="true"></div>`);
  }

  for (let day = 1; day <= last.getDate(); day += 1) {
    const date = new Date(first.getFullYear(), first.getMonth(), day);
    const key = toDateInputValue(date);
    const bills = byDate.get(key) || [];
    const total = bills.reduce((sum, bill) => sum + Number(bill.amount), 0);
    cells.push(`
      <div class="calendar-cell ${isSameDay(date, today) ? "is-today" : ""}">
        <div class="calendar-day-number">
          <span>${day}</span>
          ${bills.length ? `<span>${formatMoney(total)}</span>` : ""}
        </div>
        ${bills.slice(0, 3).map((bill) => {
          const paid = Boolean(getPaidRecordForPeriod(bill, date));
          return `
            <button class="bill-pill ${bill.category} ${paid ? "is-paid" : ""}" type="button" data-pay-bill="${bill.id}" data-due-date="${toDateInputValue(date)}" title="${escapeHtml(bill.name)} ${formatMoney(bill.amount)}">
              ${escapeHtml(bill.name)}
            </button>
          `;
        }).join("")}
        ${bills.length > 3 ? `<span class="bill-pill other">+${bills.length - 3} more</span>` : ""}
      </div>
    `);
  }

  els.calendarGrid.innerHTML = cells.join("");
}

function renderAgenda() {
  const upcoming = getUpcomingBills(45, { lateDays: 45 })
    .filter((item) => !getPaidRecordForPeriod(item.bill, item.dueDate) || item.diff >= 0)
    .slice(0, 9);
  if (!upcoming.length) {
    els.agendaList.innerHTML = `<div class="empty-state">No upcoming bills found.</div>`;
    return;
  }

  els.agendaList.innerHTML = upcoming.map(({ bill, dueDate, diff }) => {
    const paidRecord = getPaidRecordForPeriod(bill, dueDate);
    const tag = paidRecord ? "Paid" : diff < 0 ? `${Math.abs(diff)}d late` : diff === 0 ? "Today" : `${diff}d`;
    return `
      <article class="agenda-item">
        <div class="date-badge">${dueDate.getDate()}</div>
        <div class="agenda-main">
          <strong>${escapeHtml(bill.name)}</strong>
          <span>${formatDate(dueDate)} - ${formatMoney(bill.amount)}</span>
        </div>
        ${paidRecord ? `
          <div class="agenda-actions">
            <button class="ghost-btn small" type="button" data-unmark-bill-paid="${bill.id}" data-due-date="${toDateInputValue(dueDate)}">
              <span aria-hidden="true">-</span>
              <span>Undo</span>
            </button>
          </div>
        ` : `
          <div class="agenda-actions">
            <button class="primary-btn small" type="button" data-pay-bill="${bill.id}" data-due-date="${toDateInputValue(dueDate)}">
              <span aria-hidden="true">$</span>
              <span>Pay</span>
            </button>
            <button class="secondary-btn small" type="button" data-mark-bill-paid="${bill.id}" data-due-date="${toDateInputValue(dueDate)}">
              <span aria-hidden="true">OK</span>
              <span>Mark paid</span>
            </button>
          </div>
        `}
        <span class="due-tag ${paidRecord ? "paid" : diff < 0 ? "overdue" : ""}">${tag}</span>
      </article>
    `;
  }).join("");
}

function renderForecastBars() {
  const forecast = getForecast(6);
  const max = Math.max(...forecast.map((item) => item.total), 1);
  els.forecastBars.innerHTML = forecast.map((item) => {
    const height = Math.max(8, Math.round((item.total / max) * 100));
    return `
      <article class="forecast-month">
        <div>
          <strong>${formatMonth(item.month).split(" ")[0]}</strong>
          <span>${item.bills.length} bills</span>
        </div>
        <div class="bar-track" aria-hidden="true">
          <div class="bar-fill" style="--bar-size:${height}%"></div>
        </div>
        <span>${formatMoney(item.total)}</span>
      </article>
    `;
  }).join("");
}

function renderBills() {
  const query = els.billSearchInput.value.trim().toLowerCase();
  const category = els.categoryFilter.value;
  const bills = state.bills
    .filter((bill) => category === "all" || bill.category === category)
    .filter((bill) => !query || bill.name.toLowerCase().includes(query) || (providerLabels[bill.provider] || "Manual").toLowerCase().includes(query))
    .sort((a, b) => a.dueDay - b.dueDay);

  if (!bills.length) {
    els.billList.innerHTML = `<div class="empty-state">No bills match the current filters.</div>`;
    return;
  }

  els.billList.innerHTML = bills.map((bill) => {
    const dueDate = getNextDueDate(bill);
    const paidRecord = getPaidRecordForPeriod(bill, dueDate);
    const categoryLabel = categoryLabels[bill.category] || "Other";
    const providerLabel = providerLabels[bill.provider] || "Manual";
    return `
      <article class="bill-card">
        <div class="bill-card-head">
          <div>
            <h3>${escapeHtml(bill.name)}</h3>
            <p>${escapeHtml(providerLabel)}</p>
          </div>
          <div class="bill-badges">
            <span class="category-tag ${bill.category}">${categoryLabel}</span>
            <span class="status-tag ${paidRecord ? "paid" : "manual"}">${paidRecord ? "Paid this period" : "Open"}</span>
          </div>
        </div>
        <div class="bill-meta">
          <div class="meta-box">
            <span>Amount</span>
            <strong>${formatMoney(bill.amount)}</strong>
          </div>
          <div class="meta-box">
            <span>Next due</span>
            <strong>${formatDate(dueDate)}</strong>
          </div>
          <div class="meta-box">
            <span>Frequency</span>
            <strong>${capitalize(bill.frequency)}</strong>
          </div>
          <div class="meta-box">
            <span>Autopay</span>
            <strong>${bill.autopay ? "On" : "Off"}</strong>
          </div>
          <div class="meta-box">
            <span>Period status</span>
            <strong>${paidRecord ? `Paid ${formatDate(parseLocalDate(paidRecord.date))}` : "Not paid yet"}</strong>
          </div>
        </div>
        <div class="bill-actions">
          <button class="primary-btn small" type="button" data-pay-bill="${bill.id}" data-due-date="${toDateInputValue(dueDate)}">
            <span aria-hidden="true">$</span>
            <span>Pay</span>
          </button>
          ${paidRecord ? `
            <button class="secondary-btn small" type="button" data-unmark-bill-paid="${bill.id}" data-due-date="${toDateInputValue(dueDate)}">
              <span aria-hidden="true">-</span>
              <span>Undo paid</span>
            </button>
          ` : `
            <button class="secondary-btn small" type="button" data-mark-bill-paid="${bill.id}" data-due-date="${toDateInputValue(dueDate)}">
              <span aria-hidden="true">OK</span>
              <span>Mark paid</span>
            </button>
          `}
          <button class="secondary-btn small" type="button" data-edit-bill="${bill.id}">
            <span aria-hidden="true">E</span>
            <span>Edit</span>
          </button>
          <button class="ghost-btn small" type="button" data-toggle-autopay="${bill.id}">
            <span aria-hidden="true">${bill.autopay ? "-" : "+"}</span>
            <span>${bill.autopay ? "Autopay off" : "Autopay on"}</span>
          </button>
          <button class="danger-btn small" type="button" data-delete-bill="${bill.id}">
            <span aria-hidden="true">x</span>
            <span>Remove</span>
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function getNextDueDate(bill) {
  const today = new Date();
  for (let offset = 0; offset < 15; offset += 1) {
    const candidate = getBillDueDateForMonth(bill, addMonths(today, offset));
    if (candidate && dayDiff(today, candidate) >= 0) {
      return candidate;
    }
  }
  return getBillDueDateForMonth(bill, today) || today;
}

function getPeriodKey(date) {
  return toDateInputValue(date);
}

function getPaidRecordForPeriod(bill, dueDate = getNextDueDate(bill)) {
  const periodKey = getPeriodKey(dueDate);
  return state.payments.find((payment) => {
    return payment.billId === bill.id
      && payment.periodKey === periodKey
      && payment.status === "Paid";
  }) || null;
}

function renderBudget() {
  els.incomeInput.value = state.settings.monthlyIncome;
  els.reserveInput.value = state.settings.reserveTarget;
  els.includeAutopayInput.checked = state.settings.includeAutopay;

  els.budgetRows.innerHTML = getForecast(12).map((item) => `
    <tr>
      <td>${formatMonth(item.month)}</td>
      <td>${formatMoney(item.total)} <span class="muted-inline">(${item.bills.length})</span></td>
      <td>${formatMoney(item.afterBills)}</td>
      <td>${item.reserveGap ? formatMoney(item.reserveGap) : "$0.00"}</td>
    </tr>
  `).join("");

  if (!state.snapshots.length) {
    els.snapshotList.innerHTML = `<div class="empty-state">No forecast snapshots saved.</div>`;
    return;
  }

  els.snapshotList.innerHTML = state.snapshots
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((snapshot) => `
      <article class="snapshot-card">
        <div class="snapshot-card-head">
          <div>
            <h3>${formatDate(new Date(snapshot.createdAt))}</h3>
            <p>${snapshot.months} month forecast</p>
          </div>
          <span class="status-tag pending">${formatMoney(snapshot.average)}/mo</span>
        </div>
        <div class="bill-meta">
          <div class="meta-box">
            <span>Total bills</span>
            <strong>${formatMoney(snapshot.total)}</strong>
          </div>
          <div class="meta-box">
            <span>Average</span>
            <strong>${formatMoney(snapshot.average)}</strong>
          </div>
        </div>
      </article>
    `).join("");
}

function renderConnections() {
  if (!state.accounts.length) {
    els.accountList.innerHTML = `<div class="empty-state">No payment accounts linked.</div>`;
  } else {
    els.accountList.innerHTML = state.accounts.map((account) => `
      <article class="account-item">
        <span class="activity-icon" aria-hidden="true">$</span>
        <div>
          <strong>${escapeHtml(account.name)}</strong>
          <span>${account.type} ending ${account.last4} - ${escapeHtml(account.rail)}</span>
        </div>
        <span class="status-tag connected">Ready</span>
      </article>
    `).join("");
  }

  els.serviceGrid.innerHTML = state.services.map((service) => `
    <article class="service-card" data-status="${service.status}">
      <div class="service-head">
        <div>
          <h3>${escapeHtml(service.name)}</h3>
          <p>${escapeHtml(service.category)}</p>
        </div>
        <span class="status-tag ${service.status}">${capitalize(service.status)}</span>
      </div>
      <div class="service-meta">
        <span>${escapeHtml(service.scope)}</span>
        <span>Last sync: ${service.lastSync ? formatDate(new Date(service.lastSync)) : "Never"}</span>
        <span>Next sync: ${service.nextSync ? shortTime(new Date(service.nextSync)) : "Not scheduled"}</span>
      </div>
      <div class="service-actions">
        <button class="secondary-btn small" type="button" data-connect-service="${service.id}">
          <span aria-hidden="true">&lt;&gt;</span>
          <span>${service.status === "connected" ? "Refresh" : "Connect"}</span>
        </button>
        <button class="ghost-btn small" type="button" data-sync-service="${service.id}">
          <span aria-hidden="true">*</span>
          <span>Sync</span>
        </button>
      </div>
    </article>
  `).join("");

  if (!state.activity.length) {
    els.activityList.innerHTML = `<div class="empty-state">No activity yet.</div>`;
  } else {
    els.activityList.innerHTML = state.activity
      .slice()
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 8)
      .map((activity) => `
        <article class="activity-item">
          <span class="activity-icon" aria-hidden="true">*</span>
          <div>
            <strong>${escapeHtml(activity.title)}</strong>
            <span>${escapeHtml(activity.detail)} - ${shortTime(new Date(activity.at))}</span>
          </div>
        </article>
      `).join("");
  }
}

function renderPayments() {
  if (!state.payments.length) {
    els.paymentRows.innerHTML = `<tr><td colspan="6">No payments recorded.</td></tr>`;
    return;
  }

  els.paymentRows.innerHTML = state.payments
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((payment) => `
      <tr>
        <td>${formatDate(parseLocalDate(payment.date))}</td>
        <td>${escapeHtml(payment.billName)}</td>
        <td>${formatMoney(payment.amount)}</td>
        <td>${escapeHtml(payment.source)}</td>
        <td><span class="status-tag ${payment.status === "Paid" ? "paid" : "pending"}">${escapeHtml(payment.status)}</span></td>
        <td>${escapeHtml(payment.reference)}</td>
      </tr>
  `).join("");
}

function renderCaptureTools() {
  if (!els.captureSourceGrid || !els.captureInsights) return;

  const sources = state.captureSources || [];
  const connectedCount = sources.filter((source) => source.status === "connected").length;
  const rules = Object.values(state.captureRules || {});
  const learnedCount = rules.length;
  const lastScan = (state.emailScanHistory || []).slice(-1)[0];

  els.captureSourceGrid.innerHTML = sources.map((source) => `
    <article class="capture-source-card" data-status="${source.status}">
      <div>
        <span class="capture-source-type">${escapeHtml(source.category)}</span>
        <h3>${escapeHtml(source.name)}</h3>
        <p>${escapeHtml(source.scope)}</p>
      </div>
      <button class="${source.status === "connected" ? "ghost-btn" : "secondary-btn"} small" type="button" data-capture-source="${source.id}">
        <span aria-hidden="true">${source.status === "connected" ? "*" : "+"}</span>
        <span>${source.status === "connected" ? "Ready" : "Set up"}</span>
      </button>
    </article>
  `).join("");

  els.captureInsights.innerHTML = `
    <span>${connectedCount}/${sources.length} capture sources ready</span>
    <span>${learnedCount} learned biller rule${learnedCount === 1 ? "" : "s"}</span>
    <span>${lastScan ? `${lastScan.imported} imported from last scan` : "No imports yet"}</span>
  `;
}

function renderEmailScan() {
  if (!els.emailScanResults || !els.emailScanSummary) return;

  if (!emailScanCandidates.length) {
    els.emailScanSummary.textContent = "No scan yet";
    els.emailScanResults.innerHTML = `
      <div class="empty-state">
        Paste forwarded bill emails above, then tap Scan emails.
      </div>
    `;
    return;
  }

  const readyCount = emailScanCandidates.filter((item) => item.amount > 0 && item.dueDay).length;
  els.emailScanSummary.textContent = `${emailScanCandidates.length} found, ${readyCount} ready`;
  els.emailScanResults.innerHTML = emailScanCandidates.map((candidate) => {
    const match = getCandidateMatch(candidate);
    candidate.matchStatus = match.status;
    candidate.matchBillId = match.bill?.id || null;

    return `
      <article class="scan-card ${match.status}" data-scan-card="${candidate.id}">
        <div class="scan-card-head">
          <label class="check-row scan-check">
            <input type="checkbox" data-scan-select="${candidate.id}" checked>
            <span>Import</span>
          </label>
          <div class="scan-badges">
            <span class="status-tag ${match.tagClass}">${escapeHtml(match.label)}</span>
            <span class="status-tag ${candidate.confidence >= 80 ? "connected" : candidate.confidence >= 55 ? "pending" : "manual"}">
              ${candidate.confidence}% match
            </span>
          </div>
        </div>
        <div class="scan-edit-grid">
          <label class="field">
            <span>Biller</span>
            <input type="text" data-scan-name="${candidate.id}" value="${escapeHtml(candidate.name)}">
          </label>
          <label class="field">
            <span>Correct amount</span>
            <select data-scan-amount-choice="${candidate.id}">
              ${renderAmountChoiceOptions(candidate)}
            </select>
          </label>
          <label class="field">
            <span>Amount</span>
            <input type="number" min="0" step="0.01" data-scan-amount="${candidate.id}" value="${Number(candidate.amount || 0).toFixed(2)}">
          </label>
          <label class="field">
            <span>Due day</span>
            <input type="number" min="1" max="31" data-scan-due-day="${candidate.id}" value="${candidate.dueDay || 1}">
          </label>
          <label class="field">
            <span>Category</span>
            <select data-scan-category="${candidate.id}">
              ${Object.entries(categoryLabels).map(([value, label]) => `
                <option value="${value}" ${value === candidate.category ? "selected" : ""}>${label}</option>
              `).join("")}
            </select>
          </label>
          <label class="field">
            <span>Frequency</span>
            <select data-scan-frequency="${candidate.id}">
              ${["monthly", "quarterly", "annual", "one-time"].map((value) => `
                <option value="${value}" ${value === candidate.frequency ? "selected" : ""}>${capitalize(value)}</option>
              `).join("")}
            </select>
          </label>
        </div>
        <p class="scan-source">${escapeHtml(candidate.source)}</p>
        ${candidate.ruleApplied ? `<p class="scan-learned">Using learned rule: prefer ${escapeHtml(getAmountTypeLabel(candidate.selectedAmountType))} for ${escapeHtml(candidate.name)}.</p>` : ""}
        <p class="scan-snippet">${escapeHtml(candidate.snippet)}</p>
      </article>
    `;
  }).join("");
}

function renderAmountChoiceOptions(candidate) {
  const choices = candidate.amountChoices?.length ? candidate.amountChoices : [{
    value: candidate.amount || 0,
    type: candidate.selectedAmountType || "manual",
    label: "Detected amount",
    score: candidate.confidence || 0
  }];

  return choices.map((choice, index) => `
    <option value="${index}" ${index === Number(candidate.selectedAmountChoice || 0) ? "selected" : ""}>
      ${escapeHtml(amountChoiceLabel(choice))}
    </option>
  `).join("");
}

function amountChoiceLabel(choice) {
  const amount = formatMoney(choice.value || 0);
  const type = getAmountTypeLabel(choice.type);
  const label = String(choice.label || "").replace(/\s+/g, " ").slice(0, 48);
  return label ? `${type}: ${amount} - ${label}` : `${type}: ${amount}`;
}

function getAmountTypeLabel(type) {
  const labels = {
    minimum: "Minimum payment",
    amountDue: "Amount due",
    statementBalance: "Statement balance",
    subscription: "Subscription charge",
    autopay: "Autopay amount",
    purchase: "Purchase total",
    payment: "Payment amount",
    manual: "Manual amount",
    generic: "Possible amount"
  };
  return labels[type] || labels.generic;
}

function getCandidateMatch(candidate) {
  const exact = state.bills.find((bill) => normalizeBillerKey(bill.name) === normalizeBillerKey(candidate.name));
  if (exact && candidate.category !== "purchase") {
    return {
      status: "updates-existing",
      label: `Updates ${exact.name}`,
      tagClass: "connected",
      bill: exact
    };
  }

  const possible = state.bills.find((bill) => {
    const sameDue = Number(bill.dueDay) === Number(candidate.dueDay);
    const sameAmount = Math.abs(Number(bill.amount) - Number(candidate.amount || 0)) < 0.01;
    const relatedName = namesLookRelated(bill.name, candidate.name);
    return (sameDue && sameAmount) || (relatedName && (sameDue || sameAmount));
  });

  if (possible) {
    return {
      status: "possible-duplicate",
      label: `Possible duplicate`,
      tagClass: "pending",
      bill: possible
    };
  }

  return {
    status: "new-bill",
    label: "New bill",
    tagClass: "manual",
    bill: null
  };
}

function namesLookRelated(a, b) {
  const left = normalizeBillerKey(a);
  const right = normalizeBillerKey(b);
  if (!left || !right) return false;
  if (left.includes(right) || right.includes(left)) return true;
  const leftWords = new Set(left.split("-").filter((word) => word.length > 2));
  const rightWords = right.split("-").filter((word) => word.length > 2);
  return rightWords.some((word) => leftWords.has(word));
}

function scanEmailText(options = {}) {
  const text = els.emailPasteInput.value.trim();
  if (!text) {
    if (!options.silent) showToast("Paste one or more bill emails first.");
    return;
  }

  const discoverySource = getDiscoverySource();
  emailScanCandidates = parseBillingEmails(text, { discoverySource });
  renderEmailScan();
  updatePasteStatus(`${text.length.toLocaleString()} characters scanned`);

  if (!emailScanCandidates.length) {
    if (!options.silent) showToast("No bill details found. Try pasting the full email subject and body.");
    return;
  }

  if (!options.silent) showToast(`${emailScanCandidates.length} possible bill${emailScanCandidates.length === 1 ? "" : "s"} found.`);
}

function findSubscriptionsFromContact() {
  const source = getDiscoverySource();
  const text = els.emailPasteInput.value.trim();

  if (!source) {
    showToast("Add an email address or phone number first.");
    els.discoveryEmailInput.focus();
    return;
  }

  if (!text) {
    focusPasteBox();
    showToast("Paste copied email or text reminders, then BillPocket can search them.");
    return;
  }

  scanEmailText();
  const subscriptions = emailScanCandidates.filter((item) => item.category === "subscription").length;
  const bills = Math.max(0, emailScanCandidates.length - subscriptions);
  showToast(`Found ${subscriptions} subscription${subscriptions === 1 ? "" : "s"} and ${bills} bill${bills === 1 ? "" : "s"}.`);
}

function findPurchasesFromReceipts() {
  const text = els.emailPasteInput.value.trim();
  if (!text) {
    focusPasteBox();
    showToast("Paste Amazon or online order receipts first.");
    return;
  }

  scanEmailText();
  const purchases = emailScanCandidates.filter((item) => item.category === "purchase").length;
  showToast(`Found ${purchases} online purchase${purchases === 1 ? "" : "s"} to review.`);
}

function getDiscoverySource() {
  const email = els.discoveryEmailInput?.value.trim();
  const phone = els.discoveryPhoneInput?.value.trim();
  const parts = [];
  if (email) parts.push(`email ${email}`);
  if (phone) parts.push(`phone ${phone}`);
  return parts.join(" and ");
}

async function pasteFromClipboard() {
  if (!navigator.clipboard?.readText) {
    focusPasteBox();
    showToast("Clipboard button needs browser permission. Press and hold in the box, then Paste.");
    return;
  }

  try {
    const text = (await navigator.clipboard.readText()).trim();
    if (!text) {
      focusPasteBox();
      showToast("Clipboard is empty. Copy the email first.");
      return;
    }
    setEmailPasteText(text);
    scanEmailText();
  } catch {
    focusPasteBox();
    showToast("Tap Manual paste, then press and hold in the box to paste.");
  }
}

function connectCaptureSource(sourceId) {
  const source = state.captureSources?.find((item) => item.id === sourceId);
  if (!source) return;

  source.status = "connected";
  source.connectedAt = new Date().toISOString();
  addActivity(`${source.name} capture ready`, source.scope);
  saveState();
  renderCaptureTools();

  if (sourceId === "attachments") {
    els.emailFileInput?.click();
  } else if (sourceId === "bank-feed") {
    openBankModal();
  } else if (sourceId === "biller-directory") {
    showView("connections");
    showToast("Use Biller services to connect provider portals.");
  } else {
    focusPasteBox();
    showToast(`${source.name} capture is ready. Paste copied reminders to scan now.`);
  }
}

function openAttachmentPicker() {
  const source = state.captureSources?.find((item) => item.id === "attachments");
  if (source) {
    source.status = "connected";
    saveState();
    renderCaptureTools();
  }
  els.emailFileInput?.click();
}

async function importAttachmentFiles(files) {
  const list = [...files];
  if (!list.length) return;

  const textParts = [];
  const skipped = [];

  for (const file of list) {
    if (isReadableTextFile(file)) {
      textParts.push(`File: ${file.name}\n${await file.text()}`);
    } else {
      skipped.push(file.name);
    }
  }

  if (textParts.length) {
    const existingText = els.emailPasteInput.value.trim();
    setEmailPasteText([existingText, ...textParts].filter(Boolean).join("\n\n---\n\n"));
    scanEmailText({ silent: true });
  }

  if (skipped.length) {
    showToast("PDF/image OCR needs production setup. Copy text from the file and paste it here.");
  } else {
    showToast(`${textParts.length} file${textParts.length === 1 ? "" : "s"} added to scan.`);
  }

  els.emailFileInput.value = "";
}

function isReadableTextFile(file) {
  const name = file.name.toLowerCase();
  return file.type.startsWith("text/")
    || /\.(txt|eml|csv|ics|log)$/i.test(name)
    || file.type === "message/rfc822";
}

function setEmailPasteText(text) {
  els.emailPasteInput.value = text;
  updatePasteStatus(`${text.length.toLocaleString()} characters pasted`);
}

function focusPasteBox() {
  showView("email");
  els.emailPasteInput.focus();
  els.emailPasteInput.scrollIntoView({ behavior: "smooth", block: "center" });
  updatePasteStatus("Press and hold in the box, then Paste");
}

function scheduleEmailAutoScan() {
  window.clearTimeout(emailScanTimer);
  const length = els.emailPasteInput.value.trim().length;
  updatePasteStatus(length ? `${length.toLocaleString()} characters ready` : "Ready for copied email");
  emailScanTimer = window.setTimeout(() => {
    if (els.emailPasteInput.value.trim().length > 20) {
      scanEmailText({ silent: true });
    }
  }, 700);
}

function updatePasteStatus(message) {
  if (els.emailPasteStatus) {
    els.emailPasteStatus.textContent = message;
  }
}

function updateScanAmountFromChoice(candidateId, choiceIndex) {
  const candidate = emailScanCandidates.find((item) => item.id === candidateId);
  const choice = candidate?.amountChoices?.[Number(choiceIndex)];
  if (!candidate || !choice) return;

  candidate.amount = choice.value;
  candidate.selectedAmountChoice = Number(choiceIndex);
  candidate.selectedAmountType = choice.type || "generic";
  const amountInput = document.querySelector(`[data-scan-amount="${candidate.id}"]`);
  if (amountInput) {
    amountInput.value = Number(choice.value || 0).toFixed(2);
  }
  const card = document.querySelector(`[data-scan-card="${candidate.id}"]`);
  const match = getCandidateMatch(candidate);
  candidate.matchStatus = match.status;
  candidate.matchBillId = match.bill?.id || null;
  card?.classList.toggle("possible-duplicate", match.status === "possible-duplicate");
  card?.classList.toggle("updates-existing", match.status === "updates-existing");
  card?.classList.toggle("new-bill", match.status === "new-bill");
}

function parseBillingEmails(text, options = {}) {
  const blocks = splitEmailBlocks(text);
  const candidates = blocks
    .map((block) => extractBillCandidate(block, options))
    .filter(Boolean);
  const seen = new Set();

  return candidates.filter((candidate) => {
    const key = `${candidate.name.toLowerCase()}-${candidate.dueDay}-${Math.round(candidate.amount * 100)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function splitEmailBlocks(text) {
  const normalized = text.replace(/\r/g, "").replace(/\u00a0/g, " ");
  const pieces = normalized
    .split(/\n(?=(?:From|Subject|Date|Sent):\s)/i)
    .map((part) => part.trim())
    .filter((part) => part.length > 24);

  if (pieces.length > 1) return pieces;

  return normalized
    .split(/\n\s*-{3,}\s*\n|\n\s*_{3,}\s*\n/)
    .map((part) => part.trim())
    .filter((part) => part.length > 24);
}

function extractBillCandidate(block, options = {}) {
  const category = inferCategory(block);
  const date = findDueDate(block) || (category === "purchase" ? findPurchaseDate(block) : null);
  let amountResult = findAmount(block);
  const name = findBillerName(block);
  amountResult = applyCaptureRule(name, amountResult);

  if (!date && !amountResult.value) return null;

  const dueDate = date || new Date();
  const confidence = Math.min(96, 25 + (date ? 28 : 0) + Math.min(30, Math.round(amountResult.score / 3)) + (name !== "Unknown biller" ? 13 : 0));

  return {
    id: makeId("scan"),
    name,
    amount: amountResult.value || 0,
    dueDay: dueDate.getDate(),
    dueDate,
    category,
    frequency: inferFrequency(block, category),
    confidence,
    amountChoices: amountResult.choices || [],
    selectedAmountChoice: amountResult.selectedChoice || 0,
    selectedAmountType: amountResult.type || "generic",
    ruleApplied: Boolean(amountResult.ruleApplied),
    source: buildScanSource(block, date, amountResult, options.discoverySource, category),
    snippet: block.replace(/\s+/g, " ").slice(0, 220)
  };
}

function applyCaptureRule(name, amountResult) {
  const rule = getCaptureRule(name);
  const choices = amountResult.choices || [];
  if (!rule || !choices.length) return amountResult;

  const preferredIndex = choices.findIndex((choice) => choice.type === rule.preferredAmountType);
  if (preferredIndex < 0) return amountResult;

  const preferred = choices[preferredIndex];
  return {
    ...preferred,
    score: preferred.score + 40,
    choices,
    selectedChoice: preferredIndex,
    ruleApplied: true
  };
}

function getCaptureRule(name) {
  return state.captureRules?.[normalizeBillerKey(name)] || null;
}

function learnCaptureRule(name, details) {
  const key = normalizeBillerKey(name);
  if (!key) return;

  const previous = state.captureRules?.[key] || {};
  state.captureRules = {
    ...(state.captureRules || {}),
    [key]: {
      ...previous,
      billerName: name,
      preferredAmountType: details.preferredAmountType || previous.preferredAmountType || "generic",
      preferredCategory: details.preferredCategory || previous.preferredCategory || "other",
      preferredFrequency: details.preferredFrequency || previous.preferredFrequency || "monthly",
      lastAmount: details.lastAmount,
      lastDueDay: details.lastDueDay,
      lastLearnedAt: new Date().toISOString()
    }
  };
}

function findAmount(text) {
  const candidates = [];
  addMinimumPaymentCandidates(candidates, text);

  const labeledPatterns = [
    {
      pattern: /(?:total\s+amount\s+due|amount\s+due|total\s+due|payment\s+due|minimum\s+payment\s+due|minimum\s+amount\s+due|minimum\s+due|min\s+payment|min\s+due|minimum\s+payment|balance\s+due|current\s+amount\s+due|autopay\s+amount|auto\s+pay\s+amount|renewal\s+amount|subscription\s+amount|next\s+charge|next\s+payment|monthly\s+price|monthly\s+plan)[\s\S]{0,140}?\$?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/gi,
      score: 115
    },
    {
      pattern: /(?:order\s+total|grand\s+total|estimated\s+total|purchase\s+total|receipt\s+total|total\s+charged|charged\s+to|amount\s+charged|order\s+amount|your\s+total)[\s\S]{0,140}?\$?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/gi,
      score: 126,
      type: "purchase"
    },
    {
      pattern: /(?:new\s+balance|statement\s+balance|current\s+balance|current\s+charges|total\s+charges)[\s\S]{0,140}?\$?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/gi,
      score: 78,
      type: "statementBalance"
    },
    {
      pattern: /\$\s*([0-9][0-9,]*(?:\.[0-9]{2})?)\D{0,80}(?:is\s+due|will\s+be\s+due|due\s+on|due\s+by|pay\s+by|scheduled\s+for|will\s+be\s+drafted)/gi,
      score: 108
    },
    {
      pattern: /(?:bill|invoice|statement|rent|premium|loan\s+payment|mortgage\s+payment|subscription|membership|renewal|renews|charged|receipt|order|purchase)\D{0,80}\$?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/gi,
      score: 68
    }
  ];

  labeledPatterns.forEach(({ pattern, score, type }) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      addAmountCandidate(candidates, text, match.index, match[0], match[1], score, type);
    }
  });

  const fallbackPattern = /\$\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/g;
  let match;
  while ((match = fallbackPattern.exec(text)) !== null) {
    addAmountCandidate(candidates, text, match.index, match[0], match[1], 38);
  }

  candidates.sort((a, b) => b.score - a.score || a.index - b.index);
  const choices = buildAmountChoices(candidates);
  return choices[0] || { value: 0, score: 0, label: "No amount found", type: "generic", choices: [] };
}

function buildAmountChoices(candidates) {
  const seen = new Set();
  return candidates
    .filter((candidate) => Number.isFinite(candidate.value) && candidate.value > 0)
    .map((candidate) => ({
      ...candidate,
      type: candidate.type || inferAmountType(`${candidate.label || ""} ${candidate.context || ""}`)
    }))
    .filter((candidate) => {
      const key = `${candidate.type}-${Math.round(candidate.value * 100)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6)
    .map((candidate, index, list) => ({
      ...candidate,
      choices: list,
      selectedChoice: index
    }));
}

function addMinimumPaymentCandidates(candidates, text) {
  const labels = [
    "minimum payment due",
    "minimum amount due",
    "minimum payment",
    "minimum due",
    "min payment",
    "min due",
    "payment minimum"
  ];
  const normalized = text.replace(/\r/g, "\n");

  labels.forEach((label) => {
    const labelRegex = new RegExp(label.replace(/\s+/g, "\\s+"), "gi");
    let labelMatch;
    while ((labelMatch = labelRegex.exec(normalized)) !== null) {
      const start = Math.max(0, labelMatch.index - 80);
      const end = Math.min(normalized.length, labelMatch.index + 320);
      const windowText = normalized.slice(start, end);
      const moneyMatches = findMoneyMatches(windowText);

      moneyMatches.forEach((moneyMatch) => {
        const absoluteIndex = start + moneyMatch.index;
        const distance = Math.abs(absoluteIndex - labelMatch.index);
        const between = normalized
          .slice(Math.min(labelMatch.index, absoluteIndex), Math.max(labelMatch.index, absoluteIndex))
          .replace(/\s+/g, " ")
          .toLowerCase();
        const amountContext = normalized
          .slice(Math.max(0, absoluteIndex - 90), Math.min(normalized.length, absoluteIndex + moneyMatch.raw.length + 90))
          .replace(/\s+/g, " ")
          .trim();
        let score = 230 - Math.min(85, Math.round(distance / 3));

        if (absoluteIndex >= labelMatch.index) score += 25;
        if (between.length < 90) score += 25;
        if (/\b(due date|payment date|pay by|autopay|auto pay|scheduled|on|by)\b/.test(between)) score += 10;
        if (/\b(statement balance|new balance|previous balance|current balance|payment received|last payment|amount paid|credit|refund|fee)\b/.test(amountContext.toLowerCase())) score -= 65;
        if (/\b(statement balance|new balance|previous balance|current balance)\b/.test(between)) score -= 80;

        candidates.push({
          value: moneyMatch.value,
          score,
          index: absoluteIndex,
          type: "minimum",
          label: `${label}: ${moneyMatch.raw}`.replace(/\s+/g, " ").trim(),
          context: amountContext
        });
      });
    }
  });
}

function findMoneyMatches(text) {
  const matches = [];
  const pattern = /\$\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const value = Number(match[1].replaceAll(",", ""));
    if (Number.isFinite(value) && value > 0 && value < 100000) {
      matches.push({
        value,
        index: match.index,
        raw: match[0].replace(/\s+/g, " ")
      });
    }
  }

  return matches;
}

function addAmountCandidate(candidates, text, index, rawMatch, rawAmount, baseScore, typeOverride = "") {
  const value = Number(String(rawAmount).replaceAll(",", ""));
  if (!Number.isFinite(value) || value <= 0 || value >= 100000) return;
  const rawText = String(rawMatch || "").toLowerCase();
  const looksLikeDateNumber = !rawText.includes("$")
    && !String(rawAmount).includes(".")
    && value <= 31
    && /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|date|renews|renewal|on|by)\b/.test(rawText);
  if (looksLikeDateNumber) return;

  const contextStart = Math.max(0, index - 90);
  const contextEnd = Math.min(text.length, index + rawMatch.length + 90);
  const context = text.slice(contextStart, contextEnd).replace(/\s+/g, " ").trim();
  const lower = context.toLowerCase();
  let score = baseScore;

  if (/\b(amount due|total amount due|total due|payment due|minimum payment due|balance due|next charge|renewal amount)\b/.test(lower)) score += 35;
  if (/\b(order total|grand total|estimated total|purchase total|receipt total|total charged|charged to|amount charged|order amount)\b/.test(lower)) score += 36;
  if (/\b(due|pay by|autopay|auto pay|drafted|scheduled|renews|renewal|next billing|next payment|next charge)\b/.test(lower)) score += 16;
  if (/\b(order|receipt|purchase|amazon|walmart|target|etsy|paypal|shopify)\b/.test(lower)) score += 12;
  if (/\b(past due|overdue)\b/.test(lower)) score += 8;
  if (/\b(previous balance|last payment|payment received|thank you for your payment|paid on|amount paid|credit|refund|reward|cash back|available credit|credit limit|late fee|fee|tax|deposit)\b/.test(lower)) score -= 70;
  if (/\b(subtotal|shipping|sales tax|estimated tax|discount|promotion|gift card)\b/.test(lower)) score -= 24;
  if (/\b(if paid after|after the due date|late payment fee)\b/.test(lower)) score -= 35;
  if (value < 1) score -= 40;

  candidates.push({
    value,
    score,
    index,
    type: typeOverride || inferAmountType(`${rawText} ${context}`),
    label: rawMatch.replace(/\s+/g, " ").trim().slice(0, 120),
    context
  });
}

function inferAmountType(text) {
  const value = String(text || "").toLowerCase();
  if (/\b(minimum payment due|minimum amount due|minimum payment|minimum due|min payment|min due|payment minimum)\b/.test(value)) return "minimum";
  if (/\b(statement balance|new balance|current balance|previous balance)\b/.test(value)) return "statementBalance";
  if (/\b(autopay amount|auto pay amount|drafted|scheduled payment|automatic payment)\b/.test(value)) return "autopay";
  if (/\b(order total|grand total|estimated total|purchase total|receipt total|total charged|charged to|amount charged|order amount|amazon|walmart|target|etsy|paypal|shopify|online order|receipt|purchase)\b/.test(value)) return "purchase";
  if (/\b(next charge|subscription amount|monthly price|monthly plan|renewal amount|renews|membership|subscription)\b/.test(value)) return "subscription";
  if (/\b(total amount due|amount due|total due|payment due|balance due|current amount due)\b/.test(value)) return "amountDue";
  if (/\b(payment|rent|premium|loan payment|invoice|bill)\b/.test(value)) return "payment";
  return "generic";
}

function findDueDate(text) {
  const dateToken = "((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,?\\s+\\d{4})?|\\d{1,2}[/-]\\d{1,2}(?:[/-]\\d{2,4})?|\\d{4}-\\d{1,2}-\\d{1,2})";
  const patterns = [
    new RegExp(`(?:due date|payment due|amount due|due|pay by|autopay on|scheduled for|drafted on|renews on|renewal date|next billing date|next bill date|next payment date|next charge date|trial ends)\\D{0,46}${dateToken}`, "i"),
    new RegExp(`(?:by|on)\\s+${dateToken}`, "i")
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const date = parseDueDateText(match[1]);
    if (date) return date;
  }

  return null;
}

function findPurchaseDate(text) {
  const dateToken = "((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,?\\s+\\d{4})?|\\d{1,2}[/-]\\d{1,2}(?:[/-]\\d{2,4})?|\\d{4}-\\d{1,2}-\\d{1,2})";
  const patterns = [
    new RegExp(`(?:order date|ordered on|order placed|purchase date|purchased on|charged on|receipt date|delivered on|delivery date|arriving|arrives|shipped on)\\D{0,54}${dateToken}`, "i"),
    new RegExp(`(?:placed on|delivered|arrives by)\\s+${dateToken}`, "i")
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const date = parseDueDateText(match[1]);
    if (date) return date;
  }

  return null;
}

function parseDueDateText(value) {
  const cleaned = value
    .replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
  const today = new Date();
  const numeric = cleaned.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);
  let date;

  if (numeric) {
    const year = numeric[3] ? normalizeYear(Number(numeric[3])) : today.getFullYear();
    date = new Date(year, Number(numeric[1]) - 1, Number(numeric[2]));
  } else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(cleaned)) {
    const [year, month, day] = cleaned.split("-").map(Number);
    date = new Date(year, month - 1, day);
  } else {
    const hasYear = /\b\d{4}\b/.test(cleaned);
    date = new Date(hasYear ? cleaned : `${cleaned}, ${today.getFullYear()}`);
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  if (dayDiff(today, date) < -45) {
    date = new Date(date.getFullYear() + 1, date.getMonth(), date.getDate());
  }
  return date;
}

function normalizeYear(year) {
  if (year < 100) return year + 2000;
  return year;
}

function findBillerName(text) {
  const fromLine = text.match(/^from:\s*(.+)$/im)?.[1] || "";
  const subjectLine = text.match(/^subject:\s*(.+)$/im)?.[1] || "";
  const senderName = cleanBillerName(fromLine.replace(/<[^>]+>/g, ""));
  if (senderName && !/no.?reply|notification|billing|customer service/i.test(senderName)) {
    return senderName;
  }

  const subjectName = cleanBillerName(subjectLine);
  if (subjectName) return subjectName;

  const domain = fromLine.match(/@([a-z0-9.-]+\.[a-z]{2,})/i)?.[1];
  if (domain) {
    return cleanBillerName(domain.split(".")[0].replace(/[-_]/g, " "));
  }

  const firstUsefulLine = text
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 4 && !/^(from|to|date|sent|subject):/i.test(line));
  return cleanBillerName(firstUsefulLine || "") || "Unknown biller";
}

function cleanBillerName(value) {
  return String(value || "")
    .replace(/["']/g, "")
    .replace(/\b(your|monthly|new|current|online|automatic|autopay|auto pay|payment|bill|billing|invoice|statement|reminder|notice|notification|customer service|is ready|is available|ready|available|due|amount|order|receipt|purchase|confirmation)\b/gi, " ")
    .replace(/\$[0-9,]+(?:\.[0-9]{2})?/g, " ")
    .replace(/\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeBillerKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b(inc|llc|ltd|visa|mastercard|card|billing|payments|payment|statement|services|service|the)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferCategory(text) {
  const value = text.toLowerCase();
  if (/\b(amazon|amazon.com|walmart|target|etsy|paypal|shopify|online order|order confirmation|order placed|receipt|purchase total|order total|total charged)\b/.test(value)) return "purchase";
  if (/\b(mortgage|home loan|escrow|principal and interest)\b/.test(value)) return "mortgage";
  if (/\b(rent|lease|landlord|property|apartment)\b/.test(value)) return "rent";
  if (/\b(phone|wireless|mobile|cellular)\b/.test(value)) return "phone";
  if (/\b(electric|gas|water|utility|utilities|internet|cable|broadband)\b/.test(value)) return "utilities";
  if (/\b(loan|auto loan|student loan|principal|interest)\b/.test(value)) return "loan";
  if (/\b(insurance|premium|policy)\b/.test(value)) return "insurance";
  if (/\b(credit card|visa|mastercard|amex|minimum payment|statement balance)\b/.test(value)) return "credit";
  if (/\b(subscription|membership|streaming|netflix|spotify|hulu|apple|google storage|renewal)\b/.test(value)) return "subscription";
  if (/\b(doctor|hospital|clinic|medical|dental|vision|pharmacy|copay|co-pay)\b/.test(value)) return "medical";
  if (/\b(tax|irs|property tax|estimated tax)\b/.test(value)) return "tax";
  if (/\b(childcare|daycare|tuition|school fee)\b/.test(value)) return "childcare";
  return "other";
}

function inferFrequency(text, category = "") {
  const value = text.toLowerCase();
  if (category === "purchase") return "one-time";
  if (/\b(annual|yearly|per year|each year)\b/.test(value)) return "annual";
  if (/\b(quarterly|every quarter)\b/.test(value)) return "quarterly";
  if (/\b(one time|one-time|final payment|receipt|order placed|purchase)\b/.test(value)) return "one-time";
  return "monthly";
}

function buildScanSource(block, date, amountResult, discoverySource = "", category = "") {
  const found = [];
  if (discoverySource) found.push(`source ${discoverySource}`);
  if (date) found.push(`${category === "purchase" ? "date" : "due"} ${formatDate(date)}`);
  if (amountResult.value) found.push(`${formatMoney(amountResult.value)} ${getAmountTypeLabel(amountResult.type)} from "${amountResult.label}"`);
  return found.length ? `Found ${found.join(" and ")}` : "Review details";
}

function importScannedBills() {
  if (!emailScanCandidates.length) {
    showToast("Scan emails before importing.");
    return;
  }

  const selected = emailScanCandidates.filter((candidate) => {
    return document.querySelector(`[data-scan-select="${candidate.id}"]`)?.checked;
  });

  if (!selected.length) {
    showToast("Check at least one found bill to import.");
    return;
  }

  let imported = 0;
  let learned = 0;
  selected.forEach((candidate) => {
    const name = document.querySelector(`[data-scan-name="${candidate.id}"]`)?.value.trim() || candidate.name;
    const amount = Number(document.querySelector(`[data-scan-amount="${candidate.id}"]`)?.value || candidate.amount || 0);
    const dueDay = Math.min(31, Math.max(1, Number(document.querySelector(`[data-scan-due-day="${candidate.id}"]`)?.value || candidate.dueDay || 1)));
    const category = document.querySelector(`[data-scan-category="${candidate.id}"]`)?.value || candidate.category;
    const frequency = document.querySelector(`[data-scan-frequency="${candidate.id}"]`)?.value || candidate.frequency || "monthly";
    const selectedChoiceIndex = Number(document.querySelector(`[data-scan-amount-choice="${candidate.id}"]`)?.value || 0);
    const selectedChoice = candidate.amountChoices?.[selectedChoiceIndex];
    const selectedType = selectedChoice && Math.abs(Number(selectedChoice.value) - amount) < 0.01 ? selectedChoice.type : "manual";
    const existing = state.bills.find((bill) => {
      return (category !== "purchase" && normalizeBillerKey(bill.name) === normalizeBillerKey(name))
        || (category !== "purchase" && bill.id === candidate.matchBillId)
        || (bill.dueDay === dueDay && Math.abs(Number(bill.amount) - amount) < 0.01 && namesLookRelated(bill.name, name));
    });

    const bill = {
      id: existing?.id || makeId("bill"),
      name,
      category,
      amount,
      dueDay,
      frequency,
      provider: "manual",
      autopay: false,
      notes: `Imported from bill capture. ${candidate.source}`
    };

    if (frequency === "one-time") {
      const dueDate = candidate.dueDate instanceof Date ? candidate.dueDate : new Date();
      bill.oneTimeMonth = dueDate.getMonth();
      bill.oneTimeYear = dueDate.getFullYear();
    }

    if (existing) {
      Object.assign(existing, bill);
    } else {
      state.bills.push(bill);
    }
    learnCaptureRule(name, {
      preferredAmountType: selectedType,
      preferredCategory: category,
      preferredFrequency: frequency,
      lastAmount: amount,
      lastDueDay: dueDay
    });
    imported += 1;
    learned += 1;
  });

  state.emailScanHistory = [
    ...(state.emailScanHistory || []),
    {
      id: makeId("email-scan"),
      at: new Date().toISOString(),
      found: emailScanCandidates.length,
      imported,
      learned
    }
  ].slice(-20);
  emailScanCandidates = [];
  els.emailPasteInput.value = "";
  updatePasteStatus("Imported and cleared");
  addActivity("Bill capture imported", `${imported} bill${imported === 1 ? "" : "s"} added or updated, ${learned} rule${learned === 1 ? "" : "s"} learned`);
  saveState();
  render();
  showView("bills");
  showToast(`${imported} bill${imported === 1 ? "" : "s"} imported.`);
}

function clearEmailScan() {
  emailScanCandidates = [];
  els.emailPasteInput.value = "";
  updatePasteStatus("Ready for copied email");
  renderEmailScan();
  showToast("Email scan cleared.");
}

function fillSampleEmailText() {
  setEmailPasteText(`From: BrightGrid Billing <billing@brightgrid.example>
Subject: Your electric bill is ready

Your BrightGrid Electric bill of $148.64 is due July 14, 2026. Autopay is currently enabled.

From: RentNest Portal <notice@rentnest.example>
Subject: July rent reminder

Your rent payment of $1,625.00 is due on 07/01/2026. Pay by the due date to avoid late fees.

From: HomeKey Mortgage <servicing@homekey.example>
Subject: Your mortgage payment is due

Your monthly mortgage payment of $1,842.50 is due July 1, 2026. Escrow is included in this amount.

From: ClearCard <statement@clearcard.example>
Subject: Minimum payment due

Previous balance: $840.00
Payment received: $620.00
Your ClearCard Visa minimum payment due is $220.00. Payment due date: July 25, 2026.

From: SureLine Insurance <policy@sureline.example>
Subject: Your premium notice

Thank you for your last payment of $186.40. Your amount due for the next premium is $192.15 and will be drafted on July 9, 2026.

From: StreamWave <receipts@streamwave.example>
Subject: Your subscription renews soon

Your StreamWave monthly plan renews on July 28, 2026. Next charge: $19.99.

From: Amazon.com <shipment-tracking@amazon.example>
Subject: Your Amazon.com order confirmation

Order placed July 10, 2026.
Order total: $53.42 charged to Visa ending 4821.
Arriving July 14, 2026.

Text from 555-0100:
CloudSafe Storage renews on 08/03/2026. Monthly plan $9.99. Reply STOP to opt out.`);
  scanEmailText();
}

function capitalize(value) {
  return String(value || "").replace("-", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function shortTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function showView(viewName) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === `${viewName}View`);
  });
  document.querySelectorAll("[data-view]").forEach((button) => {
    const active = button.dataset.view === viewName;
    button.classList.toggle("active", active);
    if (button.classList.contains("nav-item")) {
      button.setAttribute("aria-current", active ? "page" : "false");
    }
  });
  const view = document.getElementById(`${viewName}View`);
  els.viewTitle.textContent = view?.dataset.title || "Today";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openBillModal(billId = null) {
  const modal = document.getElementById("billModal");
  const bill = billId ? state.bills.find((item) => item.id === billId) : null;
  document.getElementById("billModalTitle").textContent = bill ? "Edit bill" : "Add bill";
  document.getElementById("billIdInput").value = bill?.id || "";
  document.getElementById("billNameInput").value = bill?.name || "";
  document.getElementById("billCategoryInput").value = bill?.category || "utilities";
  document.getElementById("billAmountInput").value = bill?.amount || "";
  document.getElementById("billDueDayInput").value = bill?.dueDay || "";
  document.getElementById("billFrequencyInput").value = bill?.frequency || "monthly";
  document.getElementById("billProviderInput").value = bill?.provider || "manual";
  document.getElementById("billAutopayInput").checked = Boolean(bill?.autopay);
  document.getElementById("billNotesInput").value = bill?.notes || "";
  modal.showModal();
}

function openBankModal() {
  document.getElementById("bankModal").showModal();
}

function openPayModal(billId, dueDateValue) {
  if (!state.bankConnected || !state.accounts.length) {
    showToast("Connect a bank account before scheduling a payment.");
    openBankModal();
    return;
  }

  const bill = state.bills.find((item) => item.id === billId);
  if (!bill) return;

  const dueDate = resolveActionDueDate(bill, dueDateValue);
  document.getElementById("payModalTitle").textContent = `Pay ${bill.name}`;
  document.getElementById("payBillIdInput").value = bill.id;
  document.getElementById("payDueDateInput").value = toDateInputValue(dueDate);
  document.getElementById("paymentAmountInput").value = Number(bill.amount).toFixed(2);
  document.getElementById("paymentDateInput").value = toDateInputValue(new Date());
  document.getElementById("paymentSummary").innerHTML = `
    <strong>${escapeHtml(bill.name)} - ${formatMoney(bill.amount)}</strong>
    <span>Due ${formatDate(dueDate)} - ${categoryLabels[bill.category] || "Other"} - ${providerLabels[bill.provider] || "Manual"}</span>
  `;
  document.getElementById("paymentAccountInput").innerHTML = state.accounts.map((account) => `
    <option value="${account.id}">${escapeHtml(account.name)} ending ${account.last4}</option>
  `).join("");
  document.getElementById("payModal").showModal();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal?.open) {
    modal.close();
  }
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("visible");
  }, 2900);
}

function saveBillFromForm() {
  const id = document.getElementById("billIdInput").value || makeId("bill");
  const existingIndex = state.bills.findIndex((bill) => bill.id === id);
  const bill = {
    id,
    name: document.getElementById("billNameInput").value.trim(),
    category: document.getElementById("billCategoryInput").value,
    amount: Number(document.getElementById("billAmountInput").value),
    dueDay: Number(document.getElementById("billDueDayInput").value),
    frequency: document.getElementById("billFrequencyInput").value,
    provider: document.getElementById("billProviderInput").value,
    autopay: document.getElementById("billAutopayInput").checked,
    notes: document.getElementById("billNotesInput").value.trim()
  };

  if (bill.frequency === "one-time") {
    bill.oneTimeMonth = new Date().getMonth();
    bill.oneTimeYear = new Date().getFullYear();
  }

  if (existingIndex >= 0) {
    state.bills[existingIndex] = bill;
  } else {
    state.bills.push(bill);
  }

  addActivity(existingIndex >= 0 ? "Bill updated" : "Bill added", `${bill.name} is due on day ${bill.dueDay}`);
  saveState();
  render();
  closeModal("billModal");
  showToast(`${bill.name} saved.`);
}

function deleteBill(billId) {
  const bill = state.bills.find((item) => item.id === billId);
  if (!bill) return;

  const ok = window.confirm(`Remove ${bill.name} from your bill list? Payment history will stay in the log.`);
  if (!ok) return;

  state.bills = state.bills.filter((item) => item.id !== billId);
  addActivity("Bill removed", `${bill.name} removed from bill list`);
  saveState();
  render();
  showToast(`${bill.name} removed.`);
}

function resolveActionDueDate(bill, dueDateValue) {
  if (dueDateValue) {
    const parsed = dueDateValue instanceof Date ? dueDateValue : parseLocalDate(String(dueDateValue));
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return getNextDueDate(bill);
}

function markBillPaidForPeriod(billId, dueDateValue) {
  const bill = state.bills.find((item) => item.id === billId);
  if (!bill) return;

  const dueDate = resolveActionDueDate(bill, dueDateValue);
  const existing = getPaidRecordForPeriod(bill, dueDate);
  if (existing) {
    showToast(`${bill.name} is already marked paid for this period.`);
    return;
  }

  const periodKey = getPeriodKey(dueDate);
  state.payments.push({
    id: makeId("pay"),
    date: toDateInputValue(new Date()),
    billId: bill.id,
    billName: bill.name,
    amount: Number(bill.amount),
    source: "Marked paid",
    method: "Manual",
    status: "Paid",
    reference: `PAID-${periodKey.replaceAll("-", "")}`,
    periodKey,
    manualMark: true
  });

  addActivity("Bill marked paid", `${bill.name} marked paid for ${formatDate(dueDate)}`);
  saveState();
  render();
  showToast(`${bill.name} marked paid for this period.`);
}

function unmarkBillPaidForPeriod(billId, dueDateValue) {
  const bill = state.bills.find((item) => item.id === billId);
  if (!bill) return;

  const dueDate = resolveActionDueDate(bill, dueDateValue);
  const periodKey = getPeriodKey(dueDate);
  const before = state.payments.length;
  state.payments = state.payments.filter((payment) => {
    return !(payment.billId === bill.id
      && payment.periodKey === periodKey
      && payment.status === "Paid"
      && payment.manualMark);
  });

  if (state.payments.length === before) {
    showToast("Only manually marked paid entries can be undone here.");
    return;
  }

  addActivity("Paid mark removed", `${bill.name} reopened for ${formatDate(dueDate)}`);
  saveState();
  render();
  showToast(`${bill.name} reopened for this period.`);
}

function connectBank(provider) {
  const providerName = provider === "stripe" ? "Stripe Financial Connections" : provider === "plaid" ? "Plaid Link" : "Manual test account";
  state.bankConnected = true;
  state.selectedProvider = providerName;
  state.accounts = [
    {
      id: "acct-checking",
      name: "Everyday Checking",
      type: "Checking",
      last4: "4821",
      rail: provider === "manual" ? "Test ACH" : "Verified ACH"
    },
    {
      id: "acct-savings",
      name: "Reserve Savings",
      type: "Savings",
      last4: "9180",
      rail: "ACH transfer"
    }
  ];
  addActivity("Bank connected", `${providerName} linked two payment accounts`);
  saveState();
  render();
  showToast("Bank account linked for payment scheduling.");
}

function schedulePaymentFromForm() {
  const bill = state.bills.find((item) => item.id === document.getElementById("payBillIdInput").value);
  const account = state.accounts.find((item) => item.id === document.getElementById("paymentAccountInput").value);
  if (!bill || !account) return;
  const dueDate = resolveActionDueDate(bill, document.getElementById("payDueDateInput").value);

  const payment = {
    id: makeId("pay"),
    date: document.getElementById("paymentDateInput").value,
    billId: bill.id,
    billName: bill.name,
    amount: Number(document.getElementById("paymentAmountInput").value),
    source: `${account.name} ${account.last4}`,
    method: document.getElementById("paymentMethodInput").value,
    status: "Scheduled",
    reference: `BF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    periodKey: getPeriodKey(dueDate)
  };

  state.payments.push(payment);
  addActivity("Payment scheduled", `${bill.name} scheduled for ${formatMoney(payment.amount)}`);
  saveState();
  render();
  closeModal("payModal");
  showToast(`${bill.name} payment scheduled.`);
}

function addActivity(title, detail) {
  state.activity.unshift({
    id: makeId("act"),
    at: new Date().toISOString(),
    title,
    detail
  });
  state.activity = state.activity.slice(0, 30);
}

function connectService(serviceId) {
  const service = state.services.find((item) => item.id === serviceId);
  if (!service) return;
  service.status = "connected";
  service.lastSync = new Date().toISOString();
  service.nextSync = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  addActivity(`${service.name} connected`, `${service.category} connector authorized`);
  saveState();
  render();
  showToast(`${service.name} connected.`);
}

function syncService(serviceId) {
  const service = state.services.find((item) => item.id === serviceId);
  if (!service) return;
  service.status = "connected";
  service.lastSync = new Date().toISOString();
  service.nextSync = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const bill = state.bills.find((item) => item.provider === serviceId);
  if (bill) {
    const shift = Math.random() > 0.62 ? 1 : 0;
    bill.amount = Number((Number(bill.amount) + shift).toFixed(2));
  }

  addActivity(`${service.name} synced`, `${service.scope} refreshed`);
  saveState();
  render();
  showToast(`${service.name} synced.`);
}

function syncAllServices() {
  state.services.forEach((service) => {
    if (service.status !== "manual") {
      service.status = "connected";
      service.lastSync = new Date().toISOString();
      service.nextSync = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }
  });
  addActivity("All services synced", "Connected billers refreshed due dates and balances");
  saveState();
  render();
  showToast("Connected services synced.");
}

function saveSnapshot() {
  const forecast = getForecast(6);
  const total = forecast.reduce((sum, month) => sum + month.total, 0);
  const snapshot = {
    id: makeId("snap"),
    createdAt: new Date().toISOString(),
    months: 6,
    total,
    average: total / 6
  };
  state.snapshots.push(snapshot);
  addActivity("Forecast snapshot saved", `${formatMoney(snapshot.average)} average monthly bills`);
  saveState();
  render();
  showToast("Budget forecast snapshot saved.");
}

function saveBudgetSettings() {
  state.settings.monthlyIncome = Number(els.incomeInput.value || 0);
  state.settings.reserveTarget = Number(els.reserveInput.value || 0);
  state.settings.includeAutopay = els.includeAutopayInput.checked;
  addActivity("Budget settings saved", `${formatMoney(state.settings.monthlyIncome)} monthly income target`);
  saveState();
  render();
  showToast("Budget settings saved.");
}

function exportCsv(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportBudget() {
  const rows = [
    ["Month", "Bills", "After bills", "Reserve gap"],
    ...getForecast(12).map((item) => [
      formatMonth(item.month),
      item.total.toFixed(2),
      item.afterBills.toFixed(2),
      item.reserveGap.toFixed(2)
    ])
  ];
  exportCsv("billflow-budget-forecast.csv", rows);
}

function exportPayments() {
  const rows = [
    ["Date", "Biller", "Amount", "Source", "Method", "Status", "Reference"],
    ...state.payments.map((payment) => [
      payment.date,
      payment.billName,
      Number(payment.amount).toFixed(2),
      payment.source,
      payment.method,
      payment.status,
      payment.reference
    ])
  ];
  exportCsv("billflow-payment-log.csv", rows);
}

function renderDataBackupStatus() {
  if (!els.dataBackupStatus) return;
  els.dataBackupStatus.textContent = `${state.bills.length} bills, ${state.payments.length} payments`;
}

function exportJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildDataBackup() {
  return {
    app: "BillPocket",
    version: 1,
    exportedAt: new Date().toISOString(),
    state
  };
}

function exportDataBackup() {
  addActivity("Backup exported", "Local BillPocket data downloaded");
  saveState();
  exportJson(`billpocket-backup-${toDateInputValue(new Date())}.json`, buildDataBackup());
  renderDataBackupStatus();
  showToast("Backup file downloaded.");
}

function getBackupState(payload) {
  if (!payload || typeof payload !== "object") return null;
  const source = payload.state || payload.data || payload;
  if (!source || typeof source !== "object") return null;
  const hasBillPocketData = Array.isArray(source.bills)
    || Array.isArray(source.payments)
    || Array.isArray(source.services)
    || source.settings;
  return hasBillPocketData ? source : null;
}

async function importDataBackup(files) {
  const [file] = [...(files || [])];
  if (!file) return;

  try {
    const payload = JSON.parse(await file.text());
    const backupState = getBackupState(payload);
    if (!backupState) {
      showToast("That file does not look like a BillPocket backup.");
      return;
    }

    const ok = window.confirm("Import this backup and replace the BillPocket data on this device?");
    if (!ok) return;

    state = hydrateState(backupState);
    addActivity("Backup imported", `${file.name} restored on this device`);
    saveState();
    render();
    showToast("Backup imported.");
  } catch {
    showToast("Could not read that backup file.");
  } finally {
    els.restoreDataInput.value = "";
  }
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  document.getElementById("prevMonthBtn").addEventListener("click", () => {
    displayDate = addMonths(displayDate, -1);
    renderCalendar();
  });

  document.getElementById("nextMonthBtn").addEventListener("click", () => {
    displayDate = addMonths(displayDate, 1);
    renderCalendar();
  });

  document.getElementById("addBillBtn").addEventListener("click", () => openBillModal());
  els.quickPayBtn.addEventListener("click", () => {
    const billId = els.quickPayBtn.dataset.nextBill;
    if (billId) openPayModal(billId, els.quickPayBtn.dataset.nextDueDate);
  });
  els.quickMarkPaidBtn.addEventListener("click", () => {
    const billId = els.quickMarkPaidBtn.dataset.nextBill;
    if (billId) markBillPaidForPeriod(billId, els.quickMarkPaidBtn.dataset.nextDueDate);
  });
  document.getElementById("connectBankBtn").addEventListener("click", openBankModal);
  document.getElementById("bankConnectPanelBtn").addEventListener("click", openBankModal);
  document.getElementById("snapshotBtn").addEventListener("click", saveSnapshot);
  document.getElementById("syncDueDatesBtn").addEventListener("click", syncAllServices);
  document.getElementById("syncAllBtn").addEventListener("click", syncAllServices);
  document.getElementById("saveBudgetSettingsBtn").addEventListener("click", saveBudgetSettings);
  document.getElementById("exportBudgetBtn").addEventListener("click", exportBudget);
  document.getElementById("exportPaymentsBtn").addEventListener("click", exportPayments);
  document.getElementById("exportDataBtn").addEventListener("click", exportDataBackup);
  document.getElementById("importDataBtn").addEventListener("click", () => els.restoreDataInput.click());
  els.restoreDataInput.addEventListener("change", (event) => importDataBackup(event.target.files));
  document.getElementById("pasteClipboardBtn").addEventListener("click", pasteFromClipboard);
  document.getElementById("findSubscriptionsBtn").addEventListener("click", findSubscriptionsFromContact);
  document.getElementById("findPurchasesBtn").addEventListener("click", findPurchasesFromReceipts);
  document.getElementById("focusPasteBtn").addEventListener("click", focusPasteBox);
  document.getElementById("attachmentImportBtn").addEventListener("click", openAttachmentPicker);
  els.emailFileInput.addEventListener("change", (event) => importAttachmentFiles(event.target.files));
  document.getElementById("scanEmailsBtn").addEventListener("click", scanEmailText);
  document.getElementById("importScannedBillsBtn").addEventListener("click", importScannedBills);
  document.getElementById("clearEmailScanBtn").addEventListener("click", clearEmailScan);
  document.getElementById("sampleEmailBtn").addEventListener("click", fillSampleEmailText);
  els.emailPasteInput.addEventListener("input", scheduleEmailAutoScan);
  els.emailPasteInput.addEventListener("paste", () => {
    updatePasteStatus("Pasting...");
    window.setTimeout(scheduleEmailAutoScan, 120);
  });
  document.getElementById("clearActivityBtn").addEventListener("click", () => {
    state.activity = [];
    saveState();
    renderConnections();
    showToast("Activity cleared.");
  });

  els.billSearchInput.addEventListener("input", renderBills);
  els.categoryFilter.addEventListener("change", renderBills);

  billForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveBillFromForm();
  });

  bankForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const provider = new FormData(bankForm).get("bankProvider");
    closeModal("bankModal");
    connectBank(provider);
  });

  payForm.addEventListener("submit", (event) => {
    event.preventDefault();
    schedulePaymentFromForm();
  });

  document.body.addEventListener("click", (event) => {
    const closeButton = event.target.closest("[data-close-modal]");
    if (closeButton) {
      closeModal(closeButton.dataset.closeModal);
      return;
    }

    const payButton = event.target.closest("[data-pay-bill]");
    if (payButton) {
      openPayModal(payButton.dataset.payBill, payButton.dataset.dueDate);
      return;
    }

    const editButton = event.target.closest("[data-edit-bill]");
    if (editButton) {
      openBillModal(editButton.dataset.editBill);
      return;
    }

    const autopayButton = event.target.closest("[data-toggle-autopay]");
    if (autopayButton) {
      const bill = state.bills.find((item) => item.id === autopayButton.dataset.toggleAutopay);
      if (bill) {
        bill.autopay = !bill.autopay;
        addActivity("Autopay changed", `${bill.name} autopay is ${bill.autopay ? "on" : "off"}`);
        saveState();
        render();
      }
      return;
    }

    const markPaidButton = event.target.closest("[data-mark-bill-paid]");
    if (markPaidButton) {
      markBillPaidForPeriod(markPaidButton.dataset.markBillPaid, markPaidButton.dataset.dueDate);
      return;
    }

    const unmarkPaidButton = event.target.closest("[data-unmark-bill-paid]");
    if (unmarkPaidButton) {
      unmarkBillPaidForPeriod(unmarkPaidButton.dataset.unmarkBillPaid, unmarkPaidButton.dataset.dueDate);
      return;
    }

    const deleteButton = event.target.closest("[data-delete-bill]");
    if (deleteButton) {
      deleteBill(deleteButton.dataset.deleteBill);
      return;
    }

    const captureSourceButton = event.target.closest("[data-capture-source]");
    if (captureSourceButton) {
      connectCaptureSource(captureSourceButton.dataset.captureSource);
      return;
    }

    const connectButton = event.target.closest("[data-connect-service]");
    if (connectButton) {
      connectService(connectButton.dataset.connectService);
      return;
    }

    const syncButton = event.target.closest("[data-sync-service]");
    if (syncButton) {
      syncService(syncButton.dataset.syncService);
    }
  });

  document.body.addEventListener("change", (event) => {
    const amountChoice = event.target.closest("[data-scan-amount-choice]");
    if (amountChoice) {
      updateScanAmountFromChoice(amountChoice.dataset.scanAmountChoice, amountChoice.value);
    }
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    els.installBtn.hidden = false;
  });

  els.installBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    els.installBtn.hidden = true;
  });
}

function init() {
  els.todayLabel.textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(new Date());

  bindEvents();
  render();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

init();
