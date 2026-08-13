/* Source of truth for the test directory.
   Run `node tools/build-tests.mjs` and paste the output into the
   #test-directory section of index.html.

   Each entry is [display name, tag] where tag is '' | 'KIT' | 'O',
   taken verbatim from the centre's printed test list. */

const TESTS = [
  ['ABO Group & Rh Type (Blood Group)', ''],
  ['Absolute Eosinophil Count (AEC)', ''],
  ['Albumin', ''],
  ['Alkaline Phosphatase (ALP)', ''],
  ['Amylase', 'O'],
  ['APTT', 'O'],
  ['ASO (Quantitative)', ''],
  ['Beta hCG (Beta Human Chorionic Gonadotropin)', 'O'],
  ['Bilirubin — Total + Direct + Indirect', ''],
  ['BT / CT', ''],
  ['BUN (Blood Urea Nitrogen)', ''],
  ['CA 15-3 (Breast Cancer Marker)', 'O'],
  ['CA 19-9 (Pancreatic Cancer Marker)', 'O'],
  ['CA 125 (Ovarian Cancer Marker)', 'O'],
  ['Calcitonin (Thyrocalcitonin)', 'O'],
  ['Calcium', ''],
  ['CBC (5-Part)', ''],
  ['CRP (Quantitative)', ''],
  ['Dengue', 'KIT'],
  ['Differential Count (DC)', ''],
  ['DLC / TLC / Hb% / ESR', ''],
  ['ESR', ''],
  ['Estradiol (E2)', 'O'],
  ['FBS', ''],
  ['Ferritin', 'O'],
  ['FSH (Follicle Stimulating Hormone)', 'O'],
  ['FT3 (Free Triiodothyronine)', 'O'],
  ['FT4 (Free Thyroxine)', 'O'],
  ['HbA1c (Gly)', ''],
  ['HBsAg', 'KIT'],
  ['HCV', 'KIT'],
  ['Haemoglobin', ''],
  ['HIV', 'KIT'],
  ['KFT', ''],
  ['LFT', ''],
  ['Lipid Profile', ''],
  ['Magnesium', 'O'],
  ['Mal Card', 'KIT'],
  ['Na+ K+ Cl−', ''],
  ['PGBS', ''],
  ['PPBS', ''],
  ['Progesterone (P4)', 'O'],
  ['Prolactin (PRL)', 'O'],
  ['PT / INR', 'O'],
  ['RA Factor (Quantitative)', ''],
  ['RBS', ''],
  ['RFT', ''],
  ['S. Cholesterol (S. Cho)', ''],
  ['S. Phosphorus', 'O'],
  ['S. Triglycerides (S. TG)', ''],
  ['S. Uric Acid', ''],
  ['Scrub Typhus', ''],
  ['Seminal Fluid', ''],
  ['SGOT (AST)', ''],
  ['SGPT (ALT)', ''],
  ['Sickling', 'O'],
  ['Stool R/M', ''],
  ['T3', 'O'],
  ['T4', 'O'],
  ['Thyroid Profile — I (T3, T4, TSH)', 'O'],
  ['TORCH Panel — 8 (IgG & IgM)', 'O'],
  ['Total Platelet Count', ''],
  ['Total Protein', ''],
  ['Toxo', 'KIT'],
  ['Troponin-I', 'KIT'],
  ['Troponin-T', 'KIT'],
  ['TSH', 'O'],
  ['Urea / Creatinine', ''],
  ['Urine β-hCG', 'KIT'],
  ['Urine C/S', 'O'],
  ['Urine R/M', ''],
  ['VDRL', 'KIT'],
  ['Widal Test (Slide Test)', ''],
];

/* Extra words a patient is likely to type. Never shown — only searched — so
   "sugar" finds FBS/PPBS/RBS and "thyroid" finds T3/T4/TSH. */
