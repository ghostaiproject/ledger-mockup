// Folio: phone-first mock of an accountant's workbench for a Québec firm (desk.js adds review, engine settings and the calendar). Fake clients and figures; nothing is filed or sent anywhere.
const T = {
  fr: {
    home: 'Accueil Folio', language: 'Langue', sections: 'Sections', dark: 'Mode sombre', light: 'Mode clair',
    nav: { today: "Aujourd'hui", calendar: 'Calendrier', clients: 'Clients', auto: 'Pilote auto', review: 'Révision', money: 'Argent', close: 'Fin de mois', engine: 'Moteur', deadlines: 'Échéances' },
    kicker: 'Pour les CPA et les cabinets comptables du Québec',
    landTitle: 'Du relevé bancaire aux états financiers signés.',
    landLead: "Folio suit chaque mandat du cabinet : tenue de livres, missions de compilation et d’examen, T2/CO-17 et T1/TP-1. Le pilote auto prépare, le réviseur vérifie, l’associée signe. Temps, TEC et échéances ARC et Revenu Québec du portefeuille au même endroit.",
    open: 'Voir ma journée', how: 'Comment ça marche',
    benefits: [
      ['wand-sparkles', 'Le pilote auto prépare, tu révises', 'Relevé et factures en entrée : classement, rapprochement, TPS/TVQ, écritures. Seules les exceptions te reviennent.'],
      ['shield-check', 'Chaque décision a sa raison', 'Règle, fournisseur appris, facture reliée : tout est montré, corrigeable, approuvable par lot, puis signé par le préparateur et le réviseur.'],
      ['briefcase', 'Chaque mandat, de la lettre à la remise', 'Lettre de mission, indépendance, documents du client, dossier de fin d’exercice, signatures, temps et TEC : tout le cabinet sur un écran.'],
      ['calendar-days', 'Un calendrier pour tout le portefeuille', 'TPS/TVQ, DAS, acomptes, T2/CO-17, T4/RL-1 : calculés selon le profil de chaque client, exportables vers ton agenda.'],
    ],
    peek: { cats: [['Hydro-Québec', 'Électricité'], ['Bell', 'Téléphone'], ['RONA', 'Matériel']], due: 'TPS/TVQ', dueSub: 'Café Mistral · dans 8 jours',
      files: [['CM', 'Café Mistral', 'À faire', 'amber'], ['TN', 'Transports Nordet', 'Prêt', '']], close: 'Fin de septembre' },
    demo: "Maquette de démonstration · données fictives · rien n'est envoyé",
    phRow1: '3 exceptions · Atelier Boréal', phRow2: 'TPS/TVQ · Café Mistral', phRow3: 'Contrôles conformes', phBtn: 'Signer la révision',
    todayTitle: "Aujourd'hui", morning: 'Bonjour', evening: 'Bonsoir',
    leftToday: (n) => (n ? `chose${n > 1 ? 's' : ''} à faire aujourd'hui` : 'Tout est fait pour aujourd\'hui. Bravo !'),
    allDone: 'Profite de ta soirée.',
    deadlines: 'Échéances', deadlinesLead: 'Les dates à respecter avec l’ARC et Revenu Québec.', later: 'Ensuite', nothingDue: 'Aucune échéance en attente.',
    clients: 'Clients', money: 'Argent', owed: 'Les clients te doivent',
    onTime: (a) => `${a} à temps`, lateAmt: (a) => `${a} en retard`, chase: 'Factures à relancer',
    bankLine: (n) => (n ? `${n} opérations bancaires à relier` : 'Toutes les opérations sont reliées'),
    bankHint: 'Relier chaque paiement à sa facture.',
    matchBtn: (r) => (r ? `J'ai vérifié les ${r} dernières` : 'Relier pour moi'), matchDone: 'Terminé',
    closeTitle: (m) => `Fin de mois : ${m}`, closeLead: 'Coche chaque étape quand elle est faite.', ofN: (a, b) => `${a} sur ${b}`,
    filters: { action: 'À faire', progress: 'En cours', done: 'Prêts' },
    done: 'Fait', filedBtn: "C'est fait", fileLabel: (x) => `Marquer « ${x} » comme produit`,
    today: "aujourd'hui", inDays: (d) => `dans ${d} jour${d > 1 ? 's' : ''}`, late: (d) => `${d} jours de retard`,
    pct: (n) => `${n} % fait`, ask: 'Demander les documents', asked: 'Demande envoyée', ready: 'Marquer comme prêt', allReady: 'Dossier prêt. Rien à faire.',
    remind: (c) => `Envoyer un rappel à ${c}`, reminded: 'Rappel envoyé', unpaid: (d) => `impayée depuis ${d} jours`,
    tasks: {
      review: ['Révision', 'Réviser et signer le dossier', (c) => `${c} · exceptions, contrôles et signatures du préparateur et du réviseur.`, 'Ouvrir la révision'],
      week: ['Cette semaine', 'Échéances des 7 prochains jours', (n) => `${n} à produire pour tes clients · voir le calendrier`, 'Ouvrir le calendrier'],
      auto: ['Pilote auto', 'Faire les livres du mois', (c) => `${c} · dépose le relevé et les factures, Folio fait le reste.`, 'Ouvrir le pilote auto'],
      payroll: ['Fait', 'Inscrire les paies de la semaine', () => 'Fait ce matin, 7 employés', ''],
      late: ['En retard', 'Produire la TPS/TVQ de Café Mistral', (d) => `Taxes de vente du mois dernier · ${d} jours de retard`, "C'est fait"],
      remind: ['À relancer', 'Relancer Transports Nordet', (a) => `Facture H-2291 · ${a} impayée depuis 47 jours`, 'Envoyer un rappel'],
      match: ['Banque', 'Relier les opérations bancaires', (n) => `${n} paiements à relier à leur facture. Folio peut le faire pour toi.`, 'Relier pour moi'],
    },
    toastFiled: 'Marqué comme produit', toastRemind: (c) => `Rappel envoyé à ${c}`, toastMatch: (n, r) => `${n} opérations reliées · ${r} à vérifier`,
    toastMatched: 'Banque à jour', toastAsk: (c) => `Demande envoyée à ${c}`, toastReady: (c) => `${c} est prêt`, toastClose: 'Fin de mois bouclée. Bravo !',
    undo: 'Annuler', undone: 'Annulé',
    allDeadlines: 'Toutes les échéances',
    autoTitle: 'Pilote automatique',
    autoLead: 'Donne-moi le relevé bancaire et la liste des factures. Je m’occupe de la tenue de livres; tu vérifies seulement ce que je te montre.',
    auto: {
      whose: 'Les livres de qui ?', drop: 'Dépose tes fichiers ici',
      dropHint: 'Relevé bancaire et factures en CSV (dans Excel : Enregistrer sous → CSV). Rien ne quitte ton appareil.',
      pick: 'Choisir des fichiers', sample: 'Essayer avec des fichiers exemples',
      kinds: { bank: 'Relevé bancaire', invoices: 'Factures', unknown: 'Pas reconnu' }, rows: (n) => `${n} ligne${n > 1 ? 's' : ''}`,
      nobank: 'Il me faut au moins un relevé bancaire : colonnes Date, Description et Montant (ou Retrait et Dépôt).',
      steps: { read: 'Je lis les fichiers', sort: 'Je classe les dépenses', match: 'Je relie les paiements aux factures', tax: 'Je calcule la TPS et la TVQ', journal: 'Je prépare les écritures', check: 'Je vérifie les résultats' },
      need: (n) => (n ? `chose${n > 1 ? 's' : ''} à vérifier` : 'Les livres sont prêts.'),
      did: (n) => `${n} opérations traitées pour toi`,
      profit: (p) => (p < 0 ? 'Perte nette du mois' : 'Bénéfice net du mois'), taxes: (n) => (n < 0 ? 'Remboursement de taxes' : 'Taxes à remettre'),
      by: (d) => `avant le ${d}`, matched: 'Paiements reliés',
      checkH: 'À vérifier', didH: "Ce que j'ai fait", pnlH: 'Résultats', taxH: 'TPS et TVQ', owedH: "Qui doit encore de l'argent", filesH: 'Fichiers prêts',
      log: {
        read: (r) => `${r.bank.length} opérations bancaires et ${r.invoices} factures lues`,
        sort: (r) => `${r.sorted.auto} dépenses sur ${r.sorted.outs} classées toutes seules`,
        match: (r) => `${r.matched.deps} dépôts sur ${r.matched.of} reliés à leur facture · ${r.matched.paid} factures payées`,
        tax: (r) => `TPS nette ${cents(r.taxes.gstNet)} · TVQ nette ${cents(r.taxes.qstNet)}`,
        journal: (r) => `${r.journal.length} écritures · débits = crédits (${cents(r.totals.dr)})`,
        check: (r) => (!r.balance ? 'Pas de colonne Solde : vérification du solde sautée'
          : r.balance.ok ? `Solde bancaire vérifié : ${cents(r.balance.opening)} → ${cents(r.balance.closing)}` : 'Le solde ne suit pas : une ligne manque peut-être'),
      },
      tag: { lowconf: 'Pas sûr', duplicate: 'Deux fois ?', outlier: 'Montant inhabituel', deposit: 'Dépôt', partial: 'Paiement partiel', gap: 'Ligne manquante', unknown: 'Nouveau fournisseur' },
      rv: {
        duplicate: [(x) => `Même montant, même fournisseur, déjà payé le ${day(x.twin)}. Facturé deux fois ?`, [['Oui, deux fois', { account: 1250 }], ['Non, les deux sont bons', { ok: true }]]],
        outlier: [(x) => `${x.times} fois plus que d'habitude pour ce compte. Un achat d'équipement ?`, [["C'est de l'équipement", { account: 1500 }], ['Le montant est bon', { ok: true }]]],
        deposit: [() => "Un dépôt sans facture. C'est quoi ?", [['Une vente', { account: 4000 }], ["L'argent du propriétaire", { account: 2700 }]]],
        partial: [(x) => `Paiement partiel de la facture ${x.inv} (${cents(x.total)}). Il reste ${cents(x.left)} à recevoir.`, [['Compris', { ok: true }]]],
        gap: [(x) => `Le solde saute de ${cents(x.amount)} entre le ${day(x.after)} et le ${day(x.before)} : une ligne manque peut-être au relevé.`, [['Compris', { ok: true }]]],
        unknown: [() => 'Je ne connais pas ce fournisseur. Choisis le compte, je vais m’en souvenir.', []],
        lowconf: [(x) => `Classé dans ${x.tx.account} · ${acctName(x.tx.account)} avec ${Math.round(x.tx.conf * 100)} % de confiance. Vérifie une fois.`, [['C’est le bon compte', { ok: true }]]],
      },
      account: 'Compte', save: 'Enregistrer',
      pnl: { revenue: 'Revenus', spent: 'Dépenses' },
      tax: { sales: 'Ventes avant taxes · ligne 101', gst: 'TPS perçue · 103', itc: 'CTI · 106', gstNet: 'TPS nette · 109', qst: 'TVQ perçue · 203', itr: 'RTI · 206', qstNet: 'TVQ nette · 209' },
      notDue: 'pas encore due',
      dl: { journal: 'Écritures de journal', bank: 'Banque classée', taxes: 'Déclaration TPS/TVQ', trial: 'Balance de vérification' },
      copy: 'Copier le résumé pour le client', again: "Recommencer avec d'autres fichiers",
      summary: (c, p, r) => `Bonjour ${c},\n\nVoici ${p} : revenus ${money(r.pnl.revenue)}, dépenses ${money(r.pnl.spent)}, ${r.pnl.profit < 0 ? 'perte nette' : 'bénéfice net'} de ${money(Math.abs(r.pnl.profit))}.\n`
        + `TPS/TVQ ${r.taxes.net < 0 ? 'à recevoir' : 'à remettre'} : ${cents(Math.abs(r.taxes.net))}, avant le ${day(r.taxes.due)}.\nVos clients vous doivent encore ${money(owedTotal(r))}.\n\nBonne journée !`,
      toastDone: (n) => (n ? `Fait. ${n} chose${n > 1 ? 's' : ''} à vérifier` : 'Fait. Les livres sont prêts'),
      toastSaved: 'Enregistré', toastLearned: (v) => `Retenu pour la prochaine fois : ${v}`, toastCopied: 'Résumé copié', toastNoCopy: 'Sélectionne le texte pour le copier',
      note: (n) => (n ? `Pilote auto : ${n} à vérifier` : 'Livres faits par le pilote auto'),
    },
  },
  en: {
    home: 'Folio home', language: 'Language', sections: 'Sections', dark: 'Dark mode', light: 'Light mode',
    nav: { today: 'Today', calendar: 'Calendar', clients: 'Clients', auto: 'Autopilot', review: 'Review', money: 'Money', close: 'Month-end', engine: 'Engine', deadlines: 'Deadlines' },
    kicker: 'For Québec CPAs and accounting firms',
    landTitle: 'From bank statement to signed financial statements.',
    landLead: 'Folio runs every engagement in the firm: bookkeeping, compilation and review engagements, T2/CO-17 and T1/TP-1. Autopilot prepares, the reviewer checks, the partner signs. Time, WIP and every CRA and Revenu Québec date for the portfolio in one place.',
    open: 'See my day', how: 'How it works',
    benefits: [
      ['wand-sparkles', 'Autopilot prepares, you review', 'Statement and invoices in: sorting, matching, GST/QST, journal entries. Only the exceptions come back to you.'],
      ['shield-check', 'Every decision shows its reason', 'Rule, learned vendor, matched invoice: all shown, fixable, approvable in batches, then signed by preparer and reviewer.'],
      ['briefcase', 'Every engagement, from letter to issue', 'Engagement letter, independence, client documents, year-end file, sign-offs, time and WIP: the whole firm on one screen.'],
      ['calendar-days', 'One calendar for the whole client list', 'GST/QST, source deductions, instalments, T2/CO-17, T4/RL-1: worked out from each client profile, exportable to your calendar.'],
    ],
    peek: { cats: [['Hydro-Québec', 'Utilities'], ['Bell', 'Phone'], ['RONA', 'Supplies']], due: 'GST/QST', dueSub: 'Café Mistral · in 8 days',
      files: [['CM', 'Café Mistral', 'To do', 'amber'], ['TN', 'Transports Nordet', 'Ready', '']], close: 'September close' },
    demo: 'Demo mockup · fake data · nothing is sent',
    phRow1: '3 exceptions · Atelier Boréal', phRow2: 'GST/QST · Café Mistral', phRow3: 'Tie-outs pass', phBtn: 'Sign as reviewer',
    todayTitle: 'Today', morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening',
    leftToday: (n) => (n ? `thing${n > 1 ? 's' : ''} to do today` : 'All done for today. Well done!'),
    allDone: 'Enjoy your evening.',
    deadlines: 'Deadlines', deadlinesLead: 'Dates to meet with the CRA and Revenu Québec.', later: 'Next', nothingDue: 'No deadlines waiting.',
    clients: 'Clients', money: 'Money', owed: 'Clients owe you',
    onTime: (a) => `${a} on time`, lateAmt: (a) => `${a} late`, chase: 'Invoices to follow up',
    bankLine: (n) => (n ? `${n} bank transactions to match` : 'All transactions are matched'),
    bankHint: 'Match = link each payment to its invoice.',
    matchBtn: (r) => (r ? `I checked the last ${r}` : 'Match them for me'), matchDone: 'Done',
    closeTitle: (m) => `Month-end: ${m}`, closeLead: 'Tick each step when it is done.', ofN: (a, b) => `${a} of ${b}`,
    filters: { action: 'To do', progress: 'In progress', done: 'Ready' },
    done: 'Done', filedBtn: 'Mark as filed', fileLabel: (x) => `Mark “${x}” as filed`,
    today: 'today', inDays: (d) => `in ${d} day${d > 1 ? 's' : ''}`, late: (d) => `${d} days late`,
    pct: (n) => `${n}% done`, ask: 'Ask for documents', asked: 'Request sent', ready: 'Mark as ready', allReady: 'File ready. Nothing to do.',
    remind: (c) => `Send a reminder to ${c}`, reminded: 'Reminder sent', unpaid: (d) => `unpaid for ${d} days`,
    tasks: {
      review: ['Review', 'Review and sign off the file', (c) => `${c} · exceptions, tie-outs, preparer and reviewer sign-off.`, 'Open the review'],
      week: ['This week', 'Deadlines in the next 7 days', (n) => `${n} to file for your clients · see the calendar`, 'Open the calendar'],
      auto: ['Autopilot', "Do this month's books", (c) => `${c} · drop the statement and invoices, Folio does the rest.`, 'Open Autopilot'],
      payroll: ['Done', "Record this week's payroll", () => 'Done this morning, 7 employees', ''],
      late: ['Late', 'File the GST/QST for Café Mistral', (d) => `Last month's sales tax · ${d} days late`, 'Mark as filed'],
      remind: ['Follow up', 'Follow up with Transports Nordet', (a) => `Invoice H-2291 · ${a} unpaid for 47 days`, 'Send a reminder'],
      match: ['Bank', 'Match bank transactions', (n) => `${n} payments to link to their invoice. Folio can do it for you.`, 'Match them for me'],
    },
    toastFiled: 'Marked as filed', toastRemind: (c) => `Reminder sent to ${c}`, toastMatch: (n, r) => `${n} matched · ${r} to check`,
    toastMatched: 'Bank up to date', toastAsk: (c) => `Request sent to ${c}`, toastReady: (c) => `${c} is ready`, toastClose: 'Month closed. Well done!',
    undo: 'Undo', undone: 'Undone',
    allDeadlines: 'All deadlines',
    autoTitle: 'Autopilot',
    autoLead: 'Give me the bank statement and the invoice list. I do the bookkeeping; you only check what I show you.',
    auto: {
      whose: 'Whose books?', drop: 'Drop your files here',
      dropHint: 'Bank statement and invoices as CSV (in Excel: Save as → CSV). Nothing leaves your device.',
      pick: 'Choose files', sample: 'Try with sample files',
      kinds: { bank: 'Bank statement', invoices: 'Invoices', unknown: 'Not recognized' }, rows: (n) => `${n} line${n > 1 ? 's' : ''}`,
      nobank: 'I need at least one bank statement: columns Date, Description and Amount (or Withdrawal and Deposit).',
      steps: { read: 'Reading the files', sort: 'Sorting the expenses', match: 'Matching payments to invoices', tax: 'Working out GST and QST', journal: 'Writing the journal entries', check: 'Checking the results' },
      need: (n) => (n ? `thing${n > 1 ? 's' : ''} to check` : 'The books are ready.'),
      did: (n) => `${n} transactions done for you`,
      profit: (p) => (p < 0 ? 'Net loss this month' : 'Net profit this month'), taxes: (n) => (n < 0 ? 'Sales tax refund' : 'Sales tax to pay'),
      by: (d) => `by ${d}`, matched: 'Payments matched',
      checkH: 'Please check', didH: 'What I did', pnlH: 'Profit and loss', taxH: 'GST and QST', owedH: 'Who still owes money', filesH: 'Ready files',
      log: {
        read: (r) => `Read ${r.bank.length} bank transactions and ${r.invoices} invoices`,
        sort: (r) => `Sorted ${r.sorted.auto} of ${r.sorted.outs} expenses on my own`,
        match: (r) => `Linked ${r.matched.deps} of ${r.matched.of} deposits to their invoice · ${r.matched.paid} invoices paid`,
        tax: (r) => `Net GST ${cents(r.taxes.gstNet)} · net QST ${cents(r.taxes.qstNet)}`,
        journal: (r) => `${r.journal.length} journal entries · debits = credits (${cents(r.totals.dr)})`,
        check: (r) => (!r.balance ? 'No Balance column: balance check skipped'
          : r.balance.ok ? `Bank balance checks out: ${cents(r.balance.opening)} → ${cents(r.balance.closing)}` : 'The balance does not add up: a line may be missing'),
      },
      tag: { lowconf: 'Not sure', duplicate: 'Twice?', outlier: 'Unusual amount', deposit: 'Deposit', partial: 'Part payment', gap: 'Missing line', unknown: 'New vendor' },
      rv: {
        duplicate: [(x) => `Same amount, same vendor, already paid on ${day(x.twin)}. Charged twice?`, [['Yes, twice', { account: 1250 }], ['No, both are real', { ok: true }]]],
        outlier: [(x) => `${x.times} times the usual for this account. An equipment purchase?`, [["It's equipment", { account: 1500 }], ['The amount is right', { ok: true }]]],
        deposit: [() => 'A deposit with no invoice. What is it?', [['A sale', { account: 4000 }], ["The owner's money", { account: 2700 }]]],
        partial: [(x) => `Part payment of invoice ${x.inv} (${cents(x.total)}). ${cents(x.left)} still to collect.`, [['Got it', { ok: true }]]],
        gap: [(x) => `The balance jumps by ${cents(x.amount)} between ${day(x.after)} and ${day(x.before)}: a line may be missing from the statement.`, [['Got it', { ok: true }]]],
        unknown: [() => "I don't know this vendor. Pick the account and I'll remember it.", []],
        lowconf: [(x) => `Sorted to ${x.tx.account} · ${acctName(x.tx.account)} at ${Math.round(x.tx.conf * 100)}% confidence. Check it once.`, [['Right account', { ok: true }]]],
      },
      account: 'Account', save: 'Save',
      pnl: { revenue: 'Revenue', spent: 'Expenses' },
      tax: { sales: 'Sales before tax · line 101', gst: 'GST collected · 103', itc: 'ITCs · 106', gstNet: 'Net GST · 109', qst: 'QST collected · 203', itr: 'ITRs · 206', qstNet: 'Net QST · 209' },
      notDue: 'not due yet',
      dl: { journal: 'Journal entries', bank: 'Sorted bank', taxes: 'GST/QST return', trial: 'Trial balance' },
      copy: 'Copy the summary for the client', again: 'Start over with other files',
      summary: (c, p, r) => `Hello ${c},\n\nHere is ${p}: revenue ${money(r.pnl.revenue)}, expenses ${money(r.pnl.spent)}, ${r.pnl.profit < 0 ? 'a loss' : 'a profit'} of ${money(Math.abs(r.pnl.profit))}.\n`
        + `GST/QST ${r.taxes.net < 0 ? 'to get back' : 'to pay'}: ${cents(Math.abs(r.taxes.net))}, by ${day(r.taxes.due)}.\nYour customers still owe you ${money(owedTotal(r))}.\n\nHave a good day!`,
      toastDone: (n) => (n ? `Done. ${n} thing${n > 1 ? 's' : ''} to check` : 'Done. The books are ready'),
      toastSaved: 'Saved', toastLearned: (v) => `Remembered for next time: ${v}`, toastCopied: 'Summary copied', toastNoCopy: 'Select the text to copy it',
      note: (n) => (n ? `Autopilot: ${n} to check` : 'Books done by Autopilot'),
    },
  },
};

