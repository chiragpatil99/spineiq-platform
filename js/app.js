/**
 * SpineIQ — Application Controller
 * Handles routing, rendering, UI updates, and AI report generation.
 */

let currentStep = 0;
const TOTAL_STEPS = 8;

// ── RENDER ────────────────────────────────────────────────────────
function render() {
  const main = document.getElementById('main');
  if (!main) return;

  main.innerHTML = PAGES[currentStep]() + `
  <div class="actions">
    ${currentStep > 0
      ? `<button class="btn-back" onclick="goStep(${currentStep - 1})">← Previous</button>`
      : '<div></div>'}
    ${currentStep < TOTAL_STEPS - 1
      ? `<button class="btn-next" onclick="goStep(${currentStep + 1})">Next step →</button>`
      : ''}
  </div>`;

  updateSidebar();
  updateProgress();
}

// ── NAVIGATION ────────────────────────────────────────────────────
function goStep(n) {
  currentStep = n;
  render();
}

function resetAll() {
  if (confirm('Start a new patient assessment? Current data will be cleared.')) {
    resetData();
    currentStep = 0;
    render();
  }
}

// ── SIDEBAR ───────────────────────────────────────────────────────
function updateSidebar() {
  document.querySelectorAll('.sitem[data-s]').forEach((el, i) => {
    el.classList.toggle('active', i === currentStep);
    el.classList.toggle('done',   i <  currentStep);
    const num = el.querySelector('.step-num');
    if (num) num.textContent = i < currentStep ? '✓' : i + 1;
  });
}

function updateProgress() {
  const pct = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);
  const pctEl  = document.getElementById('sp-pct');
  const fillEl = document.getElementById('sp-fill');
  if (pctEl)  pctEl.textContent    = pct + '%';
  if (fillEl) fillEl.style.width   = pct + '%';
}

// ── BMI ───────────────────────────────────────────────────────────
function updBMI() {
  const h = document.getElementById('ht')?.value || D.p.height;
  const w = document.getElementById('wt')?.value || D.p.weight;
  D.p.height = h;
  D.p.weight = w;
  D.p.bmi    = calcBMI(h, w);
  const el = document.getElementById('bmi-bd');
  if (el) {
    el.textContent = D.p.bmi
      ? `${D.p.bmi} — ${bmiLbl(D.p.bmi)}`
      : 'Enter height & weight';
    el.style.color = bmiCol(D.p.bmi);
  }
}

// ── SITTING ALERT ─────────────────────────────────────────────────
function checkSitting() {
  const el = document.getElementById('sitting-alert');
  if (!el) return;
  el.innerHTML = D.wp.sitting > 8
    ? `<div class="alert alert-warn">
        ⚠ ${D.wp.sitting}h sitting/day is significantly above recommended limits.
        Prolonged static lumbar flexion is a primary driver of disc degeneration and back pain.
       </div>`
    : '';
}

// ── CONFIG ────────────────────────────────────────────────────────
// Backend proxy URL — update this after deploying the backend to Render
const API_PROXY_URL = 'https://spineiq-backend.onrender.com/api/generate-report';


// ── AI REPORT GENERATION ──────────────────────────────────────────
async function genReport() {
  const btn = document.getElementById('gbtn');
  const out = document.getElementById('rout');
  if (!btn || !out) return;

  btn.disabled    = true;
  btn.textContent = 'Generating…';
  out.innerHTML   = `
  <div class="gen-loading">
    <div class="spinner"></div>
    Analysing patient data and generating evidence-based clinical report…
  </div>`;

  const sc = score();

  try {
    const response = await fetch(API_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: buildReportPrompt(sc) })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Server error');
    }

    out.innerHTML = `<div class="report-box">${data.report}</div>`;

  } catch (err) {
    console.error('SpineIQ report generation error:', err);
    out.innerHTML = `<div class="report-box" style="color:var(--red)">
      Report generation failed. Please check your connection and try again.
    </div>`;
  }

  btn.disabled    = false;
  btn.textContent = '✦ Regenerate Report';
}

// ── INIT ──────────────────────────────────────────────────────────
render();
