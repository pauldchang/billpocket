let csvDraft = null;
let csvReadSequence = 0;
let transactionLimit = 50;

function renderTransactions() {
  const transactions = state.transactions || [];
  const ordered = transactions.slice().sort((a, b) => b.date.localeCompare(a.date));
  const total = transactions.reduce((sum, item) => sum + item.amountCents, 0);
  document.getElementById("transactionSummary").textContent = `${transactions.length} transactions - Net ${formatMoney(total / 100)}`;
  document.getElementById("transactionRows").innerHTML = ordered.slice(0, transactionLimit).map((item) => `
    <tr>
      <td data-label="Date">${escapeHtml(item.date)}</td>
      <td data-label="Description" class="history-biller">${escapeHtml(item.description)}</td>
      <td data-label="Amount">${formatMoney(item.amountCents / 100)}</td>
      <td data-label="Category">${escapeHtml(item.category)}</td>
      <td data-label="Account">${escapeHtml(item.account || "Not specified")}</td>
    </tr>`).join("") || '<tr class="history-empty"><td colspan="5">No transactions imported.</td></tr>';
  document.getElementById("moreTransactionsBtn").hidden = ordered.length <= transactionLimit;
  document.getElementById("exportTransactionsBtn").disabled = !transactions.length;
}

async function openCsvFile(file) {
  if (!file) return;
  const sequence = ++csvReadSequence;
  csvDraft = null;
  const modal = document.getElementById("csvModal");
  document.getElementById("csvFileName").textContent = file.name;
  document.getElementById("csvImportStatus").textContent = "Reading CSV...";
  document.getElementById("csvMapping").innerHTML = "";
  document.getElementById("csvErrors").innerHTML = "";
  document.getElementById("csvPreview").innerHTML = "";
  document.getElementById("csvRawPreview").innerHTML = "";
  document.getElementById("confirmCsvImportBtn").disabled = true;
  document.getElementById("csvSkipDuplicates").checked = true;
  if (!modal.open) modal.showModal();
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error("Choose a CSV smaller than 5 MB.");
    const text = await file.text();
    if (sequence !== csvReadSequence) return;
    const parsed = CsvImport.read(text);
    csvDraft = { parsed, mapping: parsed.mapping, skipDuplicates: true };
    renderCsvMapping();
    renderCsvReview();
  } catch (error) {
    if (sequence === csvReadSequence) document.getElementById("csvImportStatus").textContent = error.message || "CSV could not be read.";
  } finally {
    document.getElementById("transactionCsvInput").value = "";
  }
}

function renderCsvMapping() {
  if (!csvDraft) return;
  const { parsed, mapping } = csvDraft;
  const columns = (field, label, optional = false) => `<label class="field">
    <span>${label}${optional ? " (optional)" : ""}</span>
    <select data-csv-map="${field}">
      <option value="-1">${optional ? "Not mapped" : "Choose column"}</option>
      ${parsed.headers.map((name, index) => `<option value="${index}" ${mapping[field] === index ? "selected" : ""}>${index + 1}: ${escapeHtml(name || "Unnamed column")}</option>`).join("")}
    </select></label>`;
  document.getElementById("csvMapping").innerHTML = `
    ${columns("date", "Date")}${columns("description", "Description")}
    <label class="field"><span>Amount layout</span><select data-csv-setting="mode">
      <option value="amount" ${mapping.mode === "amount" ? "selected" : ""}>One Amount column</option>
      <option value="debit-credit" ${mapping.mode === "debit-credit" ? "selected" : ""}>Debit and Credit columns</option>
    </select></label>
    <label class="field"><span>Numeric date format</span><select data-csv-setting="dateFormat">
      <option value="mdy" ${mapping.dateFormat === "mdy" ? "selected" : ""}>Month / day / year</option>
      <option value="dmy" ${mapping.dateFormat === "dmy" ? "selected" : ""}>Day / month / year</option>
    </select></label>
    ${mapping.mode === "amount" ? `${columns("amount", "Amount")}
      <label class="field"><span>Positive amounts mean</span><select data-csv-setting="positive">
        <option value="in" ${mapping.positive === "in" ? "selected" : ""}>Money in</option>
        <option value="out" ${mapping.positive === "out" ? "selected" : ""}>Money out</option>
      </select></label>` : `${columns("debit", "Debit (money out)")}${columns("credit", "Credit (money in)")}`}
    ${columns("category", "Category", true)}${columns("account", "Account", true)}`;
  document.getElementById("csvRawPreview").innerHTML = `<table><thead><tr><th>Row</th>${parsed.headers.map((name, index) => `<th>${index + 1}: ${escapeHtml(name || "Unnamed")}</th>`).join("")}</tr></thead><tbody>
    ${parsed.rows.slice(0, 5).map((row) => `<tr><td>${row.rowNumber}</td>${row.cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function renderCsvReview() {
  if (!csvDraft) return;
  const result = CsvImport.normalize(csvDraft.parsed, csvDraft.mapping);
  const plan = CsvImport.prepareImport(result.rows.filter((row) => !row.errors.length), state.transactions || [], csvDraft.skipDuplicates);
  const valid = !result.mappingErrors.length && !result.errors.length && plan.accepted.length > 0;
  document.getElementById("confirmCsvImportBtn").disabled = !valid;
  document.getElementById("csvImportStatus").textContent = result.mappingErrors.length ? "Map the required columns."
    : result.errors.length ? `${result.errors.length} issues. No transactions will be imported until all rows are valid.`
      : `${plan.accepted.length} ready to import. ${plan.duplicates} matching saved transactions skipped.`;
  document.getElementById("csvErrors").innerHTML = [...result.mappingErrors.map((message) => `<li>${escapeHtml(message)}</li>`),
    ...result.errors.map((error) => `<li><strong>Row ${error.rowNumber}:</strong> ${escapeHtml(error.message)}</li>`)].join("");
  document.getElementById("csvPreview").innerHTML = result.rows.length ? `<table><thead><tr><th>Row</th><th>Date</th><th>Description</th><th>Amount</th><th>Category</th><th>Account</th></tr></thead><tbody>
    ${result.rows.slice(0, 5).map(({ rowNumber, transaction: item, errors }) => `<tr class="${errors.length ? "csv-invalid-row" : ""}">
      <td>${rowNumber}</td><td>${escapeHtml(item.date || "Invalid date")}</td><td>${escapeHtml(item.description || "Blank description")}</td>
      <td>${Number.isSafeInteger(item.amountCents) ? formatMoney(item.amountCents / 100) : "Invalid amount"}</td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.account)}</td>
    </tr>`).join("")}</tbody></table>` : "";
}

