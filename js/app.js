/**
 * SpineIQ — Application Controller v2.0
 */

let currentStep = 0;
const TOTAL_STEPS = 10;
const API_PROXY_URL = 'https://spineiq-backend.onrender.com/api/generate-report';

const STEP_LABELS = [
  'Patient Info', 'Occupation', 'Work Patterns', 'Lifestyle',
  'Health Data', 'Pain Assessment', 'Radiculopathy & ODI',
  'Red Flag Screening', 'Functional Status', 'Risk Report'
];

function render() {
  const main = document.getElementById('main');
  if (!main) return;
  main.innerHTML = PAGES[currentStep]() + `
  <div class="actions">
    ${currentStep > 0 ? `<button class="btn-back" onclick="goStep(${currentStep-1})">← Previous</button>` : '<div></div>'}
    ${currentStep < TOTAL_STEPS-1 ? `<button class="btn-next" onclick="goStep(${currentStep+1})">Next step →</button>` : ''}
  </div>`;
  updateSidebar();
  updateProgress();
}

function goStep(n) { currentStep = n; render(); }

function resetAll() {
  if (confirm('Start a new patient assessment? Current data will be cleared.')) {
    resetData(); currentStep = 0; render();
  }
}

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
  if (pctEl)  pctEl.textContent  = pct + '%';
  if (fillEl) fillEl.style.width = pct + '%';
}

function updBMI() {
  const h = document.getElementById('ht')?.value || D.p.height;
  const w = document.getElementById('wt')?.value || D.p.weight;
  D.p.height = h; D.p.weight = w; D.p.bmi = calcBMI(h, w);
  const el = document.getElementById('bmi-bd');
  if (el) {
    el.textContent = D.p.bmi ? `${D.p.bmi} — ${bmiLbl(D.p.bmi)}` : 'Enter height & weight';
    el.style.color = bmiCol(D.p.bmi);
  }
}

function checkSitting() {
  const el = document.getElementById('sitting-alert');
  if (!el) return;
  el.innerHTML = D.wp.sitting > 8
    ? `<div class="alert alert-warn">⚠ ${D.wp.sitting}h sitting/day exceeds safe limits. Primary driver of disc degeneration and back pain.</div>` : '';
}

async function genReport() {
  const btn = document.getElementById('gbtn');
  const out = document.getElementById('rout');
  if (!btn || !out) return;
  btn.disabled = true; btn.textContent = 'Generating…';
  out.innerHTML = `<div class="gen-loading"><div class="spinner"></div>Waking up server — may take up to 30 seconds on first use…</div>`;
  try { await fetch(API_PROXY_URL.replace('/api/generate-report', ''), { method: 'GET' }); } catch(e) {}
  out.innerHTML = `<div class="gen-loading"><div class="spinner"></div>Analysing patient data and generating evidence-based clinical report…</div>`;
  const sc = score();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);
    const response = await fetch(API_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: buildReportPrompt(sc) }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Server error');
    out.innerHTML = `<div class="report-box">${data.report}</div>`;
  } catch (err) {
    console.error('SpineIQ report error:', err);
    out.innerHTML = `<div class="report-box" style="color:var(--red)">Report generation failed. Please click Regenerate — the server may still be waking up.</div>`;
  }
  btn.disabled = false; btn.textContent = '✦ Regenerate Report';
}

render();