const CLIENTS = [
  { id: 'mistral', short: 'Mistral', profile: { type: 'corp', gst: 'monthly', fye: 12, payroll: true, inst: 'monthly' }, team: 'JT · MB', name: 'Café Mistral', close: 35, status: 'action', note: { fr: 'Il manque 3 reçus de septembre', en: '3 September receipts missing' } },
  { id: 'nordet', short: 'Nordet', profile: { type: 'corp', gst: 'quarterly', fye: 3, payroll: true, inst: 'quarterly' }, team: 'AL · MB', name: 'Transports Nordet', close: 20, status: 'action', note: { fr: 'Relevé bancaire à recevoir', en: 'Bank statement to receive' } },
  { id: 'boreal', short: 'Boréal', profile: { type: 'corp', gst: 'monthly', fye: 12, payroll: true, inst: 'quarterly' }, team: 'JT · MB', name: 'Atelier Boréal', close: 80, status: 'progress', note: { fr: 'Presque fini', en: 'Almost done' } },
  { id: 'pins', short: 'Deux-Pins', profile: { type: 'corp', gst: 'annual', fye: 6, payroll: false, inst: 'quarterly' }, team: 'AL · SG', name: 'Érablière Deux-Pins', close: 60, status: 'progress', note: { fr: 'Inventaire de sirop à confirmer', en: 'Syrup inventory to confirm' } },
  { id: 'verveine', short: 'Verveine', profile: { type: 'sole', gst: 'quarterly', fye: 12, payroll: true }, team: 'JT · SG', name: 'Ferme Verveine', close: 55, status: 'progress', note: { fr: 'Subvention à inscrire', en: 'Grant to record' } },
  { id: 'lumen', short: 'Lumen', profile: { type: 'corp', gst: 'monthly', fye: 9, payroll: true, inst: 'monthly' }, team: 'AL · MB', name: 'Clinique Lumen', close: 100, status: 'done', note: { fr: 'États financiers envoyés', en: 'Financial statements sent' } },
  { id: 'cobalt', short: 'Cobalt', profile: { type: 'sole', gst: 'annual', fye: 12, payroll: false }, team: 'JT · SG', name: 'Studio Cobalt', close: 100, status: 'done', note: { fr: 'Déclaration prête à signer', en: 'Tax return ready to sign' } },
];

