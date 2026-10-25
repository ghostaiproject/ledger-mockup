// Solva · time and billing: timer, time entries, budget vs actual, WIP per engagement and client invoices.
function renderTime() {
  const el = $('#timeOut'); if (!el) return;
  const T_ = tf().time, F = state.firm, f = F.tFilter || 'all';
  const engs = F.eng.filter((e) => hoursOf(e.id) || e.stage < STAGE_COUNT - 1);
  const opt = (sel) => engs.map((e) => `<option value="${e.id}" ${sel === e.id ? 'selected' : ''}>${esc(engLabel(e))}</option>`).join('');
  const who = STAFF.map((s) => `<option value="${s.id}">${s.id} · ${esc(s.name)}</option>`).join('');
  const run = F.timer;
  const timer = run
    ? `<div class="card timer on"><span class="ic"><i data-lucide="timer"></i></span><div><b>${esc(T_.running(engLabel(engOf(run.eng))))}</b><small class="num" id="tClock">0:00:00</small></div>
        <button class="btn primary" data-t-stop="1"><i data-lucide="square"></i>${T_.stop}</button></div>`
    : `<div class="card timer"><span class="ic"><i data-lucide="timer"></i></span>
        <label class="field"><span>${T_.eng}</span><select id="tEng">${opt(f !== 'all' ? f : 'pins-comp')}</select></label>
        <label class="field"><span>${T_.who}</span><select id="tWho">${who}</select></label>
        <label class="field grow"><span>${T_.what}</span><input class="input" id="tNote" maxlength="80"></label>
        <label class="field"><span>${T_.hours}</span><input class="input num" id="tH" inputmode="decimal" placeholder="0,5" size="4"></label>
        <div class="acts"><button class="btn soft" data-t-add="1"><i data-lucide="plus"></i>${T_.add}</button><button class="btn primary" data-t-start="1"><i data-lucide="play"></i>${T_.start}</button></div></div>`;
  const wipRows = F.eng.filter((e) => wipOf(e.id) > 0).map((e) => {
    const h = F.time.filter((x) => x.eng === e.id && !x.billed).reduce((s, x) => s + x.h, 0), w = wipOf(e.id);
    const real = Math.round((Math.min(e.fee, w) / w) * 100);
    return `<li class="row wip"><div><b>${esc(engLabel(e))}</b><small>${hrs(h)} h · ${money(w)} ${T_.std} · ${T_.real(`${real} %`)}</small></div>
      <b class="num">${money(Math.min(e.fee, w))}</b><button class="btn primary" data-t-bill="${e.id}"><i data-lucide="receipt"></i>${T_.bill}</button></li>`;
  }).join('') || `<li class="row"><p class="muted">${T_.nothing}</p></li>`;
  const budget = F.eng.map((e) => {
    const h = hoursOf(e.id), pct = Math.min(100, Math.round((h / e.budget) * 100));
    return `<li class="row bud"><div><b>${esc(clientOf(e).short)} · ${tf().kind[e.kind]}</b><span class="progress ${h > e.budget ? 'over' : ''}"><span style="width:${pct}%"></span></span></div>
      <span class="num ${h > e.budget ? 'red' : ''}">${hrs(h)} / ${e.budget} h</span></li>`;
  }).join('');
  const shown = F.time.filter((x) => f === 'all' || x.eng === f).sort((a, b) => b.date - a.date);
  const fopts = `<option value="all">${tf().eng.filters.all}</option>${opt(f)}`;
  const entries = shown.map((x) => `<tr><td>${day(isoOf(x.date))}</td><td>${x.who}</td><td>${esc(clientOf(engOf(x.eng)).short)}</td><td>${esc(x.note[state.lang] || x.note.fr)}</td>
    <td class="num">${hrs(x.h)}</td><td class="num">${money(x.h * staff(x.who).rate)}</td><td><span class="pill ${x.billed ? '' : 'amber'}">${x.billed ? T_.billed : T_.unbilled}</span></td></tr>`).join('');
  const inv = F.invoices.slice().reverse().map((v) => `<li class="row"><div><b>${v.id}</b><small>${esc(engLabel(engOf(v.eng)))} · ${day(isoOf(v.date))}</small></div><b class="num">${money(v.amt)}</b></li>`).join('');
  const totalWip = F.eng.reduce((s, e) => s + wipOf(e.id), 0);
  el.innerHTML = `${timer}
    <div class="time-grid">
      <section class="time-cards"><div><h2>${T_.wipH} · <span class="num">${money(totalWip)}</span></h2><ul class="list card">${wipRows}</ul></div>
        <div><h2>${T_.budgetH}</h2><ul class="list card">${budget}</ul></div>
        <div><h2>${T_.invH}</h2><ul class="list card">${inv}</ul></div></section>
      <section><div class="time-head"><h2>${T_.entriesH}</h2><label class="field inline"><span class="sr">${T_.eng}</span><select id="tFilter" data-t-filter="1">${fopts}</select></label>
        <button class="link" data-t-csv="1"><i data-lucide="download"></i>${T_.csv}</button></div>
        <div class="card jr"><table><thead><tr><th>Date</th><th>${T_.who}</th><th>${tf().nav.engagements}</th><th>${T_.what}</th><th class="num">h</th><th class="num">$</th><th></th></tr></thead><tbody>${entries}</tbody></table></div></section>
    </div>`;
  if (run) tick();
}

