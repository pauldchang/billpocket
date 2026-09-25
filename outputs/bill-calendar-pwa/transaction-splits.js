(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./csv-import.js"));
  else root.TransactionSplits = factory(root.CsvImport);
})(typeof globalThis !== "undefined" ? globalThis : this, function (CsvImport) {
  "use strict";

  const MAX_PARTS = 50;

  function validate(amountCents, parts) {
    const errors = [];
    if (!Array.isArray(parts) || parts.length < 2 || parts.length > MAX_PARTS) {
      return { errors: [`Choose between 2 and ${MAX_PARTS} portions.`], totalCents: 0 };
    }
    let totalCents = 0;
    parts.forEach((part, index) => {
      if (!part || typeof part !== "object" || Array.isArray(part)) {
        errors.push(`Portion ${index + 1}: invalid portion.`);
        return;
      }
      if (typeof part.category !== "string" || !part.category.trim()) errors.push(`Portion ${index + 1}: choose a category.`);
      if (!Number.isSafeInteger(part.amountCents) || Math.abs(part.amountCents) > 100000000000 || part.amountCents === 0) {
        errors.push(`Portion ${index + 1}: enter a nonzero amount with at most two decimal places.`);
      } else totalCents += part.amountCents;
      if (Object.keys(part).some((key) => !["category", "amountCents"].includes(key))) errors.push(`Portion ${index + 1}: only category and amount are supported.`);
    });
    if (!Number.isSafeInteger(amountCents) || totalCents !== amountCents) errors.push("Portion amounts must equal the original total exactly.");
    return { errors, totalCents };
  }

  function isValidTransaction(item) {
    return CsvImport.isValidTransaction(item)
      && (item.splits === undefined || !validate(item.amountCents, item.splits).errors.length);
  }

  // Children inherit source metadata; the source parent is never an accounting entry.
  function entries(transactions) {
    return transactions.flatMap((item) => {
      const { splits, ...original } = item;
      return splits ? splits.map((part, index) => ({ ...original, ...part, parentId: item.id, id: `${item.id}:split:${index}` })) : [original];
    });
  }

  function csvRows(transactions) {
    return [["Date", "Description", "Amount", "Category", "Account"], ...entries(transactions).map((item) =>
      [item.date, item.description, (item.amountCents / 100).toFixed(2), item.category, item.account])];
  }

  return { MAX_PARTS, validate, isValidTransaction, entries, csvRows };
});