const state = {
  myClients: [], // added by hand (clients-add.js)
  lang: 'fr',
  theme: 'light',
  route: 'home',
  filter: 'action',
  open: null,
  asked: new Set(),
  filed: new Set(),
  chase: [
    { id: 'h2291', client: 'Transports Nordet', no: 'H-2291', amount: 4850, days: 47, sent: false },
    { id: 'h2304', client: 'Café Mistral', no: 'H-2304', amount: 1260, days: 33, sent: false },
    { id: 'h2318', client: 'Ferme Verveine', no: 'H-2318', amount: 2140, days: 19, sent: false },
    { id: 'h2330', client: 'Atelier Boréal', no: 'H-2330', amount: 980, days: 8, sent: false },
  ],
  bank: { total: 353, matched: 299, review: 10 },
  auto: { client: 'boreal', files: [], result: null, busy: false, step: -1, decisions: {}, memory: {}, before: null, open: [] },
  checks: [
    { fr: 'Relevés bancaires reçus', en: 'Bank statements received', on: true },
    { fr: 'Banque reliée', en: 'Bank matched', auto: true },
    { fr: 'Paies inscrites', en: 'Payroll recorded', on: true },
    { fr: 'Factures du mois inscrites', en: "Month's invoices recorded", on: false },
    { fr: 'Taxes TPS/TVQ vérifiées', en: 'GST/QST checked', on: false },
    { fr: 'Amortissement calculé', en: 'Depreciation calculated', on: false },
    { fr: 'Révision finale', en: 'Final review', on: false },
  ],
};
try { // per-viewer conveniences only
  const saved = JSON.parse(localStorage.getItem('solva-v3') || '{}');
  if (saved.lang in T) state.lang = saved.lang;
  if (saved.theme === 'dark' || saved.theme === 'light') state.theme = saved.theme;
} catch (e) { /* storage blocked: defaults are fine */ }
function save() { try { localStorage.setItem('solva-v3', JSON.stringify({ lang: state.lang, theme: state.theme })); } catch (e) { /* ignore */ } }

