/**
 * SpineIQ — Scoring Engine v2.0
 * Incorporates:
 *   - Original 5-dimension lifestyle scoring
 *   - Spine Severity System (SSS) 0–11 clinical score
 *   - Age-specific Daily Habit Snapshot benchmarking
 *   - Red Flag auto-screening
 */

// ── UTILITIES ─────────────────────────────────────────────────────
function calcBMI(h, w) {
  h = parseFloat(h); w = parseFloat(w);
  if (!h || !w) return '';
  return (w / ((h / 100) ** 2)).toFixed(1);
}

function bmiLbl(v) {
  v = parseFloat(v);
  if (!v)      return '';
  if (v < 18.5) return 'Underweight';
  if (v < 25)   return 'Normal';
  if (v < 30)   return 'Overweight';
  if (v < 35)   return 'Obese I';
  return 'Obese II+';
}

function bmiCol(v) {
  v = parseFloat(v);
  if (!v)    return 'var(--text2)';
  if (v < 25) return 'var(--green)';
  if (v < 30) return 'var(--amber)';
  return 'var(--red)';
}

// ── DIMENSION SCORES (0–100, higher = healthier) ──────────────────
function score() {
  const s = {};

  // Obesity
  const b = parseFloat(D.p.bmi);
  s.obesity = b ? (b < 18.5 ? 55 : b < 25 ? 100 : b < 30 ? 70 : b < 35 ? 40 : 20) : 70;

  // Sleep
  const sh = parseFloat(D.ls.sleep);
  const sleepBase = (sh >= 7 && sh <= 9) ? 80 : sh >= 6 ? 60 : sh >= 5 ? 40 : 20;
  const sleepQMap = { excellent: 20, good: 10, fair: 0, poor: -20 };
  s.sleep = Math.min(100, Math.max(0, sleepBase + (sleepQMap[D.ls.sleepQ] || 0)));

  // Activity
  const steps   = parseFloat(D.ls.steps)   || 0;
  const walking = parseFloat(D.ls.walking) || 0;
  const freqMap = { none: 0, once: 15, twice: 25, three: 40, daily: 60 };
  s.activity = Math.min(100, Math.min(40,(steps/10000)*40) + Math.min(20,(walking/30)*20) + (freqMap[D.ls.exFreq] || 0));

  // Lifestyle
  let lb = 70;
  const sitting = parseFloat(D.wp.sitting) || 0;
  if (sitting > 8) lb -= 25; else if (sitting > 6) lb -= 12;
  if (D.wp.lifting === 'heavy') lb -= 20; else if (D.wp.lifting === 'moderate') lb -= 8;
  s.lifestyle = Math.max(0, lb);

  // Mobility
  const tolMap = { normal: 25, mildly_limited: 15, moderately_limited: 8, severely_limited: 0 };
  s.mobility = Math.min(100, Math.round(['sit','stand','walk','stairs','lift'].reduce((a,f) => a + (tolMap[D.fn[f]] || 0), 0)));

  // Back Pain Risk Score (composite)
  const painInt   = parseFloat(D.pa.intensity) || 0;
  const painMod   = 1 - (painInt / 20);
  const avgHealth = (s.obesity + s.sleep + s.activity + s.lifestyle + s.mobility) / 5;
  s.risk = Math.min(100, Math.max(0, Math.round((1 - (avgHealth / 100)) * 100 * painMod + painInt * 3)));

  if      (s.risk < 35) { s.riskLvl = 'Low Risk';      s.riskCol = 'var(--green)'; s.riskBg = 'var(--green-dim)'; s.riskBdr = '#22C55E33'; }
  else if (s.risk < 65) { s.riskLvl = 'Moderate Risk'; s.riskCol = 'var(--amber)'; s.riskBg = 'var(--amber-dim)'; s.riskBdr = '#F59E0B33'; }
  else                  { s.riskLvl = 'High Risk';      s.riskCol = 'var(--red)';   s.riskBg = 'var(--red-dim)';   s.riskBdr = '#EF444433'; }

  return s;
}