function commitCsvImport() {
  if (!csvDraft) return false;
  const result = CsvImport.normalize(csvDraft.parsed, csvDraft.mapping);
  if (result.mappingErrors.length || result.errors.length) { renderCsvReview(); return false; }
  const plan = CsvImport.prepareImport(result.rows, state.transactions || [], csvDraft.skipDuplicates);
  if (!plan.accepted.length) { renderCsvReview(); return false; }
  try {
    if (unreadableStorage) throw new Error("Restore a valid backup before importing transactions.");
    const nextState = { ...state, transactions: [...(state.transactions || []), ...plan.accepted.map((item) => ({ ...item, id: makeId("txn") }))] };
    if (!persistState(nextState)) {
      document.getElementById("csvImportStatus").textContent = "Import paused: saved data changed in another tab. Cancel and load the latest data first.";
      return false;
    }
    state = nextState;
    closeModal("csvModal");
    csvDraft = null;
    transactionLimit = 50;
    renderTransactions();
    renderDataBackupStatus();
    showToast(`${plan.accepted.length} transactions imported. ${plan.duplicates} matching records skipped.`);
    return true;
  } catch (error) {
    document.getElementById("csvImportStatus").textContent = unreadableStorage ? error.message : "Import could not be saved. No transactions were added. Keep this preview open and try again.";
    return false;
  }
}

function initTransactions() {
  document.getElementById("importTransactionsBtn").addEventListener("click", () => document.getElementById("transactionCsvInput").click());
  document.getElementById("transactionCsvInput").addEventListener("change", (event) => openCsvFile(event.target.files[0]));
  document.getElementById("confirmCsvImportBtn").addEventListener("click", commitCsvImport);
  document.getElementById("csvModal").addEventListener("close", () => { csvDraft = null; csvReadSequence++; });
  document.getElementById("csvMapping").addEventListener("change", (event) => {
    if (!csvDraft) return;
    if (event.target.dataset.csvMap) csvDraft.mapping[event.target.dataset.csvMap] = Number(event.target.value);
    if (event.target.dataset.csvSetting) {
      csvDraft.mapping[event.target.dataset.csvSetting] = event.target.value;
      if (event.target.dataset.csvSetting === "mode") renderCsvMapping();
    }
    renderCsvReview();
  });
  document.getElementById("csvSkipDuplicates").addEventListener("change", (event) => {
    if (csvDraft) { csvDraft.skipDuplicates = event.target.checked; renderCsvReview(); }
  });
  document.getElementById("moreTransactionsBtn").addEventListener("click", () => { transactionLimit += 50; renderTransactions(); });
  document.getElementById("exportTransactionsBtn").addEventListener("click", () => {
    exportCsv("billpocket-transactions.csv", [["Date", "Description", "Amount", "Category", "Account"],
      ...(state.transactions || []).map((item) => [item.date, item.description, (item.amountCents / 100).toFixed(2), item.category, item.account])]);
  });
}