const $ = (s) => document.querySelector(s);
const t = () => T[state.lang];
const loc = () => (state.lang === 'fr' ? 'fr-CA' : 'en-CA');
const money = (n) => new Intl.NumberFormat(loc(), { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n);
const cents = (n) => new Intl.NumberFormat(loc(), { style: 'currency', currency: 'CAD' }).format(n);
const day = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString(loc(), { day: 'numeric', month: 'long' });
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); // file contents go into HTML
const SVG = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
  + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';
function icons() { // swap <i data-lucide> for inline SVG from assets/icons.js: no CDN, nothing pops in late
  document.querySelectorAll('i[data-lucide]').forEach((i) => {
    const name = i.dataset.lucide;
    i.outerHTML = `<svg class="lucide lucide-${name}" ${SVG}>${(window.ICONS || {})[name] || ''}</svg>`;
  });
}
// controls are rebuilt on every render; these data-* keys find the same control again so focus never drops to <body>
const FOCUS_KEYS = [...FIRM_FOCUS, 'lang', 'themeToggle', 'filter', 'file', 'open', 'ask', 'ready', 'chase', 'match', 'check', 'task', 'client', 'dl', 'copy', 'pick', 'sample', 'rvRole', 'rvFilter', 'rvAll', 'rvMark', 'rvSel', 'rvAcct', 'rvSign', 'rvUnsign', 'rvWho', 'rvExplain', 'set', 'ruleRe', 'ruleAcct', 'ruleDel', 'mem', 'calNav', 'calKind', 'calDay', 'calDone', 'calClient', 'tour'];
function focusedKey() {
  const el = document.activeElement;
  const k = el && el.dataset && FOCUS_KEYS.find((key) => key in el.dataset);
  return k ? [k, el.dataset[k]] : null;
}
const attr = (k) => k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

/* ---------- deadlines: real CRA / Revenu Québec rules, dated from today ---------- */
const DAY = 864e5;
const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
const monthEnd = (y, m) => new Date(y, m + 1, 0);
function businessDay(d) { // a due date on a weekend moves to the next business day
  const x = new Date(d);
  while (x.getDay() === 0 || x.getDay() === 6) x.setDate(x.getDate() + 1);
  return x;
}
function next15() {
  const d = new Date(TODAY.getFullYear(), TODAY.getMonth(), 15);
  if (d < TODAY) d.setMonth(d.getMonth() + 1);
  return d;
}
function nextQuarterReturn() { // quarterly filers: last day of the month after each calendar quarter
  for (let i = 0; i < 4; i++) {
    const d = monthEnd(TODAY.getFullYear(), TODAY.getMonth() + i);
    if (d.getMonth() % 3 === 0 && d >= TODAY) return d;
  }
  return monthEnd(TODAY.getFullYear(), TODAY.getMonth() + 3);
}
const nextFeb28 = () => new Date(TODAY.getMonth() >= 2 ? TODAY.getFullYear() + 1 : TODAY.getFullYear(), 2, 0);
const DEADLINES = [
  { id: 'late', fr: ['Taxes de vente · Café Mistral', 'TPS/TVQ du mois dernier'], en: ['Sales tax · Café Mistral', "Last month's GST/QST"],
    due: monthEnd(TODAY.getFullYear(), TODAY.getMonth() - 1) },
  { id: 'das', fr: ['Retenues sur les paies', 'Impôt retenu sur les paies (DAS) · 5 clients'], en: ['Payroll deductions', 'Tax held from paycheques · 5 clients'], due: next15() },
  { id: 'gst', fr: ['Taxes de vente du trimestre', 'TPS/TVQ · 4 clients'], en: ['Quarterly sales tax', 'GST/QST · 4 clients'], due: nextQuarterReturn() },
  { id: 'inst', fr: ["Acomptes d'impôt", 'Paiements mensuels des sociétés · 3 clients'], en: ['Tax instalments', 'Monthly corporate payments · 3 clients'],
    due: monthEnd(TODAY.getFullYear(), TODAY.getMonth()) },
  { id: 't2', fr: ['Déclaration · Studio Cobalt', 'Impôt des sociétés (T2 + CO-17)'], en: ['Tax return · Studio Cobalt', 'Corporate tax (T2 + CO-17)'],
    due: monthEnd(TODAY.getFullYear(), TODAY.getMonth() + 2) },
  { id: 't4', fr: ["Relevés de fin d'année", 'T4 et RL-1 · 6 clients'], en: ['Year-end slips', 'T4 and RL-1 · 6 clients'], due: nextFeb28() },
].map((d) => ({ ...d, due: businessDay(d.due) })).sort((a, b) => a.due - b.due);
Object.assign(state, deskInit()); // desk.js: settings, review, calendar
Object.assign(state, firmInit()); // firm-data.js: engagements, time, requests, year-end file
['fr', 'en'].forEach((l) => { Object.assign(T[l].nav, TF[l].nav); Object.assign(T[l].tasks, TF[l].tasks); });
deskSeed();
const daysTo = (d) => Math.round((d - TODAY) / DAY);
const whenText = (days) => (days < 0 ? t().late(-days) : days === 0 ? t().today : t().inDays(days));

