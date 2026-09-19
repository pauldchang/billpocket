(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./vendor/papaparse.min.js"));
  else root.CsvImport = factory(root.Papa);
})(typeof globalThis !== "undefined" ? globalThis : this, function (Papa) {
  "use strict";

  const MAX_ROWS = 10000;
  const aliases = {
    date: ["date", "transactiondate", "posteddate", "postingdate", "bookingdate", "recordeddate"],
    description: ["description", "transactiondescription", "merchant", "payee", "biller", "details", "memo"],
    amount: ["amount", "transactionamount", "netamount", "total"],
    debit: ["debit", "debits", "debitamount", "withdrawal", "withdrawals", "moneyout"],
    credit: ["credit", "credits", "creditamount", "deposit", "deposits", "moneyin"],
    category: ["category", "transactioncategory"],
    account: ["account", "accountname", "accountnumber"]
  };
  const clean = (value) => String(value ?? "").trim();
  const headerKey = (value) => clean(value).toLowerCase().replace(/[^a-z0-9]/g, "");

  function read(text) {
    if (typeof text !== "string" || !text.trim()) throw new Error("The CSV is empty.");
    if (text.length > 5 * 1024 * 1024) throw new Error("Choose a CSV smaller than 5 MB.");
    text = text.replace(/^\uFEFF/, "");
    const records = [];
    let cursor = 0;
    let line = 1;
    let tooMany = false;
    Papa.parse(text, {
      header: false,
      skipEmptyLines: false,
      dynamicTyping: false,
      delimitersToGuess: [",", "\t", ";", "|"],
      step(result, parser) {
        const rowNumber = line;
        line += (text.slice(cursor, result.meta.cursor).match(/\r\n|\r|\n/g) || []).length;
        cursor = result.meta.cursor;
        if (result.data.every((cell) => !clean(cell))) return;
        records.push({ rowNumber, cells: result.data, errors: result.errors.filter((error) => error.code !== "UndetectableDelimiter") });
        if (records.length > MAX_ROWS + 1) { tooMany = true; parser.abort(); }
      }
    });
    if (tooMany) throw new Error(`A CSV can contain at most ${MAX_ROWS.toLocaleString()} transactions.`);
    const header = records.shift();
    if (!header || !records.length) throw new Error("The CSV needs a header row and at least one transaction.");
    if (header.errors.length) throw new Error(`Row ${header.rowNumber}: invalid CSV header quotes.`);
    if (header.cells.length > 100) throw new Error("A CSV can contain at most 100 columns.");
    const headers = header.cells.map(clean);
    return { headers, rows: records, mapping: detectMapping(headers) };
  }

  function detectMapping(headers) {
    const keys = headers.map(headerKey);
    const mapping = {};
    for (const [field, names] of Object.entries(aliases)) {
      const candidates = keys.map((key, index) => names.includes(key) ? index : -1).filter((index) => index >= 0);
      mapping[field] = candidates.length === 1 ? candidates[0] : -1;
    }
    mapping.mode = mapping.amount >= 0 ? "amount" : mapping.debit >= 0 && mapping.credit >= 0 ? "debit-credit" : "amount";
    mapping.dateFormat = "mdy";
    mapping.positive = "in";
    return mapping;
  }

  function money(value) {
    let text = clean(value).replace(/\u00a0/g, " ");
    if (!text) return null;
    let sign = 1;
    if (/^\(.*\)$/.test(text)) {
      sign = -1;
      text = text.slice(1, -1).trim();
      if (/[+-]/.test(text)) return null;
    } else {
      const prefix = text.match(/^([+-])\s*/);
      if (prefix) { sign = prefix[1] === "-" ? -1 : 1; text = text.slice(prefix[0].length); }
      else if (/^\$\s*[+-]/.test(text)) {
        const match = text.match(/^\$\s*([+-])\s*/);
        sign = match[1] === "-" ? -1 : 1;
        text = `$${text.slice(match[0].length)}`;
      }
    }
    text = text.replace(/^\$\s*/, "");
    if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text)) return null;
    const [whole, fraction = ""] = text.replaceAll(",", "").split(".");
    const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    return Number.isSafeInteger(cents) && cents <= 100000000000 ? sign * cents : null;
  }

  function makeDate(year, month, day) {
    if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function date(value, format = "mdy") {
    const text = clean(value);
    let match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (match) return makeDate(Number(match[1]), Number(match[2]), Number(match[3]));
    match = text.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4}|\d{2})$/);
    if (match) {
      let year = Number(match[3]);
      if (match[3].length === 2) year += year < 70 ? 2000 : 1900;
      return makeDate(year, Number(match[format === "dmy" ? 2 : 1]), Number(match[format === "dmy" ? 1 : 2]));
    }
    match = text.match(/^([a-z]+)\s+(\d{1,2}),?\s+(\d{4})$/i);
    if (!match) return null;
    const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    const month = months.findIndex((name) => name === match[1].toLowerCase() || name.slice(0, 3) === match[1].toLowerCase());
    return makeDate(Number(match[3]), month + 1, Number(match[2]));
  }

  function mappingErrors(headers, mapping) {
    if (!["amount", "debit-credit"].includes(mapping.mode)) return ["Choose an amount layout."];
    const required = ["date", "description", ...(mapping.mode === "amount" ? ["amount"] : ["debit", "credit"])];
    const fields = [...required, "category", "account"];
    const errors = [];
    const used = new Set();
    for (const field of fields) {
      const index = mapping[field];
      if (index === -1 && !required.includes(field)) continue;
      if (!Number.isInteger(index) || index < 0 || index >= headers.length) { errors.push(`Choose ${["amount", "account"].includes(field) ? "an" : "a"} ${field} column.`); continue; }
      if (used.has(index)) errors.push(`Column ${index + 1} is mapped more than once.`);
      used.add(index);
    }
    return errors;
  }

  function normalize(parsed, mapping) {
    const issues = mappingErrors(parsed.headers, mapping);
    if (issues.length) return { mappingErrors: issues, rows: [], errors: [] };
    const rows = [];
    const errors = [];
    for (const record of parsed.rows) {
      const rowErrors = [];
      const get = (field) => clean(record.cells[mapping[field]]);
      if (record.errors.length) rowErrors.push("Malformed CSV quotes.");
      if (record.cells.length !== parsed.headers.length) rowErrors.push(`Expected ${parsed.headers.length} columns; found ${record.cells.length}.`);
      const normalizedDate = date(get("date"), mapping.dateFormat);
      if (!normalizedDate) rowErrors.push(`Invalid date: ${get("date") || "blank"}.`);
      const description = get("description");
      if (!description) rowErrors.push("Description is blank.");
      let amountCents;
      if (mapping.mode === "amount") {
        amountCents = money(get("amount"));
        if (amountCents === null) rowErrors.push(`Invalid amount: ${get("amount") || "blank"}.`);
        else if (mapping.positive === "out") amountCents *= -1;
      } else {
        const debitText = get("debit"), creditText = get("credit");
        const debit = debitText ? money(debitText) : 0;
        const credit = creditText ? money(creditText) : 0;
        if (debit === null) rowErrors.push(`Invalid debit: ${debitText}.`);
        if (credit === null) rowErrors.push(`Invalid credit: ${creditText}.`);
        if (!debitText && !creditText) rowErrors.push("Debit and credit are both blank.");
        if (debit !== null && credit !== null) {
          if (debit !== 0 && credit !== 0) rowErrors.push("Debit and credit both contain an amount.");
          amountCents = Math.abs(credit) - Math.abs(debit);
        }
      }
      const transaction = { date: normalizedDate, description, amountCents,
        category: mapping.category >= 0 ? get("category") || "Uncategorized" : "Uncategorized",
        account: mapping.account >= 0 ? get("account") : "" };
      rows.push({ rowNumber: record.rowNumber, transaction, errors: rowErrors });
      for (const message of rowErrors) errors.push({ rowNumber: record.rowNumber, message });
    }
    return { mappingErrors: [], rows, errors };
  }

  function fingerprint(transaction) {
    const key = (value) => clean(value).toLowerCase().replace(/\s+/g, " ");
    return JSON.stringify([transaction.date, key(transaction.description), transaction.amountCents, key(transaction.account)]);
  }

  function prepareImport(rows, existing, skipDuplicates = true) {
    const counts = new Map();
    if (skipDuplicates) for (const transaction of existing) {
      const key = fingerprint(transaction);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const accepted = [];
    let duplicates = 0;
    for (const row of rows) {
      const key = fingerprint(row.transaction);
      if ((counts.get(key) || 0) > 0) { counts.set(key, counts.get(key) - 1); duplicates++; }
      else accepted.push(row.transaction);
    }
    return { accepted, duplicates };
  }

  function isValidTransaction(value) {
    return value && typeof value === "object" && typeof value.date === "string" && date(value.date) === value.date
      && typeof value.description === "string" && value.description.trim().length > 0
      && Number.isSafeInteger(value.amountCents) && Math.abs(value.amountCents) <= 100000000000
      && typeof value.category === "string" && typeof value.account === "string";
  }

  return { read, detectMapping, money, date, normalize, mappingErrors, prepareImport, fingerprint, isValidTransaction };
});
