/**
 * SpineIQ — App Controller v3.0 (Mobile)
 * Bottom tab navigation, mobile-first UX
 */

let currentStep = 0;
const TOTAL_STEPS = 10;
const API_PROXY_URL = 'https://spineiq-backend.onrender.com/api/generate-report';

const STEP_NAMES = [
  'Patient Information', 'Occupation', 'Work Patterns', 'Lifestyle',
  'Health Data', 'Pain Assessment', 'Radiculopathy & ODI',
  'Red Flag Screening', 'Functional Status', 'Risk Report'
];

let currentTab = 'assess';
let reportGenerated = false;

// ── TAB SWITCHING ─────────────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  ['assess','report','settings'].forEach(t => {
    document.getElementById(`screen-${t === 'assess' ? 'assess' : t}`)?.classList.toggle('active', t === tab);
    document.getElementById(`tab-${t}`)?.classList.toggle('active', t === tab);
  });
  document.getElementById('screen-assess').classList.toggle('active', tab === 'assess');
  document.getElementById('screen-report').classList.toggle('active', tab === 'report');
  document.getElementById('screen-settings').classList.toggle('active', tab === 'settings');
  document.getElementById('step-actions').style.display = tab === 'assess' ? 'flex' : 'none';
  document.getElementById('app-content').scrollTo(0, 0);
}

// ── STEP RENDER ───────────────────────────────────────────────────
function render() {
  const main = document.getElementById('main');
  if (!main) return;
  main.innerHTML = PAGES[currentStep]();
  updateProgress();
  updateActions();
  document.getElementById('app-content').scrollTo({ top: 0, behavior: 'smooth' });
}

function goStep(n) { currentStep = n; render(); }
function goToStep(n) { currentStep = n; switchTab('assess'); render(); }

function updateProgress() {
  const pct = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);
  const fill = document.getElementById('progress-fill');
  const title = document.getElementById('step-title-label');
  const count = document.getElementById('step-count-label');
  const dots  = document.getElementById('step-dots');
  if (fill)  fill.style.width = pct + '%';
  if (title) title.textContent = STEP_NAMES[currentStep];
  if (count) count.textContent = `Step ${currentStep + 1} of ${TOTAL_STEPS}`;
  if (dots) {
    dots.innerHTML = Array.from({length: TOTAL_STEPS}, (_, i) =>
      `<div class="step-dot ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}"></div>`
    ).join('');
  }
}

// Steps that require a video to be watched before continuing
const VIDEO_GATES = { 5: 'pain', 6: 'odi', 7: 'redflag' };

function updateActions() {
  const actions = document.getElementById('step-actions');
  if (!actions) return;
  const gateId = VIDEO_GATES[currentStep];
  const locked = gateId && !watchedVideos[gateId];
  actions.innerHTML = `
    ${currentStep > 0
      ? `<button class="btn-back" onclick="goStep(${currentStep - 1})">← Back</button>`
      : ''}
    ${currentStep < TOTAL_STEPS - 1
      ? `<button class="btn-next" onclick="${locked ? `showToast('Watch the video above to continue')` : `goStep(${currentStep + 1})`}"
          style="${currentStep === 0 ? 'flex:1' : ''};${locked ? 'opacity:.4' : ''}">
          ${locked ? '🔒 Watch video to continue' : 'Continue →'}
        </button>`
      : `<button class="btn-next" onclick="showReport()" style="${currentStep === 0 ? 'flex:1' : ''}">View Report ✦</button>`}`;
}