/* ---------- derived ---------- */
const unmatched = () => state.bank.total - state.bank.matched;
const checkOn = (c) => (c.auto ? unmatched() === 0 : c.on);
const closeDone = () => state.checks.filter(checkOn).length;
const TASKS = [
  { id: 'review', done: () => !!state.rv.sign.rev, arg: () => CLIENTS.find((c) => c.id === state.auto.client).name, tone: 'amber' },
  { id: 'week', done: () => upcoming(7).every((e) => state.filed.has(e.id)), arg: () => upcoming(7).filter((e) => !state.filed.has(e.id)).length, tone: '' },
  { id: 'auto', done: () => !!state.auto.result?.ok && !state.auto.result.review.length, arg: () => CLIENTS.find((c) => c.id === state.auto.client).name, tone: '' },
  { id: 'payroll', done: () => true, arg: () => '', tone: '' }, // already done this morning, so the ring never starts empty
  { id: 'late', done: () => state.filed.has('late'), arg: () => -daysTo(DEADLINES.find((d) => d.id === 'late').due), tone: 'red' },
  { id: 'remind', done: () => !state.chase[0] || !!state.chase[0].sent, arg: () => money(4850), tone: 'amber' },
  { id: 'match', done: () => unmatched() <= state.bank.review, arg: () => unmatched(), tone: '' },
];
TASKS.unshift(...firmTasks()); // the firm's own work comes first

/* ---------- render ---------- */
function renderShell() {
  document.documentElement.lang = loc();
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.classList.toggle('is-home', state.route === 'home');
  document.title = state.route === 'home' ? 'Folio' : `${t().nav[state.route]} · Folio`;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t()[el.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-tp]').forEach((el) => { el.textContent = getP(tp(), el.dataset.i18nTp); });
  document.querySelectorAll('[data-i18n-label]').forEach((el) => el.setAttribute('aria-label', t()[el.dataset.i18nLabel]));
  document.querySelectorAll('.seg [data-lang]').forEach((b) => {
    const on = b.dataset.lang === state.lang;
    b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1;
  });
  const dark = state.theme === 'dark';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#0e0d0c' : '#f6f4f0';
  const tb = $('#themeBtn');
  tb.innerHTML = `<i data-lucide="${dark ? 'sun' : 'moon'}"></i>`;
  tb.setAttribute('aria-label', dark ? t().light : t().dark);
  // computer first: every section in the side bar; a phone keeps 4 + "More"
  const NAV = { today: 'sun', engagements: 'briefcase', calendar: 'calendar-days', review: 'shield-check', yearend: 'folder-open', requests: 'inbox', time: 'timer', clients: 'users', auto: 'wand-sparkles', money: 'wallet', close: 'list-checks', engine: 'sliders-horizontal', more: 'layout-grid' };
  const PHONE = ['today', 'engagements', 'calendar', 'review', 'more'];
  const cur = (id) => state.route === id || (id === 'calendar' && state.route === 'deadlines');
  const GROUP = { today: 0, yearend: 1, clients: 2 }; // side-bar headings on a computer
  $('.nav').innerHTML = Object.entries(NAV).map(([id, ic]) => `${id in GROUP ? `<span class="nav-h wide-only" aria-hidden="true">${tf().navGroups[GROUP[id]]}</span>` : ''}<a href="#/${id}" class="${id === 'more' ? 'phone-only' : PHONE.includes(id) ? '' : 'wide-only'}" ${cur(id) ? 'aria-current="page"' : ''}>
    <i data-lucide="${ic}"></i><span>${t().nav[id]}</span></a>`).join('');
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('on', s.dataset.screen === state.route));
}

function renderHome() {
  const pk = t().peek;
  const due = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 8);
  const peeks = [ // a small look at each screen, fake data
    pk.cats.map(([v, c]) => `<span><i data-lucide="circle-check"></i><em>${v}</em><span class="muted">${c}</span></span>`).join(''),
    `<span class="due"><span class="date"><b>${due.getDate()}</b><small>${due.toLocaleDateString(loc(), { month: 'short' }).replace('.', '')}</small></span>
      <span><b>${pk.due}</b><small class="muted">${pk.dueSub}</small></span></span>`,
    pk.files.map(([a, n, st, c]) => `<span><span class="avatar">${a}</span><em>${n}</em><span class="pill ${c}">${st}</span></span>`).join(''),
    `<span class="bar-row"><span>${pk.close}</span><span class="num">3 / 5</span></span><span class="progress"><span style="width:60%"></span></span>`,
  ];
  $('#how').innerHTML = t().benefits.map(([ic, b, p], i) => `<li><div class="peek" aria-hidden="true">${peeks[i]}</div>
    <div><b><i data-lucide="${ic}"></i>${b}</b><p>${p}</p></div></li>`).join('');
  $('#phDate').textContent = TODAY.toLocaleDateString(loc(), { weekday: 'long', day: 'numeric', month: 'long' });
}

function renderToday() {
  const h = new Date().getHours();
  $('#greet').textContent = h >= 18 ? t().evening : state.lang === 'en' && h >= 12 ? t().afternoon : t().morning;
  $('#date').textContent = TODAY.toLocaleDateString(loc(), { weekday: 'long', day: 'numeric', month: 'long' });
  const left = TASKS.filter((x) => !x.done()).length;
  $('#todayCount').textContent = left || '✓';
  $('#todayLine').textContent = t().leftToday(left);
  $('#ring').style.strokeDashoffset = 314.16 * (left / TASKS.length);
  // late first, done last; only the first open task gets the filled button (one primary per screen)
  const rank = (x) => (x.done() ? 2 : x.tone === 'red' ? 0 : 1);
  $('#tasks').innerHTML = [...TASKS].sort((a, b) => rank(a) - rank(b)).map((x, i) => {
    const [tag, title, desc, btn] = t().tasks[x.id];
    const done = x.done();
    return `<li class="card task ${done ? 'done' : ''}">
      <span class="pill ${done ? '' : x.tone}">${done ? t().done : tag}</span>
      <b>${title}</b><p>${desc(x.arg())}</p>
      <button class="btn ${done ? '' : i ? 'soft' : 'primary'} block" data-task="${x.id}" ${done ? 'aria-disabled="true"' : ''}>
        <i data-lucide="${done ? 'circle-check' : x.icon || x.id === 'remind' ? 'mail' : x.id === 'match' || x.id === 'auto' ? 'wand-sparkles' : x.id === 'review' ? 'shield-check' : x.id === 'week' ? 'calendar-days' : 'check'}"></i>${done ? t().done : btn}</button></li>`;
  }).join('');
}

