// Solva · public accounting firm data: staff, engagements, time, client requests (PBC) and one year-end file.
// Loaded before app.js; fake firm, fake figures. Due dates are days from today so the mock never goes stale.
const STAFF = [
  { id: 'MB', name: 'Marie Bélanger', role: { fr: 'Associée, CPA', en: 'Partner, CPA' }, rate: 225 },
  { id: 'JT', name: 'Julien Tremblay', role: { fr: 'Directeur, CPA', en: 'Manager, CPA' }, rate: 150 },
  { id: 'AL', name: 'Amira Lahlou', role: { fr: 'Senior', en: 'Senior' }, rate: 110 },
  { id: 'SG', name: 'Sophie Gagnon', role: { fr: 'Technicienne', en: 'Technician' }, rate: 80 },
];
const staff = (id) => STAFF.find((s) => s.id === id) || { id, name: id, rate: 0, role: { fr: '', en: '' } };

// kind: comp = compilation (NCSC 4200 / CSRS 4200), review = review (NCME 2400 / CSRE 2400), t2, t1, book
// stage = index in STAGES (0 letter … 6 issued). ye: the engagement has the year-end file below.
const ENGAGEMENTS = [
  { id: 'pins-comp', client: 'pins', kind: 'comp', period: '2026-06-30', due: 67, prep: 'AL', rev: 'JT', partner: 'MB', budget: 22, fee: 3200, stage: 3, ye: true },
  { id: 'pins-t2', client: 'pins', kind: 't2', period: '2026-06-30', due: 67, prep: 'AL', rev: 'JT', partner: 'MB', budget: 8, fee: 1400, stage: 2 },
  { id: 'boreal-rev', client: 'boreal', kind: 'review', period: '2026-12-31', due: 157, prep: 'JT', rev: 'MB', partner: 'MB', budget: 46, fee: 9800, stage: 0 },
  { id: 'mistral-book', client: 'mistral', kind: 'book', period: '2026-09-30', due: -25, prep: 'SG', rev: 'JT', partner: 'MB', budget: 6, fee: 650, stage: 2 },
  { id: 'nordet-comp', client: 'nordet', kind: 'comp', period: '2026-03-31', due: -26, prep: 'AL', rev: 'JT', partner: 'MB', budget: 20, fee: 3000, stage: 6 },
  { id: 'nordet-t2', client: 'nordet', kind: 't2', period: '2026-03-31', due: -26, prep: 'AL', rev: 'JT', partner: 'MB', budget: 9, fee: 1500, stage: 6 },
  { id: 'verveine-t1', client: 'verveine', kind: 't1', period: '2025-12-31', due: 218, prep: 'SG', rev: 'AL', partner: 'MB', budget: 5, fee: 850, stage: 0 },
];
const STAGE_COUNT = 7;

// time entries: d = days ago, h = hours
const TIME_SEED = [
  ['pins-comp', 'AL', 6, 3.5, { fr: 'Rapprochements bancaires et clients', en: 'Bank and receivables reconciliations' }],
  ['pins-comp', 'AL', 5, 4, { fr: 'Inventaire de sirop, feuille sommaire', en: 'Syrup inventory lead sheet' }],
  ['pins-comp', 'SG', 4, 2.5, { fr: 'Saisie des factures de juin', en: 'June invoices entry' }],
  ['pins-comp', 'JT', 2, 1, { fr: 'Questions au client, immobilisations', en: 'Client questions, capital assets' }],
  ['pins-t2', 'AL', 3, 1.5, { fr: 'Annexe 8, DPA', en: 'Schedule 8, CCA' }],
  ['mistral-book', 'SG', 9, 3, { fr: 'Tenue de livres de septembre', en: 'September bookkeeping' }],
  ['mistral-book', 'SG', 1, 1.25, { fr: 'Relances pour reçus manquants', en: 'Chasing missing receipts' }],
  ['boreal-rev', 'JT', 8, 2, { fr: 'Planification, compréhension de l’entité', en: 'Planning, understanding the entity' }],
  ['nordet-comp', 'AL', 40, 14, { fr: 'Dossier de fin d’exercice', en: 'Year-end file' }, true],
  ['nordet-comp', 'JT', 35, 4, { fr: 'Révision du dossier', en: 'File review' }, true],
  ['nordet-comp', 'MB', 33, 1.5, { fr: 'Approbation et lettre de recommandations', en: 'Sign-off and management letter' }, true],
  ['nordet-t2', 'AL', 31, 6, { fr: 'T2 et CO-17', en: 'T2 and CO-17' }, true],
];

// client requests (PBC list): st = missing | sent | received, d = days since asked
const PBC_SEED = [
  ['pins-comp', { fr: 'Relevés bancaires de juin (2 comptes)', en: 'June bank statements (2 accounts)' }, 'received', 21],
  ['pins-comp', { fr: 'Décompte physique du sirop au 30 juin', en: 'Syrup physical count at June 30' }, 'received', 21],
  ['pins-comp', { fr: 'Factures d’achat d’équipement > 5 000 $', en: 'Equipment purchase invoices > $5,000' }, 'sent', 14],
  ['pins-comp', { fr: 'Contrat de prêt et tableau d’amortissement', en: 'Loan agreement and repayment schedule' }, 'sent', 14],
  ['pins-comp', { fr: 'Confirmation de la subvention MAPAQ', en: 'MAPAQ grant confirmation' }, 'missing', 0],
  ['pins-t2', { fr: 'Registre des procès-verbaux, dividendes', en: 'Minute book, dividends' }, 'sent', 10],
  ['mistral-book', { fr: '3 reçus de septembre (Costco, Metro, SAQ)', en: '3 September receipts (Costco, Metro, SAQ)' }, 'sent', 12],
  ['boreal-rev', { fr: 'Lettre de mission signée', en: 'Signed engagement letter' }, 'sent', 6],
  ['boreal-rev', { fr: 'Balance de vérification préliminaire', en: 'Preliminary trial balance' }, 'missing', 0],
  ['verveine-t1', { fr: 'Feuillets T4, RL-1 et T5 du propriétaire', en: "Owner's T4, RL-1 and T5 slips" }, 'missing', 0],
];