// ── ANIMATED RING HELPER ──────────────────────────────────────────
function animRing(val, col, size, delay) {
  const r = size/2 - 8;
  const c = 2 * Math.PI * r;
  const dash = (val/100) * c;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--border)" stroke-width="7"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${col}" stroke-width="7"
      stroke-linecap="round" transform="rotate(-90 ${size/2} ${size/2})"
      class="animated-ring"
      style="--dash:${dash};--gap:${c};--delay:${delay}s"/>
    <text x="${size/2}" y="${size/2+6}" text-anchor="middle"
      font-size="18" font-weight="900" fill="${col}" font-family="inherit">${val}</text>
  </svg>`;
}

// ── REPORT TAB ────────────────────────────────────────────────────
function showReport() {
  const sc  = score();
  const sss = calcSSS();
  const contribs = getContributors();
  const bench = habitBenchmark();
  const anyRedFlag = Object.values(D.rf).some(v => v);

  const SCORES = [
    ['Lifestyle', sc.lifestyle, '#8B7CF6'],
    ['Activity',  sc.activity,  '#00B4A0'],
    ['Sleep',     sc.sleep,     '#3B82F6'],
    ['Mobility',  sc.mobility,  '#F59E0B'],
    ['Weight',    sc.obesity,   '#22C55E'],
  ];

  const reportEl = document.getElementById('screen-report');
  reportEl.innerHTML = `
    <div class="step-hdr" style="padding:16px 16px 0">
      <div class="step-title">Risk Report</div>
      <div class="step-desc">SSS clinical score + AI assessment</div>
    </div>
    <div style="padding:0 16px 100px">

      ${anyRedFlag ? `<div class="alert alert-danger" style="margin:12px 0">
        🚨 <strong>RED FLAG — SSS Score = 11. Urgent specialist evaluation required.</strong>
      </div>` : ''}

      <div class="summary-row">
        <div class="sum-chip"><div class="s-lbl">Patient</div><div class="s-val">${D.p.name||'—'}</div></div>
        <div class="sum-chip"><div class="s-lbl">Age</div><div class="s-val">${D.p.age?D.p.age+' yrs':'—'}</div></div>
        <div class="sum-chip"><div class="s-lbl">BMI</div><div class="s-val" style="color:${bmiCol(D.p.bmi)}">${D.p.bmi||'—'}</div></div>
        <div class="sum-chip"><div class="s-lbl">Class</div><div class="s-val" style="font-size:11px;color:${bmiCol(D.p.bmi)}">${bmiLbl(D.p.bmi)||'—'}</div></div>
        <div class="sum-chip"><div class="s-lbl">Job</div><div class="s-val" style="font-size:11px;text-transform:capitalize">${D.oc.type||'—'}</div></div>
      </div>

      <div class="sss-score-card">
        <div class="sss-sub-scores">
          <div class="sss-sub-item"><div class="sss-sub-val">${sss.vas}</div><div class="sss-sub-max">/2</div><div class="sss-sub-lbl">VAS Pain</div></div>
          <div class="sss-sub-item"><div class="sss-sub-val">${sss.radiculopathy}</div><div class="sss-sub-max">/3</div><div class="sss-sub-lbl">Radiculopathy</div></div>
          <div class="sss-sub-item"><div class="sss-sub-val">${sss.odi}</div><div class="sss-sub-max">/2</div><div class="sss-sub-lbl">ODI</div></div>
          <div class="sss-sub-item"><div class="sss-sub-val">${sss.bmiScore}</div><div class="sss-sub-max">/2</div><div class="sss-sub-lbl">BMI Load</div></div>
          <div class="sss-sub-item"><div class="sss-sub-val">${sss.chronicity}</div><div class="sss-sub-max">/2</div><div class="sss-sub-lbl">Chronicity</div></div>
        </div>
        <div class="sss-total-row" style="background:${sss.bg}">
          <div>
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:${sss.col};opacity:.7;font-weight:700;margin-bottom:4px">Spine Severity Score</div>
            <div class="sss-total-num" style="color:${sss.col}">${sss.total}<span style="font-size:20px;font-weight:500">/11</span></div>
          </div>
          <div style="text-align:right">
            <div class="sss-total-badge" style="background:${sss.col}">${sss.level}</div>
            <div style="font-size:11px;color:${sss.col};margin-top:6px;max-width:150px;text-align:right;font-weight:500">${sss.mgmt}</div>
          </div>
        </div>
      </div>

      <div class="big-score-title" style="padding:0 16px">Dimension scores (0–100)</div>
      <div class="score-rings-row">
        ${SCORES.map(([l, v, c], i) => `
        <div class="score-ring-card">
          ${animRing(v, c, 80, i * 0.1)}
          <div class="ring-val" style="color:${c}">${v}</div>
          <div class="ring-lbl">${l}</div>
        </div>`).join('')}
      </div>

      <div class="risk-banner-big" style="background:${sc.riskBg};border:1px solid ${sc.riskBdr};color:${sc.riskCol};margin:0 16px 16px">
        <div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.8px;opacity:.7;margin-bottom:4px;font-weight:700">Back Pain Risk Score</div>
          <div class="risk-num-big">${sc.risk}<span style="font-size:22px;font-weight:700">/100</span></div>
          <div class="risk-sub-lbl">5-dimension analysis</div>
        </div>
        <div class="risk-level-badge" style="background:${sc.riskCol}">${sc.riskLvl}</div>
      </div>

      ${bench ? `
      <div class="card">
        <div class="card-hdr"><div class="card-dot" style="background:var(--blue)"></div><div class="card-label">Age benchmark — ${bench.group}</div></div>
        <div class="contrib-list">${bench.flags.map(f => `
          <div class="contrib-item"><div class="contrib-dot" style="background:${f.col}"></div>${f.text}</div>`).join('')}
        </div>
      </div>` : ''}

      <div class="card">
        <div class="card-hdr"><div class="card-dot" style="background:var(--amber)"></div><div class="card-label">Probable contributors</div></div>
        <div class="contrib-list">${contribs.map(([t, c]) => `
          <div class="contrib-item"><div class="contrib-dot" style="background:${c}"></div>${t}</div>`).join('')}
        </div>
      </div>

      <button class="gen-btn" id="gbtn" onclick="genReport()">✦ Generate AI Clinical Report</button>
      <div id="rout"></div>
      <div id="download-wrap"></div>
    </div>`;

  switchTab('report');
  document.getElementById('tab-report-dot').classList.add('show');
}

// ── AI REPORT ─────────────────────────────────────────────────────
async function genReport() {
  const btn = document.getElementById('gbtn');
  const out = document.getElementById('rout');
  if (!btn || !out) return;
  btn.disabled = true; btn.textContent = 'Generating…';
  out.innerHTML = `<div class="gen-loading"><div class="spinner"></div>Waking up server…</div>`;
  try { await fetch(API_PROXY_URL.replace('/api/generate-report', ''), { method: 'GET' }); } catch(e) {}
  out.innerHTML = `<div class="gen-loading"><div class="spinner"></div>Generating evidence-based clinical report…</div>`;
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
    reportGenerated = true;
    const wrap = document.getElementById('download-wrap');
    if (wrap) wrap.innerHTML = `<button class="dl-btn" onclick="downloadReport()">⬇ Download Report as PDF</button>`;
  } catch (err) {
    out.innerHTML = `<div class="report-box" style="color:var(--red)">Generation failed. Tap Regenerate to try again.</div>`;
  }
  btn.disabled = false; btn.textContent = '✦ Regenerate Report';
}

// ── RESET ─────────────────────────────────────────────────────────
function resetAll() {
  if (confirm('Clear all data and start a new assessment?')) {
    resetData();
    currentStep = 0;
    reportGenerated = false;
    document.getElementById('tab-report-dot').classList.remove('show');
    switchTab('assess');
    render();
    showToast('New assessment started');
  }
}

// ── TOAST ─────────────────────────────────────────────────────────
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 2500);
}

// ── BMI ───────────────────────────────────────────────────────────
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

// ── SITTING ALERT ─────────────────────────────────────────────────
function checkSitting() {
  const el = document.getElementById('sitting-alert');
  if (!el) return;
  el.innerHTML = D.wp.sitting > 8
    ? `<div class="alert alert-warn">⚠ ${D.wp.sitting}h/day exceeds safe limits.</div>` : '';
}

// ── PDF DOWNLOAD ──────────────────────────────────────────────────
function downloadReport() {
  const reportText = document.getElementById('rout')?.innerText || '';
  const sc  = score();
  const sss = calcSSS();
  if (!reportText) { showToast('Generate the report first'); return; }

  const sssBg  = sss.total <= 3 ? '#e8f5ee' : sss.total <= 6 ? '#fdf3e3' : sss.total <= 9 ? '#fff3e0' : '#fceef0';
  const sssCol = sss.total <= 3 ? '#2D6A4F' : sss.total <= 6 ? '#92520A' : sss.total <= 9 ? '#C2541A' : '#8B2635';
  const bmiTC  = !D.p.bmi ? '#666' : parseFloat(D.p.bmi) < 25 ? '#2D6A4F' : parseFloat(D.p.bmi) < 30 ? '#92520A' : '#8B2635';
  const riskBg  = sc.risk < 35 ? '#e8f5ee' : sc.risk < 65 ? '#fdf3e3' : '#fceef0';
  const riskCol = sc.risk < 35 ? '#2D6A4F' : sc.risk < 65 ? '#92520A' : '#8B2635';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>SpineIQ Report — ${D.p.name || 'Patient'}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a}
.page{max-width:780px;margin:0 auto;padding:32px 36px}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #4A3F8F}
.brand{font-size:26px;font-weight:800;color:#4A3F8F}
.brand-sub{font-size:12px;color:#888;margin-top:2px}
.meta table{font-size:13px;color:#444;border-collapse:collapse}
.meta td{padding:2px 6px}
.meta td:first-child{color:#888;text-align:right}
.meta td:last-child{font-weight:600}
.section-title{font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#888;margin:24px 0 10px}
.scores-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px}
.score-box{background:#f5f3ff;border:1px solid #c5bce8;border-radius:10px;padding:12px 8px;text-align:center}
.score-val{font-size:24px;font-weight:800;color:#4A3F8F}
.score-lbl{font-size:11px;color:#888;margin-top:4px}
.sss-breakdown{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px}
.sss-item{background:#f8f8f8;border:1px solid #eee;border-radius:8px;padding:8px;text-align:center}
.sss-item-val{font-size:18px;font-weight:700;color:#4A3F8F}
.sss-item-lbl{font-size:10px;color:#888;margin-top:2px}
.sss-box{border-radius:12px;padding:18px 22px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;background:${sssBg};border:1px solid ${sssCol}44}
.sss-num{font-size:46px;font-weight:800;color:${sssCol};line-height:1}
.sss-badge{background:${sssCol};color:#fff;padding:8px 20px;border-radius:20px;font-weight:700;font-size:14px;display:inline-block;margin-bottom:6px}
.sss-mgmt{font-size:12px;color:${sssCol};text-align:right}
.risk-box{border-radius:12px;padding:14px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;background:${riskBg};border:1px solid ${riskCol}44}
.risk-num{font-size:36px;font-weight:800;color:${riskCol}}
.risk-badge{background:${riskCol};color:#fff;padding:6px 16px;border-radius:16px;font-weight:700;font-size:13px}
.patient-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
.patient-cell{background:#f8f8f8;border-radius:8px;padding:10px 12px}
.pcell-lbl{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px}
.pcell-val{font-size:14px;font-weight:600}
.report-body{font-size:13.5px;line-height:1.9;color:#2a2a2a;white-space:pre-wrap;margin-top:8px}
.footer{margin-top:36px;padding-top:14px;border-top:1px solid #eee;font-size:11px;color:#aaa;text-align:center;line-height:1.6}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{padding:20px}}
</style></head><body><div class="page">
<div class="header">
  <div><div class="brand">SpineIQ</div><div class="brand-sub">Spine Health Intelligence Platform — Clinical Assessment Report</div></div>
  <div class="meta"><table>
    <tr><td>Patient</td><td>${D.p.name || '—'}</td></tr>
    <tr><td>Age / Sex</td><td>${D.p.age || '—'} yrs / ${D.p.gender || '—'}</td></tr>
    <tr><td>Date</td><td>${new Date().toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'})}</td></tr>
    <tr><td>Occupation</td><td style="text-transform:capitalize">${D.oc.type || '—'}</td></tr>
  </table></div>
</div>
<div class="section-title">Patient Summary</div>
<div class="patient-grid">
  <div class="patient-cell"><div class="pcell-lbl">Height</div><div class="pcell-val">${D.p.height || '—'} cm</div></div>
  <div class="patient-cell"><div class="pcell-lbl">Weight</div><div class="pcell-val">${D.p.weight || '—'} kg</div></div>
  <div class="patient-cell"><div class="pcell-lbl">BMI</div><div class="pcell-val" style="color:${bmiTC}">${D.p.bmi || '—'}</div></div>
  <div class="patient-cell"><div class="pcell-lbl">Classification</div><div class="pcell-val" style="color:${bmiTC};font-size:12px">${bmiLbl(D.p.bmi) || '—'}</div></div>
</div>
<div class="section-title">Spine Severity Score (SSS)</div>
<div class="sss-breakdown">
  <div class="sss-item"><div class="sss-item-val">${sss.vas}<span style="font-size:12px">/2</span></div><div class="sss-item-lbl">VAS Pain</div></div>
  <div class="sss-item"><div class="sss-item-val">${sss.radiculopathy}<span style="font-size:12px">/3</span></div><div class="sss-item-lbl">Radiculopathy</div></div>
  <div class="sss-item"><div class="sss-item-val">${sss.odi}<span style="font-size:12px">/2</span></div><div class="sss-item-lbl">ODI Disability</div></div>
  <div class="sss-item"><div class="sss-item-val">${sss.bmiScore}<span style="font-size:12px">/2</span></div><div class="sss-item-lbl">BMI Load</div></div>
  <div class="sss-item"><div class="sss-item-val">${sss.chronicity}<span style="font-size:12px">/2</span></div><div class="sss-item-lbl">Chronicity</div></div>
</div>
<div class="sss-box">
  <div>
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${sssCol};margin-bottom:4px;opacity:.8">Total SSS Score</div>
    <div class="sss-num">${sss.total}<span style="font-size:20px">/11</span></div>
  </div>
  <div style="text-align:right"><div class="sss-badge">${sss.level}</div><div class="sss-mgmt">${sss.mgmt}</div></div>
</div>
<div class="section-title">Lifestyle Dimension Scores (0–100)</div>
<div class="scores-grid">
  <div class="score-box"><div class="score-val">${sc.lifestyle}</div><div class="score-lbl">Lifestyle</div></div>
  <div class="score-box"><div class="score-val">${sc.activity}</div><div class="score-lbl">Activity</div></div>
  <div class="score-box"><div class="score-val">${sc.sleep}</div><div class="score-lbl">Sleep</div></div>
  <div class="score-box"><div class="score-val">${sc.mobility}</div><div class="score-lbl">Mobility</div></div>
  <div class="score-box"><div class="score-val">${sc.obesity}</div><div class="score-lbl">Weight</div></div>
</div>
<div class="risk-box">
  <div>
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${riskCol};margin-bottom:4px;opacity:.8">Back Pain Risk Score</div>
    <div class="risk-num">${sc.risk}<span style="font-size:20px">/100</span></div>
  </div>
  <div class="risk-badge">${sc.riskLvl}</div>
</div>
<div class="section-title">AI Clinical Assessment</div>
<div class="report-body">${reportText}</div>
<div class="footer">Generated by SpineIQ — Spine Health Intelligence Platform &nbsp;|&nbsp; ${new Date().toLocaleString('en-GB')}<br>★ This report is for clinical decision support only. Not a substitute for clinical judgment. v2.0</div>
</div><script>window.onload=function(){window.print()}</script></body></html>`;

  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
}

// ── INIT ──────────────────────────────────────────────────────────
render();
switchTab('assess');
