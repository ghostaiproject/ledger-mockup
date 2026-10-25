// Solva · year-end file (public accounting): trial balance, adjusting entries, lead sheets, compiled statements, sign-offs.
// Uses firm-data.js (YE_TB, YE_AJE) and app.js helpers at render time.
const yeS = () => state.firm.ye;
const yeEng = () => state.firm.eng.find((e) => e.ye);
const yeAcct = (no) => YE_TB.find((r) => r[0] === +no);
const yeName = (no) => { const r = yeAcct(no); return r ? `${r[0]} ${state.lang === 'fr' ? r[1] : r[2]}` : no; };
const acc = (n) => (Math.round(n) < 0 ? `(${money(-n)})` : money(n)); // credits in brackets, the way a trial balance reads

function yeCalc() {
  const adj = Object.fromEntries(YE_TB.map((r) => [r[0], 0]));
  const post = (a, amt) => { adj[a.dr] += amt; adj[a.cr] -= amt; };
  const on = yeS().aje.filter((a) => a.st === 'accepted');
  on.filter((a) => a.amt !== 'tax').forEach((a) => post(a, a.amt));
  const base = (no) => yeAcct(no)[3] + adj[no];
  const pretax = -YE_TB.filter((r) => r[0] >= 4000 && r[0] < 5800).reduce((s, r) => s + base(r[0]), 0);
  const tax = Math.max(0, Math.round(pretax * YE_TAX_RATE));
  on.filter((a) => a.amt === 'tax').forEach((a) => post(a, tax));
  const fin = (no) => yeAcct(no)[3] + adj[no];
  const line = (k, col = 'fin') => YE_TB.filter((r) => r[5] === k).reduce((s, r) => s + (col === 'py' ? r[4] : fin(r[0])), 0);
  const diff = YE_TB.reduce((s, r) => s + fin(r[0]), 0);
  return { adj, fin, line, tax, amtOf: (a) => (a.amt === 'tax' ? tax : a.amt), diff: Math.round(diff) };
}

function yeStatements(c) {
  const L = c.line, rev = -L('rev'), cos = L('cos'), opx = L('opx'), itx = L('itx');
  const gross = rev - cos, pretax = gross - opx, net = pretax - itx;
  const reOpen = -c.fin(3100), reClose = reOpen + net;
  const cur = ['cash', 'ar', 'inv', 'pre'].map((k) => [k, L(k)]), cap = L('cap');
  const totalA = cur.reduce((s, [, v]) => s + v, 0) + cap;
  const liab = ['ap', 'tax', 'ltd'].map((k) => [k, -L(k)]), share = -L('eq');
  const totalLE = liab.reduce((s, [, v]) => s + v, 0) + share + reClose;
  return { rev, cos, gross, opx, pretax, itx, net, reOpen, reClose, cur, cap, totalA, liab, share, totalLE };
}

function yeBlockers(c) {
  const Y = tf().ye, s = yeS().sign, out = { prep: [], rev: [], partner: [] };
  const open = yeS().aje.filter((a) => a.st === 'proposed').length;
  if (open) out.prep.push(Y.block.aje(open));
  if (c.diff) out.prep.push(Y.block.bal);
  if (!s.prep) out.rev.push(Y.block.order);
  if (!s.rev) out.partner.push(Y.block.order);
  out.rev.push(...out.prep); out.partner.push(...out.prep);
  return out;
}

function renderYearend() {
  const el = $('#yeOut'); if (!el) return;
  const Y = tf().ye, S = yeS(), c = yeCalc();
  const tabs = Object.entries(Y.views).map(([k, v]) => `<button role="radio" aria-checked="${S.view === k}" data-ye-view="${k}">${v}</button>`).join('');
  const ok = !c.diff;
  const head = `<p class="lead small"><b>${Y.client}</b> · ${Y.period} · ${tf().kind.comp} (${tf().kindStd.comp})</p>
    <div class="seg wide ye-tabs" role="radiogroup" aria-label="${Y.title}">${tabs}</div>
    <p class="ye-bal"><span class="pill ${ok ? '' : 'red'}"><i data-lucide="${ok ? 'scale' : 'triangle-alert'}"></i>${ok ? Y.balanced : Y.unbalanced(money(Math.abs(c.diff)))}</span>
    <button class="link" data-ye-csv="1"><i data-lucide="download"></i>${Y.csv}</button></p>`;
  const body = { tb: yeTB, aje: yeAJE, lead: yeLead, fs: yeFS }[S.view](c);
  el.innerHTML = head + body + yeSigns(c);
}