// ── SSS SCORE (0–11) ──────────────────────────────────────────────
function calcSSS() {
  const sss = {};

  // 1. VAS Back Pain (0–2)
  const pi = parseFloat(D.pa.intensity) || 0;
  sss.vas = pi <= 3 ? 0 : pi <= 6 ? 1 : 2;

  // 2. Leg Radiculopathy (0–3)
  sss.radiculopathy = parseInt(D.cl.radiculopathy) || 0;

  // 3. ODI Disability Score (0–2) — from 5 ODI fields, each 0–2
  const odiMap = { normal: 0, mild: 1, severe: 2, severe3: 3 };
  const odiTotal = ['walking','sitting','standing','sleep','daily'].reduce((a,f) => a + (odiMap[D.od[f]] || 0), 0);
  sss.odi = odiTotal <= 3 ? 0 : odiTotal <= 8 ? 1 : 2;
  sss.odiTotal = odiTotal;

  // 4. BMI Mechanical Load (0–2)
  const bmi = parseFloat(D.p.bmi);
  sss.bmiScore = !bmi ? 0 : bmi < 25 ? 0 : bmi < 30 ? 1 : 2;

  // 5. Chronicity (0–2)
  const chronMap = { acute: 0, subacute: 1, chronic: 2, recurrent: 2 };
  sss.chronicity = chronMap[D.pa.duration] || 0;

  // 6. Red Flag Score (0 or 11)
  const redFlags = D.rf || {};
  const anyRedFlag = Object.values(redFlags).some(v => v === true);
  sss.redFlag = anyRedFlag ? 11 : 0;

  // Total
  if (anyRedFlag) {
    sss.total = 11;
  } else {
    sss.total = sss.vas + sss.radiculopathy + sss.odi + sss.bmiScore + sss.chronicity;
  }

  // Classification
  if      (sss.total <= 3)  { sss.level = 'LOW';              sss.col = 'var(--green)'; sss.bg = 'var(--green-dim)'; sss.mgmt = 'Education, posture correction, exercise'; }
  else if (sss.total <= 6)  { sss.level = 'MILD–MODERATE';    sss.col = 'var(--amber)'; sss.bg = 'var(--amber-dim)'; sss.mgmt = 'Physiotherapy, lifestyle correction, evaluation'; }
  else if (sss.total <= 9)  { sss.level = 'MODERATE–SEVERE';  sss.col = '#C2541A';      sss.bg = '#2D1A00';          sss.mgmt = 'Spine specialist consultation and advanced care'; }
  else                      { sss.level = 'SEVERE / HIGH RISK'; sss.col = 'var(--red)'; sss.bg = 'var(--red-dim)';   sss.mgmt = 'URGENT SPINE SPECIALIST EVALUATION / ADVANCED CARE'; }

  sss.anyRedFlag = anyRedFlag;
  return sss;
}

