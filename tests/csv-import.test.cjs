const { test } = require('node:test');
const assert = require('node:assert/strict');
const csv = require('../outputs/bill-calendar-pwa/csv-import.js');
const Papa = require('../outputs/bill-calendar-pwa/vendor/papaparse.min.js');
const parse = (text, mapping = {}) => {
  const parsed = csv.read(text);
  return csv.normalize(parsed, { ...parsed.mapping, ...mapping });
};

test('standard Date Description Amount files need no manual mapping', () => {
  const result = parse('Date,Description,Amount\n2026-09-17,Groceries,-52.45\n09/18/2026,Salary,2500');
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.mappingErrors, []);
  assert.equal(result.rows[0].transaction.amountCents, -5245);
  assert.equal(result.rows[1].transaction.date, '2026-09-18');
});

test('unfamiliar names block import until manually mapped', () => {
  const text = 'When,What,Value,Pocket,Group\n17/09/2026,Book shop,"($1,234.56)",Everyday,Books';
  assert.ok(parse(text).mappingErrors.length);
  const result = parse(text, { date:0, description:1, amount:2, account:3, category:4, dateFormat:'dmy' });
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.rows[0].transaction, { date:'2026-09-17', description:'Book shop', amountCents:-123456, category:'Books', account:'Everyday' });
});

test('all 120 column orders auto-map to the same transactions', () => {
  const values = { Date:'2026-09-17', Description:'A shop', Amount:'-$25.10', Category:'Shopping', Account:'Checking' };
  const permutations = (items) => items.length ? items.flatMap((item, index) => permutations(items.filter((_, i) => i !== index)).map((rest) => [item, ...rest])) : [[]];
  for (const fields of permutations(Object.keys(values))) {
    const result = parse(Papa.unparse([fields, fields.map((field) => values[field])]));
    assert.deepEqual(result.mappingErrors, []);
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.rows[0].transaction, {date:'2026-09-17', description:'A shop', amountCents:-2510, category:'Shopping', account:'Checking'});
  }
});

test('separate debit and credit columns allow one blank side and signed magnitudes', () => {
  const result = parse('Credit,Description,Date,Debit\n,Groceries,09/17/2026,52.45\n100,Refund,09/18/2026,\n,Fee,09/19/2026,(10.50)\n-20,Credit reversal,09/20/2026,0');
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.rows.map((row) => row.transaction.amountCents), [-5245,10000,-1050,2000]);
});

test('both debit/credit columns are required and both nonzero sides are rejected', () => {
  assert.ok(parse('Date,Description,Debit\n2026-09-17,A,50', {mode:'debit-credit'}).mappingErrors.length);
  const result = parse('Date,Description,Debit,Credit\n2026-09-17,A,50,20\n2026-09-18,B,,\n2026-09-19,C,abc,0');
  assert.deepEqual(result.errors.map((error) => error.rowNumber), [2,3,4]);
});

test('currency parser handles cents exactly with dollar signs grouping signs parentheses and zero', () => {
  for (const [text, cents] of [['$1,234.56',123456], ['-$1,234.56',-123456], ['$-25.00',-2500], ['($1,234.56)',-123456],
    ['( 25.1 )',-2510], [' +$25 ',2500], ['0',0], ['$0.00',0], ['12.5',1250], ['  $ 14.20 ',1420]]) {
    assert.equal(csv.money(text), cents, text);
  }
  for (const text of ['', ' ', '12oops', '1,23.45', '1.234', '1e3', 'Infinity', '--2', '(-2)', '€10', 'NaN', '9007199254740992', '1000000000.01']) {
    assert.equal(csv.money(text), null, text);
  }
});

test('invalid amounts and dates report affected source rows before import', () => {
  const result = parse('Date,Description,Amount\n2026-02-30,Wrong date,10\nnot a date,Two errors,nope\n2026-09-17,Missing amount,\n2026-09-18,,0');
  assert.deepEqual(result.errors.map((error) => error.rowNumber), [2,3,3,4,5]);
  assert.match(result.errors[0].message, /Invalid date/);
  assert.match(result.errors[2].message, /Invalid amount/);
});