const ALIASES = {
  'ABO Group & Rh Type (Blood Group)': 'blood group typing',
  'Absolute Eosinophil Count (AEC)': 'allergy eosinophil',
  'Albumin': 'protein liver',
  'Alkaline Phosphatase (ALP)': 'liver bone',
  'Amylase': 'pancreas pancreatitis',
  'APTT': 'clotting coagulation bleeding',
  'ASO (Quantitative)': 'streptococcus throat rheumatic',
  'Beta hCG (Beta Human Chorionic Gonadotropin)': 'pregnancy',
  'Bilirubin — Total + Direct + Indirect': 'liver jaundice',
  'BT / CT': 'bleeding time clotting time',
  'BUN (Blood Urea Nitrogen)': 'kidney renal urea',
  'CA 15-3 (Breast Cancer Marker)': 'cancer tumour marker breast',
  'CA 19-9 (Pancreatic Cancer Marker)': 'cancer tumour marker pancreas',
  'CA 125 (Ovarian Cancer Marker)': 'cancer tumour marker ovary',
  'Calcitonin (Thyrocalcitonin)': 'thyroid hormone',
  'Calcium': 'mineral bone',
  'CBC (5-Part)': 'complete blood count haemogram hemogram',
  'CRP (Quantitative)': 'inflammation infection c reactive protein',
  'Dengue': 'fever ns1 platelet',
  'Differential Count (DC)': 'wbc white cell',
  'DLC / TLC / Hb% / ESR': 'differential total leucocyte count haemoglobin',
  'ESR': 'erythrocyte sedimentation rate inflammation',
  'Estradiol (E2)': 'hormone fertility oestrogen estrogen',
  'FBS': 'fasting blood sugar glucose diabetes',
  'Ferritin': 'iron anaemia anemia',
  'FSH (Follicle Stimulating Hormone)': 'hormone fertility',
  'FT3 (Free Triiodothyronine)': 'thyroid free',
  'FT4 (Free Thyroxine)': 'thyroid free',
  'HbA1c (Gly)': 'glycated haemoglobin diabetes sugar three month average',
  'HBsAg': 'hepatitis b',
  'HCV': 'hepatitis c',
  'Haemoglobin': 'hb anaemia anemia hemoglobin',
  'HIV': 'aids retro',
  'KFT': 'kidney function test renal',
  'LFT': 'liver function test',
  'Lipid Profile': 'cholesterol triglycerides heart hdl ldl',
  'Magnesium': 'mineral',
  'Mal Card': 'malaria fever',
  'Na+ K+ Cl−': 'electrolytes sodium potassium chloride',
  'PGBS': 'post glucose blood sugar diabetes',
  'PPBS': 'post prandial blood sugar glucose diabetes',
  'Progesterone (P4)': 'hormone fertility pregnancy',
  'Prolactin (PRL)': 'hormone fertility',
  'PT / INR': 'prothrombin clotting coagulation warfarin',
  'RA Factor (Quantitative)': 'rheumatoid arthritis joint',
  'RBS': 'random blood sugar glucose diabetes',
  'RFT': 'renal function test kidney',
  'S. Cholesterol (S. Cho)': 'lipid heart',
  'S. Phosphorus': 'mineral bone',
  'S. Triglycerides (S. TG)': 'lipid heart',
  'S. Uric Acid': 'gout joint',
  'Scrub Typhus': 'fever',
  'Seminal Fluid': 'semen analysis fertility sperm',
  'SGOT (AST)': 'liver aspartate aminotransferase',
  'SGPT (ALT)': 'liver alanine aminotransferase',
  'Sickling': 'sickle cell anaemia anemia',
  'Stool R/M': 'stool routine microscopy motion',
  'T3': 'thyroid triiodothyronine',
  'T4': 'thyroid thyroxine',
  'Thyroid Profile — I (T3, T4, TSH)': 'thyroid',
  'TORCH Panel — 8 (IgG & IgM)': 'pregnancy infection',
  'Total Platelet Count': 'platelets dengue',
  'Total Protein': 'protein liver',
  'Toxo': 'toxoplasma pregnancy',
  'Troponin-I': 'heart cardiac attack chest pain',
  'Troponin-T': 'heart cardiac attack chest pain',
  'TSH': 'thyroid stimulating hormone',
  'Urea / Creatinine': 'kidney renal',
  'Urine β-hCG': 'pregnancy urine',
  'Urine C/S': 'urine culture sensitivity infection',
  'Urine R/M': 'urine routine microscopy',
  'VDRL': 'syphilis',
  'Widal Test (Slide Test)': 'typhoid fever',
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const key = (s) => s.replace(/^[^A-Za-z0-9]+/, '').toUpperCase();
const letterOf = (s) => {
  const c = key(s)[0];
  return /[A-Z]/.test(c) ? c : '#';
};

const sorted = [...TESTS].sort((a, b) => key(a[0]).localeCompare(key(b[0]), 'en'));

const groups = new Map();
for (const [name, tag] of sorted) {
  const L = letterOf(name);
  if (!groups.has(L)) groups.set(L, []);
  groups.get(L).push([name, tag]);
}

const letters = [...groups.keys()];

let out = '';
out += `      <div class="dir__rail" role="group" aria-label="Filter by letter">\n`;
out += `        <a class="dir__letter dir__letter--all is-active" href="#test-directory" data-letter="" aria-pressed="true">All</a>\n`;
for (const L of letters) {
  out += `        <a class="dir__letter" href="#dir-${L}" data-letter="${L}" aria-pressed="false">${L}</a>\n`;
}
out += `      </div>\n\n`;

out += `      <div class="dir__groups" id="dir-groups">\n`;
for (const [L, list] of groups) {
  out += `        <section class="dir__group" id="dir-${L}" aria-labelledby="dir-h-${L}">\n`;
  out += `          <h3 class="dir__initial" id="dir-h-${L}">${L}</h3>\n`;
  out += `          <ul class="dir__list">\n`;
  for (const [name, tag] of list) {
    const t = tag ? `<span class="dir__tag dir__tag--${tag.toLowerCase()}">${tag}</span>` : '';
    const alt = ALIASES[name] ? ` data-alt="${esc(ALIASES[name])}"` : '';
    out += `            <li class="dir__row"${alt}><span class="dir__name">${esc(name)}</span>${t}</li>\n`;
  }
  out += `          </ul>\n        </section>\n`;
}
out += `      </div>\n`;

console.log(`<!-- generated by tools/build-tests.mjs — ${TESTS.length} tests -->`);
console.log(out);
console.error(`${TESTS.length} tests across ${letters.length} letters: ${letters.join(' ')}`);
