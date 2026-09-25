let csvDraft = null;
let csvReadSequence = 0;
let transactionLimit = 50;
let splitDraft = null;

function renderTransactions() {
  const transactions = state.transactions || [];
  const ordered = transactions.slice().sort((a, b) => b.date.localeCompare(a.date));
  const total = TransactionSplits.entries(transactions).reduce((sum, item) => sum + item.amountCents, 0);
  document.getElementById("transactionSummary").textContent = `${transactions.length} transactions - Net ${formatMoney(total / 100)}`;
  document.getElementById("transactionRows").innerHTML = ordered.slice(0, transactionLimit).map((item) => `
    <tr>
      <td data-label="Date">${escapeHtml(item.date)}</td>
      <td data-label="Description" class="history-biller">${escapeHtml(item.description)}</td>
      <td data-label="${item.splits ? "Split total" : "Amount"}">${formatMoney(item.amountCents / 100)}</td>
      <td data-label="Category">${item.splits ? `<details class="transaction-portions"><summary>${item.splits.length} categories</summary><ul>${item.splits.map((part) => `<li><span>${escapeHtml(part.category)}</span><strong>${formatMoney(part.amountCents / 100)}</strong></li>`).join("")}</ul></details>` : escapeHtml(item.category)}</td>
      <td data-label="Account">${escapeHtml(item.account || "Not specified")}</td>
      <td data-label="Actions"><button class="secondary-btn small" type="button" data-split-transaction="${escapeHtml(item.id)}" aria-label="${item.splits ? "Edit split for" : "Split"} ${escapeHtml(item.description)}">${item.splits ? "Edit split" : "Split"}</button></td>
    </tr>`).join("") || '<tr class="history-empty"><td colspan="6">No transactions imported.</td></tr>';
  document.getElementById("moreTransactionsBtn").hidden = ordered.length <= transactionLimit;
  document.getElementById("exportTransactionsBtn").disabled = !transactions.length;
}

function openTransactionSplit(id) {
  const original = state.transactions.find((item) => item.id === id);
  if (!original) return;
  splitDraft = {
    original: structuredClone(original),
    parts: (original.splits || [{ category: original.category, amountCents: original.amountCents }, { category: "", amountCents: 0 }])
      .map((part) => ({ category: part.category, amount: (Math.abs(part.amountCents) / 100).toFixed(2), direction: (part.amountCents || original.amountCents) < 0 ? "out" : "in" }))
  };
  document.getElementById("splitTransactionName").textContent = `${original.description} - ${original.date}`;
  document.getElementById("splitOriginalTotal").textContent = formatMoney(original.amountCents / 100);
  document.getElementById("removeTransactionSplitBtn").hidden = !original.splits;
  const categories = new Set([...Object.values(categoryLabels), ...TransactionSplits.entries(state.transactions).map((item) => item.category)]);
  document.getElementById("splitCategories").innerHTML = [...categories].sort().map((category) => `<option value="${escapeHtml(category)}"></option>`).join("");
  renderSplitRows();
  document.getElementById("splitModal").showModal();
}

function renderSplitRows() {
  if (!splitDraft) return;
  document.getElementById("splitRows").innerHTML = splitDraft.parts.map((part, index) => `<div class="split-row">
    <label class="field"><span>Category ${index + 1}</span><input list="splitCategories" data-split-category="${index}" value="${escapeHtml(part.category)}" autocomplete="off"></label>
    <label class="field"><span>Amount ${index + 1}</span><input type="text" inputmode="decimal" data-split-amount="${index}" value="${escapeHtml(part.amount)}" autocomplete="off"></label>
    <label class="field split-direction"><span>Direction ${index + 1}</span><select data-split-direction="${index}"><option value="out" ${part.direction === "out" ? "selected" : ""}>Money out</option><option value="in" ${part.direction === "in" ? "selected" : ""}>Money in</option></select></label>
    <button class="icon-btn" type="button" data-remove-portion="${index}" aria-label="Remove portion ${index + 1}" title="Remove portion ${index + 1}" ${splitDraft.parts.length <= 2 ? "disabled" : ""}><span aria-hidden="true">x</span></button>
  </div>`).join("");
  document.getElementById("addSplitPortionBtn").disabled = splitDraft.parts.length >= TransactionSplits.MAX_PARTS;
  renderSplitReview();
}

function getSplitReview() {
  const parts = splitDraft.parts.map((part) => {
    const amount = CsvImport.money(part.amount);
    return { category: part.category.trim(), amountCents: amount === null ? null : Math.abs(amount) * (part.direction === "out" ? -1 : 1) };
  });
  return { parts, ...TransactionSplits.validate(splitDraft.original.amountCents, parts) };
}