// ── AGE-SPECIFIC HABIT BENCHMARK ──────────────────────────────────
function habitBenchmark() {
  const age = parseInt(D.p.age) || 0;
  const sitting = parseFloat(D.wp.sitting) || 0;
  const walking = parseFloat(D.ls.walking) || 0;
  const exFreqMap = { none: 0, once: 1, twice: 2, three: 3.5, daily: 7 };
  const exercise = exFreqMap[D.ls.exFreq] || 0;
  const sleep = parseFloat(D.ls.sleep) || 0;

  let group, idealSit, idealWalk, idealEx, idealSleep, highRiskSit, highRiskWalk;

  if      (age >= 20 && age <= 30) { group = '20–30 yrs'; idealSit = 6;  highRiskSit = 9;  idealWalk = 45; highRiskWalk = 20; idealEx = 4; idealSleep = 7; }
  else if (age >= 31 && age <= 45) { group = '31–45 yrs'; idealSit = 7;  highRiskSit = 10; idealWalk = 45; highRiskWalk = 20; idealEx = 3; idealSleep = 7; }
  else if (age >= 46 && age <= 60) { group = '46–60 yrs'; idealSit = 6;  highRiskSit = 8;  idealWalk = 40; highRiskWalk = 15; idealEx = 3; idealSleep = 7; }
  else if (age > 60)               { group = '>60 yrs';   idealSit = 5;  highRiskSit = 7;  idealWalk = 30; highRiskWalk = 10; idealEx = 3; idealSleep = 7; }
  else return null;

  const flags = [];
  if (sitting >= highRiskSit) flags.push({ text: `Sitting ${sitting}h/day exceeds high-risk threshold (>${highRiskSit}h) for age ${group}`, col: 'var(--red)' });
  else if (sitting > idealSit) flags.push({ text: `Sitting ${sitting}h/day is above ideal (<${idealSit}h) for age ${group}`, col: 'var(--amber)' });
  else flags.push({ text: `Sitting ${sitting}h/day is within healthy range for age ${group}`, col: 'var(--green)' });

  if (walking < highRiskWalk) flags.push({ text: `Walking ${walking} min/day is below high-risk threshold (<${highRiskWalk} min) for age ${group}`, col: 'var(--red)' });
  else if (walking < idealWalk) flags.push({ text: `Walking ${walking} min/day is below ideal (${idealWalk} min) for age ${group}`, col: 'var(--amber)' });
  else flags.push({ text: `Walking ${walking} min/day meets healthy target for age ${group}`, col: 'var(--green)' });

  if (exercise < 1) flags.push({ text: `No regular exercise — high degeneration risk for age ${group}`, col: 'var(--red)' });
  else if (exercise < idealEx) flags.push({ text: `Exercise ${exercise} days/week is below ideal (${idealEx} days) for age ${group}`, col: 'var(--amber)' });
  else flags.push({ text: `Exercise frequency meets healthy target for age ${group}`, col: 'var(--green)' });

  if (sleep < 5) flags.push({ text: `Sleep ${sleep}h/night — critically low for age ${group}`, col: 'var(--red)' });
  else if (sleep < idealSleep) flags.push({ text: `Sleep ${sleep}h/night is below ideal (${idealSleep}h) for age ${group}`, col: 'var(--amber)' });
  else flags.push({ text: `Sleep duration is healthy for age ${group}`, col: 'var(--green)' });

  return { group, flags };
}

// ── CONTRIBUTORS ──────────────────────────────────────────────────
function getContributors() {
  const sc = score();
  const sss = calcSSS();
  const contribs = [];

  if (sc.activity < 50)             contribs.push(['Low physical activity level', sc.activity < 30 ? 'var(--red)' : 'var(--amber)']);
  if (parseFloat(D.wp.sitting) > 7) contribs.push(['Prolonged sedentary work pattern', 'var(--amber)']);
  if (sc.sleep < 60)                contribs.push(['Poor sleep quality or insufficient duration', 'var(--amber)']);
  if (parseFloat(D.p.bmi) >= 30)    contribs.push(['Obesity — elevated spinal loading', 'var(--red)']);
  if (D.pa.radiation !== 'no')      contribs.push(['Pain radiation suggesting nerve root involvement', 'var(--red)']);
  if (D.pa.duration === 'chronic' || D.pa.duration === 'recurrent') contribs.push(['Chronic pain — possible central sensitisation', 'var(--amber)']);
  if (D.fn.sit !== 'normal' || D.fn.stand !== 'normal') contribs.push(['Reduced postural tolerance', 'var(--amber)']);
  if (D.wp.lifting === 'heavy')     contribs.push(['Heavy repetitive lifting demands', 'var(--red)']);
  if (D.oc.type === 'driver')       contribs.push(['Whole-body vibration from driving exposure', 'var(--amber)']);
  if (sss.radiculopathy >= 2)       contribs.push(['Significant leg radiculopathy / sciatica', 'var(--red)']);
  if (sss.anyRedFlag)               contribs.push(['⚠ Red flag symptoms present — urgent evaluation required', 'var(--red)']);

  if (!contribs.length) contribs.push(['No major contributors identified from available data', 'var(--green)']);
  return contribs;
}