// Érablière Deux-Pins inc., year ended June 30, 2026. [no, fr, en, unadjusted (debit +), prior year, FS line]
const YE_TB = [
  [1000, 'Encaisse', 'Cash', 48210, 31540, 'cash'],
  [1100, 'Comptes clients', 'Accounts receivable', 22450, 19800, 'ar'],
  [1200, 'Stock de sirop', 'Syrup inventory', 61800, 44100, 'inv'],
  [1300, 'Frais payés d’avance', 'Prepaid expenses', 3200, 2900, 'pre'],
  [1500, 'Équipement', 'Equipment', 184000, 151000, 'cap'],
  [1510, 'Amortissement cumulé', 'Accumulated amortization', -72400, -72400, 'cap'],
  [2000, 'Fournisseurs', 'Accounts payable', -18760, -15230, 'ap'],
  [2100, 'Charges à payer', 'Accrued liabilities', 0, -1900, 'ap'],
  [2200, 'TPS/TVQ à payer', 'GST/QST payable', -4120, -3380, 'ap'],
  [2300, 'Impôts à payer', 'Income taxes payable', 0, -6450, 'tax'],
  [2500, 'Dette à long terme', 'Long-term debt', -65000, -48000, 'ltd'],
  [3000, 'Capital-actions', 'Share capital', -100, -100, 'eq'],
  [3100, 'Bénéfices non répartis au début', 'Retained earnings, opening', -57780, -37030, 're'],
  [4000, 'Ventes de sirop', 'Syrup sales', -312500, -268400, 'rev'],
  [4100, 'Subventions', 'Grants', -8000, -8000, 'rev'],
  [5000, 'Coût des ventes', 'Cost of sales', 141300, 119900, 'cos'],
  [5100, 'Sous-traitance', 'Subcontractors', 38400, 33100, 'opx'],
  [5200, 'Carburant et entretien', 'Fuel and maintenance', 21600, 17800, 'opx'],
  [5300, 'Assurances', 'Insurance', 6900, 6400, 'opx'],
  [5400, 'Intérêts sur la dette', 'Interest on debt', 3900, 2700, 'opx'],
  [5500, 'Honoraires professionnels', 'Professional fees', 4200, 3900, 'opx'],
  [5600, 'Amortissement', 'Amortization', 0, 18900, 'opx'],
  [5700, 'Frais de bureau', 'Office expenses', 2700, 2400, 'opx'],
  [5800, 'Impôts sur le bénéfice', 'Income taxes', 0, 6450, 'itx'],
];
const YE_TAX_RATE = 0.122; // small business rate: federal 9 % + Québec 3.2 %
const YE_MATERIAL = 5000; // lead-sheet variance flag: over 10 % and over this amount
// proposed adjusting entries; 'tax' is worked out from income after the others
const YE_AJE = [
  { id: 'AJE-1', dr: 5600, cr: 1510, amt: 22320, fr: 'Amortissement de l’exercice : 20 % dégressif sur 111 600 $', en: 'Amortization for the year: 20% declining on $111,600' },
  { id: 'AJE-2', dr: 5000, cr: 1200, amt: 3500, fr: 'Ramener le stock au décompte physique (58 300 $)', en: 'Bring inventory to the physical count ($58,300)' },
  { id: 'AJE-3', dr: 5200, cr: 2100, amt: 2150, fr: 'Facture d’entretien de juin reçue en juillet', en: 'June maintenance invoice received in July' },
  { id: 'AJE-4', dr: 5800, cr: 2300, amt: 'tax', fr: 'Provision d’impôts : 12,2 % du bénéfice avant impôts', en: 'Income tax provision: 12.2% of income before tax' },
];

function firmInit() {
  const at = (d) => { const x = new Date(TODAY); x.setDate(x.getDate() + d); return x; };
  return {
    firm: {
      eng: ENGAGEMENTS.map((e) => ({ ...e, due: at(e.due), letter: e.stage > 0, indep: e.stage > 1 })),
      open: 'pins-comp',
      time: TIME_SEED.map(([eng, who, d, h, note, billed], i) => ({ id: `t${i}`, eng, who, date: at(-d), h, note, billed: !!billed })),
      invoices: [{ id: 'F-2026-118', eng: 'nordet-comp', amt: 3000, date: at(-30) }, { id: 'F-2026-119', eng: 'nordet-t2', amt: 1500, date: at(-30) }],
      pbc: PBC_SEED.map(([eng, text, st, d], i) => ({ id: `p${i}`, eng, text, st, asked: d ? at(-d) : null })),
      timer: null, // { eng, who, start }
      tFilter: 'all',
      ye: { aje: YE_AJE.map((a) => ({ ...a, st: 'proposed' })), sign: { prep: null, rev: null, partner: null }, view: 'tb' },
    },
  };
}