function renderSplitReview() {
  if (!splitDraft) return;
  const result = getSplitReview();
  const remaining = splitDraft.original.amountCents - result.totalCents;
  document.getElementById("splitAllocatedTotal").textContent = formatMoney(result.totalCents / 100);
  document.getElementById("splitRemainingTotal").textContent = formatMoney(remaining / 100);
  document.getElementById("splitStatus").textContent = result.errors.join(" ") || "Balanced";
  document.getElementById("saveTransactionSplitBtn").disabled = result.errors.length > 0;
}

function persistTransactionReplacement(original, replacement) {
  if (unreadableStorage) throw new Error("Restore a valid backup before editing transactions.");
  const current = state.transactions.find((item) => item.id === original.id);
  if (JSON.stringify(current) !== JSON.stringify(original)) throw new Error("This transaction changed. Cancel and reopen it before saving.");
  if (!TransactionSplits.isValidTransaction(replacement)) throw new Error("The split is invalid. Review the category amounts.");
  const nextState = { ...state, transactions: state.transactions.map((item) => item.id === original.id ? structuredClone(replacement) : item) };
  if (!persistState(nextState)) throw new Error("Saved data changed in another tab. Cancel and load the latest data first.");
  state = nextState;
  renderTransactions();
  renderDataBackupStatus();
}

function commitTransactionSplit(remove = false) {
  if (!splitDraft) return false;
  const original = splitDraft.original;
  const { splits, ...unsplit } = original;
  let replacement = unsplit;
  if (!remove) {
    const review = getSplitReview();
    if (review.errors.length) { renderSplitReview(); return false; }
    replacement = { ...original, splits: review.parts };
  }
  try {
    persistTransactionReplacement(original, replacement);
    closeModal("splitModal");
    splitDraft = null;
    showToast(remove ? "Original category restored." : "Transaction split saved.", () => {
      try {
        persistTransactionReplacement(replacement, original);
        showToast("Split change undone.");
      } catch (error) { showToast(error.message || "Could not undo. Saved data was kept."); }
    });
    return true;
  } catch (error) {
    document.getElementById("splitStatus").textContent = error.name === "QuotaExceededError"
      ? "Device storage is full. No changes were saved. Keep this editor open and try again."
      : error.message || "Could not save. No changes were made.";
    return false;
  }
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
  document.getElementById("transactionRows").addEventListener("click", (event) => {
    const button = event.target.closest("[data-split-transaction]");
    if (button) openTransactionSplit(button.dataset.splitTransaction);
  });
  document.getElementById("splitModal").addEventListener("close", () => { splitDraft = null; });
  document.getElementById("splitRows").addEventListener("input", (event) => {
    if (!splitDraft) return;
    const { splitCategory, splitAmount, splitDirection } = event.target.dataset;
    if (splitCategory !== undefined) splitDraft.parts[Number(splitCategory)].category = event.target.value;
    if (splitAmount !== undefined) splitDraft.parts[Number(splitAmount)].amount = event.target.value;
    if (splitDirection !== undefined) splitDraft.parts[Number(splitDirection)].direction = event.target.value;
    renderSplitReview();
  });
  document.getElementById("splitRows").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-portion]");
    if (!button || !splitDraft || splitDraft.parts.length <= 2) return;
    const index = Number(button.dataset.removePortion);
    splitDraft.parts.splice(index, 1);
    renderSplitRows();
    document.querySelector(`[data-split-category="${Math.min(index, splitDraft.parts.length - 1)}"]`).focus();
  });
  document.getElementById("addSplitPortionBtn").addEventListener("click", () => {
    if (!splitDraft || splitDraft.parts.length >= TransactionSplits.MAX_PARTS) return;
    const remaining = splitDraft.original.amountCents - getSplitReview().totalCents;
    splitDraft.parts.push({ category: "", amount: (Math.abs(remaining) / 100).toFixed(2), direction: (remaining || splitDraft.original.amountCents) < 0 ? "out" : "in" });
    renderSplitRows();
    document.querySelector(`[data-split-category="${splitDraft.parts.length - 1}"]`).focus();
  });
  document.getElementById("saveTransactionSplitBtn").addEventListener("click", () => commitTransactionSplit());
  document.getElementById("removeTransactionSplitBtn").addEventListener("click", () => commitTransactionSplit(true));
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
    exportCsv("billpocket-transactions.csv", TransactionSplits.csvRows(state.transactions || []));
  });
}
