// node tools/engine_test.js: runs the autopilot on the sample files and checks the books add up
const E = require('../engine.js');
const assert = require('assert');
const asOf = '2026-10-24';
const r = E.run({ files: E.sample(asOf), asOf });
assert(r.ok, 'run ok');
assert(r.balanced, 'debits = credits');
r.journal.forEach((e) => assert(Math.abs(e.lines.reduce((s, l) => s + l.dr - l.cr, 0)) < 0.005, 'entry balanced ' + e.ref));
assert.strictEqual(Math.round((r.tb[1010] - (r.balance.closing - r.balance.opening)) * 100), 0, 'bank account = statement change');
assert(r.balance.ok, 'running balance ok');
const types = r.review.map((x) => x.type).sort().join(',');
assert.strictEqual(types, 'deposit,duplicate,outlier,partial,unknown', types);
assert.deepStrictEqual(r.bank.find((x) => x.amount === 5748.75).invoices, ['B-1043', 'B-1045'], 'one payment, two invoices');
assert.deepStrictEqual(r.bank.find((x) => x.amount === 3449.25).invoices, ['B-1041']);
// parsing edge cases
assert.strictEqual(E.num('1 234,56 $'), 1234.56); assert.strictEqual(E.num('1,234.56'), 1234.56); assert.strictEqual(E.num('(12.00)'), -12);
assert.strictEqual(E.num('1,234'), 1234); assert.strictEqual(E.num('12,5'), 12.5);
assert.strictEqual(E.isoDate('03/09/2026'), '2026-09-03'); assert.strictEqual(E.isoDate('9/30/26'), '2026-09-30');
// decisions + memory: teach it the unknown vendor, re-run, it is gone and a lookalike gets sorted too
const u = r.review.find((x) => x.type === 'unknown');
const r2 = E.run({ files: E.sample(asOf), asOf, decisions: { [u.id]: { account: 5900 } }, memory: { [u.tx.key]: 5900 } });
assert(!r2.review.some((x) => x.type === 'unknown'));
const r3 = E.run({ files: [{ name: 'b.csv', text: 'Date,Description,Amount\n2026-09-02,ATELIER DUBE SOUDURE 22,-500' }], asOf, memory: { [u.tx.key]: 5900 } });
assert.strictEqual(r3.bank[0].account, 5900);
// a month-first bank file (09/03 = Sept 3, because 09/30 exists) still matches its invoice
const us = E.run({ asOf, files: [{ name: 'i.csv', text: 'Invoice #,Customer,Date,Amount\nA-1,"Smith & Co",2026-09-01,"1,149.75"' },
  { name: 'b.csv', text: 'Posted,Payee,Amount\n09/03/2026,E-TRANSFER SMITH CO,1149.75\n09/30/2026,SHELL 1234,-80.00' }] });
assert.deepStrictEqual(us.bank[0].invoices, ['A-1']);
console.log('OK', r.period, `${r.journal.length} entries`, `review ${types}`, `profit ${r.pnl.profit}`, `taxes ${r.taxes.gstNet}/${r.taxes.qstNet}`, `owed ${r.owed.map((o) => o.no + ':' + o.left + '@' + o.late).join(' ')}`, `aging ${r.aging}`, `${r.ms}ms`);
