/**
 * SpineIQ — Scoring Engine
 * Phase 1 evidence-based risk scoring methodology.
 *
 * Principle: Measure → Assess → Score → Classify → Recommend
 *
 * Each dimension is scored 0–100 (higher = healthier).
 * Back Pain Risk Score is inverted (higher = more risk).
 *
 * Dimensions:
 *   1. Lifestyle Score    — sedentary behaviour, occupational load
 *   2. Activity Score     — steps, walking, exercise frequency
 *   3. Sleep Score        — duration and quality
 *   4. Mobility Score     — functional capacity across 5 axes
 *   5. Obesity Score      — BMI-derived spinal loading risk
 */

function score() {
  const s = {};

  // ── 1. OBESITY SCORE ──────────────────────────────────────────
  // Based on WHO BMI classification and spinal load evidence
  const b = parseFloat(D.p.bmi);
  if (b) {
    if      (b < 18.5) s.obesity = 55;   // Underweight — reduced muscle support
    else if (b < 25)   s.obesity = 100;  // Normal
    else if (b < 30)   s.obesity = 70;   // Overweight — elevated disc load
    else if (b < 35)   s.obesity = 40;   // Obese I — significant spinal loading
    else               s.obesity = 20;   // Obese II+ — severe loading risk
  } else {
    s.obesity = 70; // Default if not provided
  }

  // ── 2. SLEEP SCORE ────────────────────────────────────────────
  // NSF guidelines: 7–9h optimal. Poor sleep ↑ pain sensitisation.
  const sh = parseFloat(D.ls.sleep);
  const sleepBase = (sh >= 7 && sh <= 9) ? 80 : sh >= 6 ? 60 : sh >= 5 ? 40 : 20;
  const sleepQMap = { excellent: 20, good: 10, fair: 0, poor: -20 };
  s.sleep = Math.min(100, Math.max(0, sleepBase + (sleepQMap[D.ls.sleepQ] || 0)));

  // ── 3. ACTIVITY SCORE ─────────────────────────────────────────
  // WHO guidelines: 10,000 steps/day, 150 min moderate exercise/week
  const steps   = parseFloat(D.ls.steps)   || 0;
  const walking = parseFloat(D.ls.walking) || 0;
  const freqMap = { none: 0, once: 15, twice: 25, three: 40, daily: 60 };
  const stepsScore   = Math.min(40, (steps   / 10000) * 40);
  const walkingScore = Math.min(20, (walking / 30)    * 20);
  const exScore      = freqMap[D.ls.exFreq] || 0;
  s.activity = Math.min(100, stepsScore + walkingScore + exScore);

  // ── 4. LIFESTYLE SCORE ────────────────────────────────────────
  // Occupational sedentary exposure and mechanical loading
  let lifestyleBase = 70;
  const sitting = parseFloat(D.wp.sitting) || 0;
  if      (sitting > 8) lifestyleBase -= 25;
  else if (sitting > 6) lifestyleBase -= 12;
  if      (D.wp.lifting === 'heavy')    lifestyleBase -= 20;
  else if (D.wp.lifting === 'moderate') lifestyleBase -= 8;
  s.lifestyle = Math.max(0, lifestyleBase);

  // ── 5. MOBILITY SCORE ─────────────────────────────────────────
  // Functional capacity — 5 axes × 25 points each = 125 max → normalise to 100
  const tolMap = {
    normal:             25,
    mildly_limited:     15,
    moderately_limited:  8,
    severely_limited:    0
  };
  const axes = ['sit', 'stand', 'walk', 'stairs', 'lift'];
  const rawMobility = axes.reduce((acc, f) => acc + (tolMap[D.fn[f]] || 0), 0);
  s.mobility = Math.round(rawMobility); // Max 125 → already within range

  // ── BACK PAIN RISK SCORE ──────────────────────────────────────
  // Composite inverse of average health score, weighted by pain intensity
  const painIntensity = parseFloat(D.pa.intensity) || 0;
  const painModifier  = 1 - (painIntensity / 20);
  const avgHealth     = (s.obesity + s.sleep + s.activity + s.lifestyle + s.mobility) / 5;
  s.risk = Math.min(100, Math.max(0,
    Math.round((1 - (avgHealth / 100)) * 100 * painModifier + painIntensity * 3)
  ));

  // ── RISK CLASSIFICATION ───────────────────────────────────────
  if      (s.risk < 35) { s.riskLvl = 'Low Risk';      s.riskCol = 'var(--green)'; s.riskBg = 'var(--green-dim)'; s.riskBdr = '#22C55E33'; }
  else if (s.risk < 65) { s.riskLvl = 'Moderate Risk'; s.riskCol = 'var(--amber)'; s.riskBg = 'var(--amber-dim)'; s.riskBdr = '#F59E0B33'; }
  else                  { s.riskLvl = 'High Risk';      s.riskCol = 'var(--red)';   s.riskBg = 'var(--red-dim)';   s.riskBdr = '#EF444433'; }

  return s;
}

