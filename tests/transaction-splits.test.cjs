const { test } = require("node:test");
const assert = require("node:assert/strict");
const Splits = require("../outputs/bill-calendar-pwa/transaction-splits.js");
const CsvImport = require("../outputs/bill-calendar-pwa/csv-import.js");

const original = { id: "txn-shop", date: "2026-09-20", description: "Mixed purchase", amountCents: -12345, category: "Shopping", account: "Checking" };
const portions = [{ category: "Groceries", amountCents: -10000 }, { category: "Household", amountCents: -2345 }];

test("split amounts balance exactly in integer cents, including one-cent differences", () => {
  assert.deepEqual(Splits.validate(-12345, portions).errors, []);
  assert.ok(Splits.validate(-12344, portions).errors.length);
  assert.deepEqual(Splits.validate(-30, [{ category: "A", amountCents: -10 }, { category: "B", amountCents: -20 }]).errors, []);
});

test("refund and mixed-direction splits preserve the signed original total", () => {
  for (const parts of [portions.map(p => ({...p, amountCents: -p.amountCents})),
    [{category: "Expense", amountCents: -500}, {category: "Refund", amountCents: 1000}]]) {
    const amount = parts.reduce((sum, p) => sum + p.amountCents, 0);
    assert.deepEqual(Splits.validate(amount, parts).errors, []);
  }
});

test("invalid child shapes, blank categories, zero, fractional and coerced amounts are rejected", () => {
  for (const bad of [null, [], {category:"",amountCents:-10000}, {category:" ",amountCents:-10000},
    {category:"A",amountCents:0}, {category:"A",amountCents:"-10000"}, {category:"A",amountCents:1.1},
    {category:"A",amountCents:NaN}, {category:"A",amountCents:Infinity}, {category:"A",amountCents:100000000001},
    {category:"A",amountCents:-10000,splits:[]}, {category:"A",amountCents:-10000,date:"2026-01-01"}]) {
    assert.ok(Splits.validate(-12345, [bad, portions[1]]).errors.length);
  }
  for (const parts of [null, {}, [], portions.slice(0,1), Array(51).fill(portions[0])]) assert.ok(Splits.validate(-12345, parts).errors.length);
});

test("only children count for a split parent and metadata is inherited without mutating records", () => {
  const split = {...original, splits:portions};
  const second = {...original, id:"txn-second", amountCents:500};
  const before = JSON.stringify([split,second]);
  const entries = Splits.entries([split,second]);
  assert.equal(entries.length,3);
  assert.equal(entries.reduce((sum,p)=>sum+p.amountCents,0),-11845);
  assert.equal(entries[0].parentId,original.id);
  for (const key of ["date","description","account"]) assert.equal(entries[0][key], original[key]);
  assert.equal(entries.some(p=>p.id===original.id),false);
  assert.equal(JSON.stringify([split,second]),before);
});

test("accounting CSV exports exclude the parent and include refunds and child categories", () => {
  const rows = Splits.csvRows([{...original,splits:portions}]);
  assert.equal(rows.length,3);
  assert.deepEqual(rows.map(r=>r[2]),["Amount","-100.00","-23.45"]);
  assert.deepEqual(rows.map(r=>r[3]),["Category","Groceries","Household"]);
});

test("reimporting original bank rows matches split parents without changing their children", () => {
  const split = {...original,splits:portions};
  const normalized = [{transaction:{...original,id:undefined}}];
  const plan = CsvImport.prepareImport(normalized,[split]);
  assert.equal(plan.duplicates,1);
  assert.equal(plan.accepted.length,0);
  assert.deepEqual(split.splits,portions);
});

test("split validation accepts old records and rejects corrupt split backups", () => {
  assert.equal(Splits.isValidTransaction(original),true);
  assert.equal(Splits.isValidTransaction({...original,splits:portions}),true);
  for (const splits of [null,[],"bad",[...portions,{category:"extra",amountCents:1}]]) assert.equal(Splits.isValidTransaction({...original,splits}),false);
});