function dateTile(d) {
  return `<span class="date"><b class="num">${d.getDate()}</b><small>${d.toLocaleDateString(loc(), { month: 'short' }).replace('.', '')}</small></span>`;
}
function renderDeadlines() {
  const open = DEADLINES.filter((d) => !state.filed.has(d.id));
  const next = open[0];
  $('#dlNext').innerHTML = next ? `<div class="card next-card ${daysTo(next.due) < 0 ? 'late' : ''}">
      <div class="top">${dateTile(next.due)}<div><b>${next[state.lang][0]}</b><p>${next[state.lang][1]}</p></div></div>
      <p><span class="pill ${daysTo(next.due) < 0 ? 'red' : daysTo(next.due) <= 10 ? 'amber' : ''}">${whenText(daysTo(next.due))}</span></p><br>
      <button class="btn primary block" data-file="${next.id}"><i data-lucide="check"></i>${t().filedBtn}</button></div>`
    : `<div class="card empty"><i data-lucide="party-popper"></i><p>${t().nothingDue}</p></div>`;
  $('#dlList').innerHTML = DEADLINES.filter((d) => d !== next).map((d) => {
    const done = state.filed.has(d.id), days = daysTo(d.due);
    return `<li class="row ${done ? 'done' : ''} ${!done && days < 0 ? 'late' : ''}">${dateTile(d.due)}
      <div><b>${d[state.lang][0]}</b><small>${done ? t().done : whenText(days)} · ${d[state.lang][1]}</small></div>
      <button class="round" aria-pressed="${done}" aria-label="${t().fileLabel(d[state.lang][0])}" data-file="${d.id}"><i data-lucide="check"></i></button></li>`;
  }).join('');
}

function renderClients() {
  $('#clientFilter').innerHTML = Object.entries(t().filters).map(([k, label]) => `
    <button role="radio" aria-checked="${k === state.filter}" tabindex="${k === state.filter ? 0 : -1}" data-filter="${k}">${label}<span class="count num">${CLIENTS.filter((c) => c.status === k).length}</span></button>`).join('');
  $('#files').innerHTML = CLIENTS.filter((c) => c.status === state.filter).map((c) => {
    const open = state.open === c.id;
    const action = c.status === 'action'
      ? `<button class="btn ${state.asked.has(c.id) ? 'soft' : 'primary'} block" data-ask="${c.id}" ${state.asked.has(c.id) ? 'aria-disabled="true"' : ''}>
          <i data-lucide="${state.asked.has(c.id) ? 'circle-check' : 'send'}"></i>${state.asked.has(c.id) ? t().asked : t().ask}</button>`
      : c.status === 'progress' ? `<button class="btn soft block" data-ready="${c.id}"><i data-lucide="check"></i>${t().ready}</button>`
      : `<p class="muted">${t().allReady}</p>`;
    return `<li class="row file">
      <button class="file-head" aria-expanded="${open}" aria-controls="f-${c.id}" data-open="${c.id}">
        <span class="avatar" aria-hidden="true">${c.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
        <div><b>${c.name}</b><small>${c.note[state.lang]}</small></div><i data-lucide="chevron-down"></i></button>
      <div class="file-body" id="f-${c.id}" ${open ? '' : 'hidden'}>
        ${profileHtml(c)}
        <div class="meter"><span class="progress" role="progressbar" aria-valuenow="${c.close}" aria-valuemin="0" aria-valuemax="100" aria-label="${c.name}">
          <span style="width:${c.close}%"></span></span><span class="num">${t().pct(c.close)}</span></div>${action}</div></li>`;
  }).join('');
}

function profileHtml(c) {
  const P = tp().prof, n = nextDue(c), fye = new Date(2026, c.profile.fye - 1, 1).toLocaleDateString(loc(), { month: 'long' });
  return `<ul class="kv prof">${kv(P.freq, tp().eng.freq[c.profile.gst])}${kv(P.fye, fye)}${n ? kv(P.next, `${day(isoOf(n.date))} · ${esc(n.text)}`) : ''}${kv(P.team, c.team)}</ul>
    <button class="link" data-cal-go="${c.id}"><i data-lucide="calendar-days"></i>${tp().cal.open}</button>`;
}

function renderMoney() {
  const open = state.chase.filter((c) => !c.sent);
  const total = state.chase.reduce((s, c) => s + c.amount, 0);
  const late = state.chase.filter((c) => c.days > 30).reduce((s, c) => s + c.amount, 0);
  $('#owed').textContent = money(total);
  $('#split').innerHTML = `<span style="flex:${total - late};background:var(--ring)"></span><span style="flex:${late};background:var(--red)"></span>`;
  $('#onTime').textContent = t().onTime(money(total - late));
  $('#lateAmt').textContent = t().lateAmt(money(late));
  $('#split').setAttribute('aria-label', `${t().onTime(money(total - late))}, ${t().lateAmt(money(late))}`);
  $('#chaseList').innerHTML = state.chase.map((c) => `
    <li class="row ${c.days > 30 && !c.sent ? 'late' : ''}">
      <div><b>${c.client}</b><small>${c.sent ? t().reminded : `${money(c.amount)} · ${t().unpaid(c.days)}`}</small></div>
      <button class="round" aria-pressed="${c.sent}" aria-label="${t().remind(c.client)}" data-chase="${c.id}" ${c.sent ? 'aria-disabled="true"' : ''}>
        <i data-lucide="${c.sent ? 'check' : 'mail'}"></i></button></li>`).join('');
  $('#bankLine').textContent = t().bankLine(unmatched());
  const left = unmatched();
  const mb = $('#matchBtn');
  mb.className = `btn ${left ? 'primary' : 'soft'}`;
  mb.innerHTML = left ? `<i data-lucide="wand-sparkles"></i>${t().matchBtn(left <= state.bank.review ? left : 0)}` : `<i data-lucide="circle-check"></i>${t().matchDone}`;
  mb.toggleAttribute('aria-disabled', !left);
}

function renderClose() {
  const month = new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, 1).toLocaleDateString(loc(), { month: 'long' });
  $('#closeTitle').textContent = t().closeTitle(month);
  const done = closeDone(), n = state.checks.length;
  $('#closeCount').textContent = t().ofN(done, n);
  $('#closeBar').setAttribute('aria-valuenow', Math.round((done / n) * 100));
  $('#closeBar').setAttribute('aria-label', t().closeTitle(month));
  $('#closeBar > span').style.width = (done / n) * 100 + '%';
  $('#checks').innerHTML = state.checks.map((c, i) => `
    <li><button class="check" role="checkbox" aria-checked="${checkOn(c)}" data-check="${i}">
      <span class="box"><i data-lucide="check"></i></span><span>${c[state.lang]}
      ${c.auto ? `<small>${unmatched() ? t().bankLine(unmatched()) : t().bankLine(0)}</small>` : ''}</span></button></li>`).join('');
}