function yeTB(c) {
  const Y = tf().ye, C = Y.cols;
  const rows = YE_TB.map((r) => `<tr><td>${yeName(r[0])}</td><td class="num">${acc(r[3])}</td><td class="num">${c.adj[r[0]] ? acc(c.adj[r[0]]) : '—'}</td><td class="num"><b>${acc(c.fin(r[0]))}</b></td></tr>`).join('');
  const dr = YE_TB.reduce((s, r) => s + Math.max(0, c.fin(r[0])), 0), cr = YE_TB.reduce((s, r) => s + Math.min(0, c.fin(r[0])), 0);
  return `<div class="card jr ye-tb"><table><thead><tr><th>${C.acct}</th><th class="num">${C.unadj}</th><th class="num">${C.adj}</th><th class="num">${C.final}</th></tr></thead>
    <tbody>${rows}<tr class="top"><td><b>${Y.totals}</b></td><td></td><td></td><td class="num"><b>${money(dr)} / ${acc(cr)}</b></td></tr></tbody></table></div>`;
}

function yeAJE(c) {
  const Y = tf().ye;
  const opts = YE_TB.map((r) => `<option value="${r[0]}">${esc(yeName(r[0]))}</option>`).join('');
  const cards = yeS().aje.map((a) => {
    const st = a.st, pill = st === 'accepted' ? ['', Y.accepted] : st === 'rejected' ? ['red', Y.rejected] : ['amber', Y.proposed];
    const btns = st === 'proposed'
      ? `<button class="btn primary" data-ye-aje="${a.id}" data-to="accepted"><i data-lucide="check"></i>${Y.accept}</button><button class="btn soft" data-ye-aje="${a.id}" data-to="rejected"><i data-lucide="circle-x"></i>${Y.reject}</button>`
      : `<button class="btn soft" data-ye-aje="${a.id}" data-to="proposed"><i data-lucide="rotate-ccw"></i>${Y.reopen}</button>`;
    return `<li class="card aje ${st}"><div class="aje-top"><b>${a.id}</b><span class="pill ${pill[0]}">${pill[1]}</span><b class="num">${money(c.amtOf(a))}</b></div>
      <p>${esc(state.lang === 'fr' ? a.fr : a.en)}</p>
      <ul class="kv"><li><span>${Y.dr}</span><span>${esc(yeName(a.dr))}</span></li><li><span>${Y.cr}</span><span>${esc(yeName(a.cr))}</span></li></ul>
      <div class="acts">${btns}</div></li>`;
  }).join('');
  return `<p class="muted">${Y.ajeLead}</p><ul class="list ajes">${cards}</ul>
    <details class="card add ye-add"><summary><i data-lucide="plus"></i>${Y.addAje}</summary>
      <label class="field"><span>${Y.dr}</span><select id="yeDr">${opts}</select></label>
      <label class="field"><span>${Y.cr}</span><select id="yeCr">${opts}</select></label>
      <label class="field"><span>${Y.amt}</span><input class="input num" id="yeAmt" inputmode="decimal" placeholder="1 000"></label>
      <label class="field"><span>${Y.desc}</span><input class="input" id="yeDesc" maxlength="120"></label>
      <button class="btn primary" data-ye-add="1"><i data-lucide="plus"></i>${Y.addBtn}</button></details>`;
}

