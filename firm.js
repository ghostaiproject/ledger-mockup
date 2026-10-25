// Solva · public accounting firm screens: engagements, client requests (PBC), the "More" index, and Today's firm tasks.
// Loaded before app.js (after firm-data.js and firm-i18n*.js); runs at render time.
const engOf = (id) => state.firm.eng.find((e) => e.id === id);
const clientOf = (e) => CLIENTS.find((c) => c.id === e.client) || { name: e.client, short: e.client };
const engLabel = (e) => `${clientOf(e).name} · ${tf().kind[e.kind]}`;
const hoursOf = (id) => state.firm.time.filter((x) => x.eng === id).reduce((s, x) => s + x.h, 0);
const wipOf = (id) => state.firm.time.filter((x) => x.eng === id && !x.billed).reduce((s, x) => s + x.h * staff(x.who).rate, 0);
const pbcOpen = (id) => state.firm.pbc.filter((p) => p.eng === id && p.st !== 'received').length;
const engLate = (e) => e.stage < STAGE_COUNT - 1 && e.due < TODAY;
const hrs = (h) => new Intl.NumberFormat(loc(), { maximumFractionDigits: 2 }).format(h);
const longDate = (d) => d.toLocaleDateString(loc(), { day: 'numeric', month: 'long', year: 'numeric' });
const FIRM_FOCUS = ['engOpen', 'engFilter', 'engStep', 'engFlag', 'pbcSt', 'pbcAsk', 'pbcCopy', 'pbcAdd', 'yeView', 'yeAje', 'yeSign', 'yeUnsign', 'tStart', 'tStop', 'tAdd', 'tBill', 'tFilter'];

function firmTasks() { // added to Today in app.js; a firm's day starts with these
  const F = () => state.firm;
  return [
    { id: 'ye', go: '#/yearend', icon: 'folder-open', tone: 'amber', done: () => !!F().ye.sign.partner, arg: () => F().ye.aje.filter((a) => a.st === 'proposed').length || 0 },
    { id: 'pbc', go: '#/requests', icon: 'inbox', tone: '', done: () => !F().pbc.some((p) => p.st !== 'received'), arg: () => F().pbc.filter((p) => p.st !== 'received').length },
    { id: 'letter', go: '#/engagements', icon: 'briefcase', tone: '', done: () => engOf('boreal-rev').letter, arg: () => '', open: 'boreal-rev' },
    { id: 'wip', go: '#/time', icon: 'timer', tone: '', done: () => F().eng.every((e) => wipOf(e.id) < 1), arg: () => money(F().eng.reduce((s, e) => s + wipOf(e.id), 0)) },
  ];
}

function stageGate(e) { // what stops the engagement moving to its next stage
  const G = tf().eng.gate;
  if (e.stage === 0 && !e.letter) return G.letter;
  if (e.stage === 1 && !e.indep) return G.indep;
  if (e.stage === 2 && pbcOpen(e.id)) return G.pbc(pbcOpen(e.id));
  if (e.ye && e.stage >= 3 && e.stage < 6 && !state.firm.ye.sign[['prep', 'rev', 'partner'][e.stage - 3]]) return G.ye;
  return '';
}

function renderEngagements() {
  const el = $('#engList'); if (!el) return;
  const E = tf().eng, f = state.firm.engFilter || 'open';
  $('#engFilter').innerHTML = Object.entries(E.filters).map(([k, v]) => {
    const n = state.firm.eng.filter((e) => engPass(e, k)).length;
    return `<button role="radio" aria-checked="${f === k}" data-eng-filter="${k}">${v} <span class="count">${n}</span></button>`;
  }).join('');
  const list = state.firm.eng.filter((e) => engPass(e, f)).sort((a, b) => a.due - b.due);
  el.innerHTML = list.length ? list.map(engRow).join('') : `<li class="card empty"><i data-lucide="briefcase"></i><p>${E.none}</p></li>`;
}
function engPass(e, f) {
  const issued = e.stage >= STAGE_COUNT - 1;
  return f === 'all' || (f === 'issued' ? issued : f === 'late' ? engLate(e) : !issued);
}