/* ---------- autopilot screen ---------- */
const STEPS = ['read', 'sort', 'match', 'tax', 'journal', 'check'];
const owedTotal = (r) => r.owed.reduce((s, o) => s + o.left, 0);
const acctName = (a) => FolioEngine.ACCOUNTS[a][state.lang === 'en' ? 1 : 0];
const periodName = (p) => new Date(+p.slice(0, 4), +p.slice(5, 7) - 1, 1).toLocaleDateString(loc(), { month: 'long', year: 'numeric' });
const kv = (k, v, cls = '') => `<li class="${cls}"><span>${k}</span><b class="num">${v}</b></li>`;
const more = (id, title, body) => `<details class="card more" data-more="${id}" ${state.auto.open.includes(id) ? 'open' : ''}><summary>${title}</summary>${body}</details>`;
function reviewCard(x) {
  const A = t().auto, [text, opts] = A.rv[x.type];
  const head = x.tx ? `<b>${esc(x.tx.desc)}</b><small>${day(x.tx.date)} · <span class="num">${cents(x.tx.amount)}</span></small>` : '';
  const acts = x.type === 'unknown'
    ? `<div class="pick"><label class="field"><span>${A.account}</span><select id="acct-${esc(x.id)}">${[...Object.keys(FolioEngine.ACCOUNTS).filter((a) => a >= 5000), '1500']
      .map((a) => `<option value="${a}">${a} · ${acctName(a)}</option>`).join('')}</select></label>
      <button class="btn primary" data-decide="${esc(x.id)}">${A.save}</button></div>`
    : `<div class="acts">${opts.map(([label], i) => `<button class="btn ${i ? 'soft' : 'primary'}" data-decide="${esc(x.id)}" data-opt="${i}">${label}</button>`).join('')}</div>`;
  return `<li class="card review"><span class="pill ${['partial', 'gap'].includes(x.type) ? '' : 'amber'}">${A.tag[x.type]}</span>${head}<p>${text(x)}</p>${acts}</li>`;
}
function renderAuto() {
  const a = state.auto, A = t().auto, r = a.result;
  const files = r ? r.files : a.files.map((f) => ({ name: f.name }));
  const chips = files.map((f) => `<li><i data-lucide="file-up"></i><span>${esc(f.name)}</span>${f.kind
    ? `<small class="pill ${f.kind === 'unknown' ? 'amber' : ''}">${A.kinds[f.kind]}${f.kind === 'unknown' ? '' : ' · ' + A.rows(f.rows)}</small>` : ''}</li>`).join('');
  $('#autoFeed').innerHTML = a.busy
    ? `<div class="card"><ul class="steps" aria-live="polite">${STEPS.map((s, i) => `<li class="${i < a.step ? 'done' : i === a.step ? 'on' : ''}"><span class="box"><i data-lucide="check"></i></span>${A.steps[s]}</li>`).join('')}</ul></div>`
    : r && r.ok ? '' : `<div class="card feed">
      <label class="field"><span>${A.whose}</span><select id="autoClient" data-client="1">${CLIENTS.map((c) => `<option value="${c.id}" ${c.id === a.client ? 'selected' : ''}>${c.name}</option>`).join('')}</select></label>
      <button class="drop" id="drop" data-pick="1"><i data-lucide="file-up"></i><b>${A.drop}</b><small>${A.dropHint}</small><span class="btn primary">${A.pick}</span></button>
      ${chips ? `<ul class="chips">${chips}</ul>` : ''}
      ${r && r.error ? `<p class="warn"><i data-lucide="triangle-alert"></i>${A.nobank}</p>` : ''}
      <button class="btn soft block" data-sample="1"><i data-lucide="sparkles"></i>${A.sample}</button></div>`;
  if (a.busy || !r || !r.ok) { $('#autoOut').innerHTML = ''; return; }
  const n = r.review.length, client = CLIENTS.find((c) => c.id === a.client).name, tx = r.taxes;
  $('#autoOut').innerHTML = `
    <div class="card answer" id="autoAnswer" tabindex="-1">
      <div><b class="huge num">${n || '✓'}</b><p>${A.need(n)}</p><small class="muted">${client} · ${periodName(r.period)} · ${A.did(r.bank.length + r.invoices)}</small></div></div>
    <ul class="stats">
      <li class="card"><small>${A.profit(r.pnl.profit)}</small><b class="num">${money(Math.abs(r.pnl.profit))}</b></li>
      <li class="card"><small>${A.taxes(tx.net)}</small><b class="num">${money(Math.abs(tx.net))}</b><small>${A.by(day(tx.due))}</small></li>
      <li class="card"><small>${A.matched}</small><b class="num">${r.matched.deps} / ${r.matched.of}</b></li>
    </ul>
    <a class="btn soft block to-review" href="#/review"><i data-lucide="shield-check"></i>${tp().review.title} · ${tp().review.lead}</a>
    ${n ? `<h2>${A.checkH}</h2><ul class="reviews">${r.review.map(reviewCard).join('')}</ul>` : ''}
    ${more('did', A.didH, `<ul class="did">${STEPS.map((s) => `<li><i data-lucide="circle-check"></i><span>${A.log[s](r)}</span></li>`).join('')}</ul>`)}
    ${more('pnl', `${A.pnlH}<span class="num">${money(r.pnl.profit)}</span>`, `<ul class="kv">${kv(A.pnl.revenue, cents(r.pnl.revenue))}
      ${r.pnl.expenses.map((e) => kv(acctName(e.acct), cents(-e.amount), 'sub')).join('')}${kv(A.profit(r.pnl.profit), cents(r.pnl.profit), 'total')}</ul>`)}
    ${more('tax', `${A.taxH}<span class="num">${money(tx.net)}</span>`, `<ul class="kv">${['sales', 'gst', 'itc', 'gstNet', 'qst', 'itr', 'qstNet']
      .map((k) => kv(A.tax[k], cents(tx[k]), k.endsWith('Net') ? 'total' : '')).join('')}<li class="sub"><span>${A.by(day(tx.due))}</span></li></ul>`)}
    ${r.owed.length ? more('owed', `${A.owedH}<span class="num">${money(owedTotal(r))}</span>`, `<ul class="kv">${r.owed.map((o) => kv(`${esc(o.client)} · ${esc(o.no)}<small>${o.late ? t().late(o.late) : A.notDue}</small>`, cents(o.left), o.late > 30 ? 'late' : '')).join('')}</ul>`) : ''}
    <h2>${A.filesH}</h2>
    <div class="dl">${Object.keys(A.dl).map((k) => `<button class="btn soft" data-dl="${k}"><i data-lucide="download"></i>${A.dl[k]}</button>`).join('')}</div>
    <div class="card summary"><p class="pre" id="sumText">${esc(A.summary(client, periodName(r.period), r))}</p>
      <button class="btn primary block" data-copy="1"><i data-lucide="copy"></i>${A.copy}</button></div>
    <button class="link again" data-reset="1"><i data-lucide="rotate-ccw"></i>${A.again}</button>`;
}

function render() {
  const focus = focusedKey();
  ClientsAdd.sync();
  renderShell(); renderHome(); renderToday(); renderDeadlines(); renderClients(); renderMoney(); renderClose(); renderAuto(); renderReview(); renderCalendar(); renderEngine(); renderFirm(); renderTour();
  ClientsAdd.after();
  icons();
  if (focus) document.querySelector(`[data-${attr(focus[0])}="${focus[1]}"]`)?.focus();
  Bind.flush(); // save what changed
}

/* ---------- toast with undo ---------- */
let toastTimer, undoFn = null;
function toast(msg, undo) {
  $('#toastMsg').textContent = msg;
  undoFn = undo || null;
  const u = $('#toastUndo');
  u.hidden = !undo; u.textContent = t().undo;
  $('#toast').classList.toggle('plain', !undo);
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), undo ? 5000 : 2600);
}
$('#toastUndo').addEventListener('click', () => {
  if (undoFn) { undoFn(); undoFn = null; render(); }
  toast(t().undone);
});

/* ---------- actions ---------- */
const closedNow = () => closeDone() === state.checks.length;
function fileDeadline(id) {
  if (state.filed.has(id)) { state.filed.delete(id); return; }
  state.filed.add(id);
  toast(t().toastFiled, () => state.filed.delete(id));
}
function sendReminder(c) {
  if (c.sent) return;
  c.sent = true;
  toast(t().toastRemind(c.client), () => { c.sent = false; });
}
function match() {
  const b = state.bank, before = b.matched;
  if (!unmatched()) return;
  if (unmatched() > b.review) { b.matched = b.total - b.review; toast(t().toastMatch(b.matched - before, b.review), () => { b.matched = before; }); }
  else { b.matched = b.total; toast(t().toastMatched, () => { b.matched = before; }); }
}