// ── AI REPORT PROMPT ──────────────────────────────────────────────
function buildReportPrompt(sc) {
  const sss = calcSSS();
  const bench = habitBenchmark();
  const redFlagList = Object.entries(D.rf || {}).filter(([,v]) => v).map(([k]) => k).join(', ') || 'None';

  return `You are a senior spine health specialist generating an evidence-based clinical assessment report. Focus on identifying root causes of back pain, not prescribing treatment.

PATIENT:
Name: ${D.p.name || 'Anonymous'} | Age: ${D.p.age || 'NP'} | Sex: ${D.p.gender || 'NP'}
BMI: ${D.p.bmi || 'NP'} (${bmiLbl(D.p.bmi)}) | Height: ${D.p.height}cm | Weight: ${D.p.weight}kg

OCCUPATION: ${D.oc.type || 'NP'}
Sitting: ${D.wp.sitting}h/day | Standing: ${D.wp.standing}h/day | Driving: ${D.wp.driving}h/day | Lifting: ${D.wp.lifting}

LIFESTYLE:
Sleep: ${D.ls.sleep}h/night (${D.ls.sleepQ}) | Steps: ${D.ls.steps}/day | Walking: ${D.ls.walking}min/day
Exercise: ${D.ls.exFreq} ${D.ls.exType ? '('+D.ls.exType+')' : ''} | Active minutes: ${D.ls.activeMin}/day

PAIN:
Location: ${D.pa.loc || 'NP'} | Intensity: ${D.pa.intensity}/10 | Duration: ${D.pa.duration || 'NP'}
Pattern: ${D.pa.pattern || 'NP'} | Radiation: ${D.pa.radiation}
Triggers: ${D.pa.triggers || 'none'} | Limitations: ${D.pa.limitations || 'none'}

CLINICAL SCORES (SSS):
VAS Points: ${sss.vas}/2 | Radiculopathy: ${sss.radiculopathy}/3 | ODI Points: ${sss.odi}/2
BMI Load: ${sss.bmiScore}/2 | Chronicity: ${sss.chronicity}/2 | Red Flag: ${sss.redFlag}
TOTAL SSS SCORE: ${sss.total}/11 — ${sss.level}
Suggested management: ${sss.mgmt}

RED FLAGS: ${redFlagList}

FUNCTIONAL STATUS:
Sitting: ${D.fn.sit} | Standing: ${D.fn.stand} | Walking: ${D.fn.walk} | Stairs: ${D.fn.stairs} | Lifting: ${D.fn.lift}

ODI DISABILITY:
Walking: ${D.od?.walking||'NP'} | Sitting: ${D.od?.sitting||'NP'} | Standing: ${D.od?.standing||'NP'} | Sleep: ${D.od?.sleep||'NP'} | Daily Activities: ${D.od?.daily||'NP'}

AGE-SPECIFIC BENCHMARK (${bench ? bench.group : 'N/A'}):
${bench ? bench.flags.map(f => '- ' + f.text).join('\n') : 'Age not provided'}

DIMENSION SCORES (0–100): Lifestyle ${sc.lifestyle} | Activity ${sc.activity} | Sleep ${sc.sleep} | Mobility ${sc.mobility} | Weight ${sc.obesity}
Back Pain Risk Score: ${sc.risk}/100 — ${sc.riskLvl}

Generate a structured clinical report with these exact 8 sections (3–5 sentences each, specific to this patient's data):

1. PATIENT SUMMARY
2. BMI & WEIGHT ANALYSIS
3. LIFESTYLE & ACTIVITY ASSESSMENT (include age-specific benchmarks)
4. OCCUPATIONAL RISK FACTORS
5. PAIN PATTERN ANALYSIS (reference SSS score and radiculopathy grade)
6. KEY RISK FACTORS IDENTIFIED (include any red flags)
7. PROBABLE CONTRIBUTORS TO CURRENT PAIN
8. RECOMMENDED NEXT STEPS (investigations, referrals — not treatment packages)

Core principle: Measure → Assess → Score → Classify → Recommend. Root cause focus. Clinical precision.`;
}