function engRow(e) {
  const E = tf().eng, open = state.firm.open === e.id, h = hoursOf(e.id), pct = Math.min(100, Math.round((h / e.budget) * 100));
  const late = engLate(e), issued = e.stage >= STAGE_COUNT - 1, c = clientOf(e);
  const pill = issued ? `<span class="pill">${tf().stages[6]}</span>` : `<span class="pill ${late ? 'red' : e.stage === 0 ? 'amber' : 'grey'}">${tf().stages[e.stage]}</span>`;
  return `<li class="card eng-row ${open ? 'open' : ''} ${late ? 'late' : ''}">
    <button class="eng-head" data-eng-open="${e.id}" aria-expanded="${open}">
      <span class="avatar">${esc(c.short.slice(0, 2).toUpperCase())}</span>
      <span class="eng-name"><b>${esc(c.name)}</b><small>${tf().kind[e.kind]} · ${E.ye(day(e.period))}</small></span>
      <span class="eng-stage">${pill}<span class="dots" aria-hidden="true">${tf().stages.map((_, i) => `<i class="${i < e.stage || issued ? 'd' : i === e.stage ? 'c' : ''}"></i>`).join('')}</span></span>
      <span class="eng-team">${['prep', 'rev', 'partner'].map((k) => `<span class="avatar sm" title="${tf().roles[k]} · ${staff(e[k]).name}">${e[k]}</span>`).join('')}</span>
      <span class="eng-hrs"><small>${hrs(h)} / ${e.budget} h</small><span class="progress ${h > e.budget ? 'over' : ''}"><span style="width:${pct}%"></span></span></span>
      <span class="eng-due ${late ? 'late' : ''}"><small>${E.due}</small><b>${day(isoOf(e.due))}</b><small>${whenText(daysTo(e.due))}</small></span>
      <i data-lucide="chevron-down"></i></button>
    ${open ? engBody(e) : ''}</li>`;
}

function engBody(e) {
  const E = tf().eng, gate = stageGate(e), issued = e.stage >= STAGE_COUNT - 1;
  const steps = tf().stages.map((s, i) => `<li class="${i < e.stage || issued ? 'done' : i === e.stage ? 'on' : ''}"><span class="box"><i data-lucide="check"></i></span>${s}</li>`).join('');
  const flag = (k) => `<button class="check" role="checkbox" aria-checked="${e[k]}" data-eng-flag="${k}" data-eng="${e.id}"><span class="box"><i data-lucide="check"></i></span><span>${E[k]}</span></button>`;
  return `<div class="eng-body">
    <ol class="steps eng-steps">${steps}</ol>
    <div class="eng-side">
      <ul class="kv">${['prep', 'rev', 'partner'].map((k) => `<li><span>${tf().roles[k]}</span><span>${staff(e[k]).name}</span></li>`).join('')}
        <li><span>${E.budget}</span><span class="num">${hrs(hoursOf(e.id))} / ${e.budget} h${hoursOf(e.id) > e.budget ? ` · <b class="red">${E.over}</b>` : ''}</span></li>
        <li><span>${E.fee}</span><span class="num">${money(e.fee)}</span></li><li><span>${E.wip}</span><span class="num">${money(wipOf(e.id))}</span></li>
        <li><span>${tf().kindStd[e.kind]}</span><span>${longDate(e.due)}</span></li></ul>
      <div class="checks">${flag('letter')}${flag('indep')}</div>
      ${gate && !issued ? `<p class="warn"><i data-lucide="info"></i>${esc(gate)}</p>` : ''}
      <div class="acts">${issued ? '' : `<button class="btn primary" data-eng-step="${e.id}" data-dir="1" ${gate ? 'aria-disabled="true"' : ''}><i data-lucide="arrow-right"></i>${E.next}</button>`}
        ${e.stage > 0 ? `<button class="btn soft" data-eng-step="${e.id}" data-dir="-1"><i data-lucide="rotate-ccw"></i>${E.back}</button>` : ''}</div>
      <div class="eng-links">${e.ye ? `<a class="link" href="#/yearend"><i data-lucide="folder-open"></i>${E.open.ye}</a>` : ''}
        <a class="link" href="#/requests" data-go-eng="${e.id}"><i data-lucide="inbox"></i>${E.open.pbc}${pbcOpen(e.id) ? ` · ${pbcOpen(e.id)}` : ''}</a>
        <a class="link" href="#/time" data-go-eng="${e.id}"><i data-lucide="timer"></i>${E.open.time}</a></div>
    </div></div>`;
}