/* ---------- autopilot: the engine works in a background thread, the page only shows its output ---------- */
let worker = null;
try { worker = new Worker($('script[src^="engine.js"]').getAttribute('src')); } catch (e) { /* file:// or no workers: it runs in the page instead */ }
function engine(input) {
  if (!worker) return Promise.resolve(FolioEngine.run(input));
  return new Promise((done) => {
    worker.onmessage = (e) => done(e.data);
    worker.onerror = (e) => { e.preventDefault(); worker = null; done(FolioEngine.run(input)); };
    worker.postMessage(input);
  });
}
const isoToday = () => [TODAY.getFullYear(), TODAY.getMonth() + 1, TODAY.getDate()].map((x) => String(x).padStart(2, '0')).join('-');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const input = () => ({ files: state.auto.files, memory: state.auto.memory, decisions: state.auto.decisions, asOf: isoToday(), settings: state.settings });
function applyResult() { // the client file and the month-end list follow what Autopilot did
  const a = state.auto, r = a.result, c = CLIENTS.find((x) => x.id === a.client);
  if (!r || !r.ok) return;
  if (!a.before) a.before = { id: c.id, status: c.status, close: c.close, note: c.note, checks: state.checks.map((k) => k.on) };
  const n = r.review.length;
  Object.assign(c, { status: n ? 'progress' : 'done', close: n ? 90 : 100, note: { fr: T.fr.auto.note(n), en: T.en.auto.note(n) } });
  state.checks[3].on = true; state.checks[4].on = !n;
}
async function autopilot() {
  const a = state.auto;
  if (a.busy || !a.files.length) return;
  a.busy = true; a.step = 0;
  const out = engine(input());
  if (!calm) for (; a.step < STEPS.length; a.step++) { render(); await new Promise((ok) => setTimeout(ok, 280)); } // show each step the engine ran
  a.result = await out; a.busy = false;
  applyResult(); render();
  if (a.result.ok) { $('#autoAnswer').focus(); toast(t().auto.toastDone(a.result.review.length)); }
}
async function rerun() { state.auto.result = await engine(input()); applyResult(); render(); }
async function addFiles(list) {
  const picked = [...list].filter((f) => f.size < 5e6);
  state.auto.files = state.auto.files.concat(await Promise.all(picked.map(async (f) => ({ name: f.name, text: await f.text() }))));
  autopilot();
}
async function decide(id, opt) {
  const a = state.auto, x = a.result.review.find((v) => v.id === id);
  const prev = { decisions: { ...a.decisions }, memory: { ...a.memory } };
  const d = x.type === 'unknown' ? { account: +document.getElementById('acct-' + id).value } : t().auto.rv[x.type][1][+opt][1];
  a.decisions[id] = d;
  if (x.type === 'unknown') { a.memory[x.tx.key] = d.account; saveMemory(); }
  await rerun();
  ($('#autoOut [data-decide]') || $('#autoAnswer')).focus();
  toast(x.type === 'unknown' ? t().auto.toastLearned(`${x.tx.key} → ${acctName(d.account)}`) : t().auto.toastSaved,
    () => { a.decisions = prev.decisions; a.memory = prev.memory; saveMemory(); rerun(); });
}
function saveMemory() { Bind.flush(); } // vendors you taught Autopilot: saved through the store
function download(kind) {
  const r = state.auto.result, file = FolioEngine.exportsFor(r, state.lang)[kind];
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([file], { type: 'text/csv;charset=utf-8' }));
  link.download = `${state.auto.client}-${r.period}-${kind}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
function resetAuto() {
  const a = state.auto, b = a.before;
  if (b) { Object.assign(CLIENTS.find((x) => x.id === b.id), { status: b.status, close: b.close, note: b.note }); b.checks.forEach((on, i) => { state.checks[i].on = on; }); }
  Object.assign(a, { files: [], result: null, decisions: {}, before: null, step: -1 });
  state.rv = freshReview(state.rv.who);
}
document.addEventListener('change', (e) => {
  if (e.target.id === 'fileIn') { addFiles(e.target.files); e.target.value = ''; }
  else if (e.target.id === 'autoClient') { state.auto.client = e.target.value; render(); }
});
document.addEventListener('toggle', (e) => { // keep <details> open across re-renders
  const id = e.target.dataset && e.target.dataset.more;
  if (!id) return;
  const o = state.auto.open.filter((x) => x !== id);
  state.auto.open = e.target.open ? o.concat(id) : o;
}, true);
['dragenter', 'dragover'].forEach((ev) => document.addEventListener(ev, (e) => {
  if (state.route !== 'auto' || !e.dataTransfer || !e.dataTransfer.types.includes('Files')) return;
  e.preventDefault(); $('#drop')?.classList.add('over');
}));
document.addEventListener('dragleave', (e) => { if (!e.relatedTarget) $('#drop')?.classList.remove('over'); });
document.addEventListener('drop', (e) => {
  if (state.route !== 'auto') return;
  e.preventDefault(); $('#drop')?.classList.remove('over');
  if (e.dataTransfer.files.length && !state.auto.result?.ok) addFiles(e.dataTransfer.files);
});

document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || b.id === 'toastUndo') return;
  const ds = b.dataset;
  const wasClosed = closedNow();
  if (ds.lang) { state.lang = ds.lang; save(); }
  else if (ds.themeToggle) { state.theme = state.theme === 'dark' ? 'light' : 'dark'; save(); }
  else if (ds.filter) { state.filter = ds.filter; state.open = null; }
  else if (ds.open) state.open = state.open === ds.open ? null : ds.open;
  else if (ds.task) {
    if (b.getAttribute('aria-disabled') === 'true') return;
    const tk = TASKS.find((x) => x.id === ds.task);
    if (tk && tk.go) { if (tk.open) state.firm.open = tk.open; location.hash = tk.go; return; }
    if (ds.task === 'auto') { location.hash = '#/auto'; return; }
    if (ds.task === 'review') { location.hash = '#/review'; return; }
    if (ds.task === 'week') { location.hash = '#/calendar'; return; }
    if (ds.task === 'late') fileDeadline('late');
    else if (ds.task === 'remind') sendReminder(state.chase[0]);
    else match();
  }
  else if (ds.pick) { $('#fileIn').click(); return; }
  else if (ds.sample) { tourStart(); return; }
  else if (ds.decide) { decide(ds.decide, ds.opt); return; }
  else if (ds.dl) { download(ds.dl); return; }
  else if (ds.copy) { navigator.clipboard.writeText($('#sumText').textContent).then(() => toast(t().auto.toastCopied), () => toast(t().auto.toastNoCopy)); return; }
  else if (ds.reset) resetAuto();
  else if (ds.file) fileDeadline(ds.file);
  else if (ds.chase) sendReminder(state.chase.find((x) => x.id === ds.chase));
  else if (ds.match) match();
  else if (ds.ask) {
    if (state.asked.has(ds.ask)) return;
    state.asked.add(ds.ask);
    const c = CLIENTS.find((x) => x.id === ds.ask);
    toast(t().toastAsk(c.name), () => state.asked.delete(c.id));
  }
  else if (ds.ready) {
    const c = CLIENTS.find((x) => x.id === ds.ready);
    const prev = { status: c.status, close: c.close };
    Object.assign(c, { status: 'done', close: 100 }); state.open = null;
    toast(t().toastReady(c.name), () => Object.assign(c, prev));
  }
  else if (ds.check) {
    const c = state.checks[ds.check];
    if (c.auto) { location.hash = '#/money'; return; }
    c.on = !c.on;
  }
  else return;
  render();
  if (!wasClosed && closedNow()) toast(t().toastClose);
});

// radiogroups: one Tab stop each, arrow keys move and select (WAI-ARIA pattern)
document.addEventListener('keydown', (e) => {
  const group = e.target.closest('.seg');
  if (!group || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
  const items = [...group.querySelectorAll('button')];
  const i = items.indexOf(e.target.closest('button'));
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1
    : (i + (/Right|Down/.test(e.key) ? 1 : -1) + items.length) % items.length;
  e.preventDefault();
  items[next].focus();
  items[next].click();
});

/* ---------- router: #/today, #/clients… ; plain #anchors stay on the page ---------- */
const ROUTES = ['home', 'today', 'engagements', 'yearend', 'requests', 'time', 'more', 'auto', 'review', 'calendar', 'engine', 'deadlines', 'clients', 'money', 'close'];
function route(first) {
  const h = location.hash;
  if (h && !h.startsWith('#/')) return;
  const r = h.slice(2) || 'home';
  state.route = ROUTES.includes(r) ? r : 'home';
  render();
  if (!first) { window.scrollTo(0, 0); $(`[data-screen="${state.route}"] h1`).focus({ preventScroll: true }); }
}
window.addEventListener('hashchange', () => route(false));
Store.ready().then(Bind.load).then(() => { SyncUI.start(); if (VaultUI) VaultUI.demo(); route(true); document.documentElement.classList.remove('booting'); })
  .catch((e) => { // app only: vault could not open (lock screen comes with the device-key vault)
    document.documentElement.classList.remove('booting');
    document.body.innerHTML = `<main class="vault-err"><h1>Folio</h1><p>${String(e).replace(/</g, '&lt;')}</p></main>`;
  });