test('dates are explicit calendar dates without rollover or timezone conversion', () => {
  for (const [value, result] of [['2024-02-29','2024-02-29'], ['2026/09/17','2026-09-17'], ['9/17/26','2026-09-17'],
    ['September 17, 2026','2026-09-17'], ['Sep 17 2026','2026-09-17']]) assert.equal(csv.date(value), result);
  for (const value of ['2026-02-29','02/30/2026','2026-13-01','00/10/2026','9/17','2026-09-17T23:00:00Z','Septober 17 2026']) assert.equal(csv.date(value), null);
  assert.equal(csv.date('04/05/2026','mdy'),'2026-04-05');
  assert.equal(csv.date('04/05/2026','dmy'),'2026-05-04');
});

test('blank lines BOM CRLF embedded newlines and quoted commas preserve physical row numbers', () => {
  const result = parse('\uFEFFDate,Description,Amount\r\n2026-09-17,"Shop, Inc.\r\nDowntown",-20\r\n\r\n2026-02-30,Bad,abc\r\n');
  assert.deepEqual(result.rows.map((row) => row.rowNumber), [2,5]);
  assert.deepEqual(result.errors.map((error) => error.rowNumber), [5,5]);
  assert.equal(result.rows[0].transaction.description,'Shop, Inc.\r\nDowntown');
});

test('malformed CSV and inconsistent column counts cannot silently shift data', () => {
  const result = parse('Date,Description,Amount\n2026-09-17,Shop,$1,234.56\n2026-09-18,"Unclosed,10');
  assert.ok(result.errors.some((error) => error.rowNumber === 2 && /columns/.test(error.message)));
  assert.ok(result.errors.some((error) => error.rowNumber === 3 && /quotes/.test(error.message)));
});

test('ambiguous duplicate headers require mapping by position and one column cannot be reused', () => {
  const parsed = csv.read('Date,Description,Amount,Amount\n2026-09-17,Shop,10,20');
  assert.equal(parsed.mapping.amount,-1);
  assert.ok(csv.normalize(parsed, parsed.mapping).mappingErrors.length);
  assert.equal(csv.normalize(parsed, {...parsed.mapping, amount:3}).rows[0].transaction.amountCents,2000);
  assert.match(csv.normalize(parsed,{...parsed.mapping,amount:2,description:2}).mappingErrors.join(' '), /more than once/);
});

test('positive-out convention reverses signed amounts including refunds', () => {
  const result = parse('Date,Description,Amount\n2026-09-17,Expense,25\n2026-09-18,Refund,-10', {positive:'out'});
  assert.deepEqual(result.rows.map((row) => row.transaction.amountCents),[-2500,1000]);
});

test('common header aliases and optional blank columns are recognized', () => {
  const result = parse('Posted Date,Payee,Withdrawal,Deposit,Account Name,Transaction Category\n09/17/2026,Shop,10,,,');
  assert.deepEqual(result.mappingErrors,[]);
  assert.deepEqual(result.errors,[]);
  assert.equal(result.rows[0].transaction.category,'Uncategorized');
  assert.equal(result.rows[0].transaction.account,'');
});

test('semicolon and tab-separated exports retain quoted currencies', () => {
  for (const delimiter of [';', '\t']) {
    const result = parse(Papa.unparse([['Date','Description','Amount'],['2026-09-17','A shop','$1,234.56']], {delimiter}));
    assert.deepEqual(result.errors,[]);
    assert.equal(result.rows[0].transaction.amountCents,123456);
  }
});

test('duplicate detection preserves same-file multiplicity and recognizes repeated imports', () => {
  const result = parse('Date,Description,Amount,Account\n2026-09-17,Coffee,-5,A\n2026-09-17,Coffee,-5,A\n2026-09-17,Coffee,-5,B');
  const first = csv.prepareImport(result.rows,[]);
  assert.equal(first.accepted.length,3);
  const second = csv.prepareImport(result.rows,first.accepted);
  assert.equal(second.accepted.length,0);
  assert.equal(second.duplicates,3);
  assert.equal(csv.prepareImport(result.rows,[first.accepted[0]]).accepted.length,2);
  assert.equal(csv.prepareImport(result.rows,first.accepted,false).accepted.length,3);
});

test('empty header-only and excessively large CSVs fail safely', () => {
  for (const text of ['', 'Date,Description,Amount\n', 'x'.repeat(5*1024*1024+1),
    'Date,Description,Amount\n' + '2026-09-17,A,1\n'.repeat(10001)]) assert.throws(() => csv.read(text));
});