function renderRequests() {
  const el = $('#pbcOut'); if (!el) return;
  const R = tf().req, groups = state.firm.eng.filter((e) => state.firm.pbc.some((p) => p.eng === e.id));
  el.innerHTML = groups.map((e) => {
    const items = state.firm.pbc.filter((p) => p.eng === e.id), got = items.filter((p) => p.st === 'received').length;
    const rows = items.map((p) => {
      const d = p.asked ? Math.max(0, daysTo(p.asked) * -1) : 0;
      const act = p.st === 'received' ? `<button class="btn soft" data-pbc-st="${p.id}" data-to="sent">${R.undo}</button>`
        : `<button class="btn soft" data-pbc-ask="${p.id}"><i data-lucide="send"></i>${p.st === 'sent' ? R.remind : R.ask}</button><button class="btn primary" data-pbc-st="${p.id}" data-to="received"><i data-lucide="check"></i>${R.got}</button>`;
      return `<li class="pbc ${p.st}"><span class="pill ${p.st === 'received' ? '' : p.st === 'sent' ? 'amber' : 'red'}">${R.st[p.st]}</span>
        <div><b>${esc(p.text[state.lang])}</b><small>${p.st === 'received' ? '' : R.since(p.st === 'sent' ? d : 0)}</small></div><div class="acts">${act}</div></li>`;
    }).join('');
    return `<section class="card pbc-card" ${state.firm.pbcFocus === e.id ? 'data-focus="1"' : ''}><div class="pbc-head"><div><b>${esc(engLabel(e))}</b>
      <small>${R.done(got, items.length)}</small></div><span class="progress"><span style="width:${Math.round((got / items.length) * 100)}%"></span></span>
      <button class="link" data-pbc-copy="${e.id}"><i data-lucide="copy"></i>${R.copy}</button></div>
      <ul class="pbc-list">${rows}</ul>
      <div class="pbc-add"><input class="input" id="pbcIn-${e.id}" placeholder="${R.addPh}" aria-label="${R.add}" maxlength="120"><button class="btn soft" data-pbc-add="${e.id}"><i data-lucide="plus"></i>${R.add}</button></div></section>`;
  }).join('');
}

function renderMore() {
  const el = $('#moreOut'); if (!el) return;
  const ic = { engagements: 'briefcase', yearend: 'folder-open', requests: 'inbox', time: 'timer', clients: 'users', auto: 'wand-sparkles', review: 'shield-check', calendar: 'calendar-days', money: 'wallet', close: 'list-checks', engine: 'sliders-horizontal' };
  el.innerHTML = Object.entries(ic).map(([k, i]) => `<li><a class="card more-tile" href="#/${k}"><span class="ic"><i data-lucide="${i}"></i></span><b>${t().nav[k]}</b><small>${tf().moreDesc[k]}</small></a></li>`).join('');
}

function renderFirm() {
  document.querySelectorAll('[data-i18n-tf]').forEach((el) => { el.textContent = getP(tf(), el.dataset.i18nTf); });
  renderEngagements(); renderRequests(); renderTime(); renderYearend(); renderMore(); }

document.addEventListener('click', (ev) => {
  const a = ev.target.closest('a[data-go-eng]'); if (a) { state.firm.tFilter = a.dataset.goEng; state.firm.pbcFocus = a.dataset.goEng; return; }
  const b = ev.target.closest('button'); if (!b || !state.firm) return;
  const ds = b.dataset, F = state.firm;
  if (ds.engOpen) F.open = F.open === ds.engOpen ? null : ds.engOpen;
  else if (ds.engFilter) F.engFilter = ds.engFilter;
  else if (ds.engFlag) { const e = engOf(ds.eng); e[ds.engFlag] = !e[ds.engFlag]; if (!e[ds.engFlag] && e.stage > (ds.engFlag === 'letter' ? 0 : 1)) e.stage = ds.engFlag === 'letter' ? 0 : 1; }
  else if (ds.engStep) {
    if (b.getAttribute('aria-disabled') === 'true') return;
    const e = engOf(ds.engStep), prev = e.stage; e.stage = Math.max(0, Math.min(STAGE_COUNT - 1, e.stage + +ds.dir));
    toast(tf().eng.toastStage(tf().stages[e.stage]), () => { e.stage = prev; });
  }
  else if (ds.pbcSt) { const p = F.pbc.find((x) => x.id === ds.pbcSt), prev = p.st; p.st = ds.to; if (ds.to === 'received') toast(tf().req.toastGot, () => { p.st = prev; }); }
  else if (ds.pbcAsk) { const p = F.pbc.find((x) => x.id === ds.pbcAsk), prev = { st: p.st, asked: p.asked }; Object.assign(p, { st: 'sent', asked: new Date(TODAY) }); toast(tf().req.toastAsk(clientOf(engOf(p.eng)).name), () => Object.assign(p, prev)); }
  else if (ds.pbcCopy) {
    const e = engOf(ds.pbcCopy), miss = F.pbc.filter((p) => p.eng === e.id && p.st !== 'received');
    const text = `${engLabel(e)}\n${miss.map((p) => `- ${p.text[state.lang]}`).join('\n') || tf().req.all}`;
    navigator.clipboard.writeText(text).then(() => toast(tf().req.toastCopy), () => {}); return;
  }
  else if (ds.pbcAdd) { const inp = $(`#pbcIn-${ds.pbcAdd}`), v = inp.value.trim(); if (!v) { inp.focus(); return; } F.pbc.push({ id: `p${F.pbc.length}-${Date.now() % 1e5}`, eng: ds.pbcAdd, text: { fr: v, en: v }, st: 'missing', asked: null }); }
  else return;
  render();
});