function yeLead(c) {
  const Y = tf().ye, C = Y.cols, keys = ['cash', 'ar', 'inv', 'pre', 'cap', 'ap', 'tax', 'ltd', 'rev', 'cos', 'opx', 'itx'];
  const credit = (k) => ['ap', 'tax', 'ltd', 'rev'].includes(k);
  const rows = keys.map((k) => {
    const sg = credit(k) ? -1 : 1, now = sg * c.line(k), py = sg * c.line(k, 'py'), d = now - py;
    const flag = Math.abs(d) > YE_MATERIAL && (!py || Math.abs(d / py) > 0.1);
    return `<tr class="${flag ? 'flag' : ''}"><td>${Y.lines[k]}</td><td class="num">${money(now)}</td><td class="num">${money(py)}</td>
      <td class="num">${d >= 0 ? '+' : '−'}${money(Math.abs(d))}${py ? ` <small>${Math.round((d / Math.abs(py)) * 100)} %</small>` : ''}${flag ? ` <span class="pill amber">${Y.explain}</span>` : ''}</td></tr>`;
  }).join('');
  return `<p class="muted">${Y.leadLead}</p><div class="card jr"><table><thead><tr><th></th><th class="num">2026</th><th class="num">${C.py}</th><th class="num">${C.varc}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function yeFS(c) {
  const Y = tf().ye, F = yeStatements(c), s = yeS().sign, L = Y.lines;
  const r = (label, v, cls = '') => `<li class="${cls}"><span>${label}</span><b class="num">${money(v)}</b></li>`;
  const signedOn = s.partner ? s.partner.at : '';
  return `<div class="card fs print-area">
    <p class="fs-draft">${s.partner ? '' : Y.draft}</p>
    <h2>${Y.client}</h2><p class="muted">${Y.period}</p>
    <h3>${Y.reportH}</h3>${Y.report(Y.client, signedOn).map((p) => `<p>${esc(p)}</p>`).join('')}
    <h3>${Y.is}</h3><ul class="kv">${r(L.rev, F.rev)}${r(L.cos, F.cos)}${r(Y.gross, F.gross, 'sub')}${r(L.opx, F.opx)}${r(Y.pretax, F.pretax, 'sub')}${r(L.itx, F.itx)}${r(Y.net, F.net, 'total')}</ul>
    <h3>${Y.reH}</h3><ul class="kv">${r(Y.reOpen, F.reOpen)}${r(Y.reNet, F.net)}${r(Y.reClose, F.reClose, 'total')}</ul>
    <h3>${Y.bs}</h3><ul class="kv"><li class="sub"><span>${Y.assets}</span></li>${F.cur.map(([k, v]) => r(L[k], v)).join('')}${r(L.cap, F.cap)}${r(Y.totalA, F.totalA, 'total')}
      <li class="sub"><span>${Y.liab}</span></li>${F.liab.map(([k, v]) => r(L[k], v)).join('')}<li class="sub"><span>${Y.equity}</span></li>${r(L.eq, F.share)}${r(L.re, F.reClose)}${r(Y.totalLE, F.totalLE, 'total')}</ul>
    <p class="muted small">${Y.note1}</p></div>
    <button class="btn soft" data-ye-print="1"><i data-lucide="printer"></i>${Y.print}</button>`;
}

function yeSigns(c) {
  const Y = tf().ye, s = yeS().sign, e = yeEng(), blk = yeBlockers(c), who = { prep: e.prep, rev: e.rev, partner: e.partner };
  const row = (k) => {
    const v = s[k], can = !blk[k].length;
    return `<div class="sig ${v ? 'on' : ''}"><span class="ic"><i data-lucide="${v ? 'circle-check' : 'pen-line'}"></i></span>
      <div><b>${tf().roles[k]} · ${staff(who[k]).name}</b><small>${v ? Y.signed(v.by, v.at) : esc(blk[k][0] || '')}</small></div>
      ${v ? `<button class="btn soft" data-ye-unsign="${k}">${Y.unsign}</button>` : `<button class="btn ${can ? 'primary' : 'soft'}" data-ye-sign="${k}" ${can ? '' : 'aria-disabled="true"'}>${Y.sign}</button>`}</div>`;
  };
  return `<h2>${Y.signH}</h2><div class="card sigs">${['prep', 'rev', 'partner'].map(row).join('')}</div>`;
}

function yeVoid() {
  const s = yeS().sign;
  if (s.prep || s.rev || s.partner) { yeS().sign = { prep: null, rev: null, partner: null }; toast(tf().ye.toastVoid); return true; }
  return false;
}

document.addEventListener('click', (ev) => {
  const b = ev.target.closest('button'); if (!b) return;
  const ds = b.dataset, S = state.firm && yeS(); if (!S) return;
  if (ds.yeView) { S.view = ds.yeView; }
  else if (ds.yeAje) {
    const a = S.aje.find((x) => x.id === ds.yeAje), prev = a.st, Y = tf().ye;
    a.st = ds.to; const voided = yeVoid();
    if (!voided) toast(Y.toastAje(a.id, Y[ds.to]), () => { a.st = prev; });
  }
  else if (ds.yeAdd) {
    const amt = Math.round(parseFloat(($('#yeAmt').value || '').replace(/\s/g, '').replace(',', '.')) * 100) / 100, dr = +$('#yeDr').value, cr = +$('#yeCr').value;
    if (!(amt > 0) || dr === cr) { $('#yeAmt').focus(); return; }
    const d = $('#yeDesc').value.trim() || '—';
    S.aje.push({ id: `AJE-${S.aje.length + 1}`, dr, cr, amt, fr: d, en: d, st: 'proposed', mine: true });
    yeVoid();
  }
  else if (ds.yeSign) {
    if (b.getAttribute('aria-disabled') === 'true') return;
    const e = yeEng(), who = { prep: e.prep, rev: e.rev, partner: e.partner }[ds.yeSign];
    S.sign[ds.yeSign] = { by: who, at: new Date().toLocaleDateString(loc(), { day: 'numeric', month: 'long', year: 'numeric' }) };
    e.stage = Math.max(e.stage, { prep: 4, rev: 5, partner: 6 }[ds.yeSign]);
    toast(tf().ye.toastSign);
  }
  else if (ds.yeUnsign) { const k = ds.yeUnsign, order = ['prep', 'rev', 'partner']; order.slice(order.indexOf(k)).forEach((x) => { S.sign[x] = null; }); }
  else if (ds.yePrint) { window.print(); return; }
  else if (ds.yeCsv) {
    const c = yeCalc(), C = tf().ye.cols, q = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [[C.acct, C.unadj, C.adj, C.final, C.py], ...YE_TB.map((r) => [yeName(r[0]), r[3], c.adj[r[0]], c.fin(r[0]), r[4]])];
    saveFile('deux-pins-balance-2026-06-30.csv', '﻿' + lines.map((l) => l.map(q).join(',')).join('\n'), 'text/csv;charset=utf-8'); return;
  }
  else return;
  render();
});