let tickTimer;
function tick() {
  clearTimeout(tickTimer);
  const run = state.firm.timer, el = $('#tClock'); if (!run || !el) return;
  const s = Math.floor((Date.now() - run.start) / 1000);
  el.textContent = `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  tickTimer = setTimeout(tick, 1000);
}

function addTime(eng, who, h, note) {
  const F = state.firm, x = { id: `t${Date.now()}`, eng, who, date: new Date(TODAY), h, note: { fr: note, en: note }, billed: false };
  F.time.push(x);
  return () => { F.time = F.time.filter((y) => y !== x); };
}

document.addEventListener('change', (ev) => { if (ev.target.id === 'tFilter') { state.firm.tFilter = ev.target.value; render(); } });
document.addEventListener('click', (ev) => {
  const b = ev.target.closest('button'); if (!b || !state.firm) return;
  const ds = b.dataset, F = state.firm, T_ = tf().time;
  if (ds.tStart) F.timer = { eng: $('#tEng').value, who: $('#tWho').value, note: $('#tNote').value.trim() || '—', start: Date.now() };
  else if (ds.tStop) {
    const r = F.timer, h = Math.max(0.1, Math.ceil(((Date.now() - r.start) / 36e5) * 10) / 10); // bill in tenths of an hour
    F.timer = null; toast(T_.toastStop(hrs(h)), addTime(r.eng, r.who, h, r.note));
  }
  else if (ds.tAdd) {
    const h = Math.round(parseFloat(($('#tH').value || '').replace(',', '.')) * 100) / 100;
    if (!(h > 0 && h <= 24)) { $('#tH').focus(); return; }
    toast(T_.toastAdd(hrs(h)), addTime($('#tEng').value, $('#tWho').value, h, $('#tNote').value.trim() || '—'));
  }
  else if (ds.tBill) {
    const e = engOf(ds.tBill), open = F.time.filter((x) => x.eng === e.id && !x.billed), amt = Math.min(e.fee, wipOf(e.id));
    const no = `F-2026-${120 + F.invoices.length - 2}`, v = { id: no, eng: e.id, amt, date: new Date(TODAY) };
    open.forEach((x) => { x.billed = true; }); F.invoices.push(v);
    toast(T_.toastBill(no, money(amt)), () => { open.forEach((x) => { x.billed = false; }); F.invoices = F.invoices.filter((y) => y !== v); });
  }
  else if (ds.tCsv) {
    const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [['date', 'staff', 'engagement', 'work', 'hours', 'rate', 'amount', 'billed'], ...F.time.map((x) => [isoOf(x.date), x.who, x.eng, x.note.fr, x.h, staff(x.who).rate, x.h * staff(x.who).rate, x.billed ? 'yes' : 'no'])];
    saveFile('solva-temps.csv', '﻿' + rows.map((r) => r.map(q).join(',')).join('\n'), 'text/csv;charset=utf-8'); return;
  }
  else return;
  render();
});