/**
 * Identify probable pain contributors based on assessment data.
 * Returns array of [label, colour] tuples.
 */
function getContributors() {
  const sc     = score();
  const contribs = [];

  if (sc.activity < 50)
    contribs.push(['Low physical activity level', sc.activity < 30 ? 'var(--red)' : 'var(--amber)']);
  if (parseFloat(D.wp.sitting) > 7)
    contribs.push(['Prolonged sedentary work pattern', 'var(--amber)']);
  if (sc.sleep < 60)
    contribs.push(['Poor sleep quality or insufficient duration', 'var(--amber)']);
  if (parseFloat(D.p.bmi) >= 30)
    contribs.push(['Obesity — elevated spinal loading', 'var(--red)']);
  if (D.pa.radiation !== 'no')
    contribs.push(['Pain radiation suggesting nerve root involvement', 'var(--red)']);
  if (D.pa.duration === 'chronic')
    contribs.push(['Chronic pain — possible central sensitisation', 'var(--amber)']);
  if (D.fn.sit !== 'normal' || D.fn.stand !== 'normal')
    contribs.push(['Reduced postural tolerance', 'var(--amber)']);
  if (D.wp.lifting === 'heavy')
    contribs.push(['Heavy repetitive lifting demands', 'var(--red)']);
  if (D.oc.type === 'driver')
    contribs.push(['Whole-body vibration from driving exposure', 'var(--amber)']);

  if (!contribs.length)
    contribs.push(['No major contributors identified from available data', 'var(--green)']);

  return contribs;
}

/**
 * Build the AI report prompt from current assessment data.
 * @param {Object} sc - Scores object from score()
 * @returns {string} Prompt string for Anthropic API
 */
function buildReportPrompt(sc) {
  return `You are a senior spine health specialist generating an evidence-based clinical assessment report. Focus on identifying root causes of back pain, not prescribing treatment.

PATIENT DATA:
Name: ${D.p.name || 'Anonymous'} | Age: ${D.p.age || 'NP'} | Sex: ${D.p.gender || 'NP'}
BMI: ${D.p.bmi || 'NP'} (${bmiLbl(D.p.bmi)}) | Height: ${D.p.height}cm | Weight: ${D.p.weight}kg

OCCUPATION:
Type: ${D.oc.type || 'NP'} ${D.oc.other ? '(' + D.oc.other + ')' : ''}
Sitting: ${D.wp.sitting}h/day | Standing: ${D.wp.standing}h/day | Driving: ${D.wp.driving}h/day
Lifting: ${D.wp.lifting}

LIFESTYLE:
Sleep: ${D.ls.sleep}h/night, quality: ${D.ls.sleepQ}
Steps: ${D.ls.steps}/day | Walking: ${D.ls.walking}min/day
Exercise: ${D.ls.exFreq} ${D.ls.exType ? '(' + D.ls.exType + ')' : ''}
Active minutes: ${D.ls.activeMin}/day

PAIN:
Location: ${D.pa.loc || 'NP'} | Intensity: ${D.pa.intensity}/10 | Duration: ${D.pa.duration || 'NP'}
Pattern: ${D.pa.pattern || 'NP'} | Radiation: ${D.pa.radiation}
Triggers: ${D.pa.triggers || 'none reported'}
Limitations: ${D.pa.limitations || 'none reported'}

FUNCTIONAL STATUS:
Sitting: ${D.fn.sit} | Standing: ${D.fn.stand} | Walking: ${D.fn.walk}
Stairs: ${D.fn.stairs} | Lifting: ${D.fn.lift}

COMPUTED SCORES (0–100):
Lifestyle: ${sc.lifestyle} | Activity: ${sc.activity} | Sleep: ${sc.sleep}
Mobility: ${sc.mobility} | Weight/BMI: ${sc.obesity}
Back Pain Risk Score: ${sc.risk}/100 — ${sc.riskLvl}

Generate a structured clinical report with these exact 8 sections. Each section should have 3–5 specific, evidence-based sentences tied to this patient's data. Do not give generic advice.

1. PATIENT SUMMARY
2. BMI & WEIGHT ANALYSIS
3. LIFESTYLE & ACTIVITY ASSESSMENT
4. OCCUPATIONAL RISK FACTORS
5. PAIN PATTERN ANALYSIS
6. KEY RISK FACTORS IDENTIFIED
7. PROBABLE CONTRIBUTORS TO CURRENT PAIN
8. RECOMMENDED NEXT STEPS

Core principle: Measure → Assess → Score → Classify → Recommend.
Focus on root cause identification. Recommend investigations and specialist referrals where appropriate — not treatment packages.`;
}
