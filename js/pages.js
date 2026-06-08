/**
 * Video gate helper — tracks which videos have been watched
 */
const watchedVideos = {};

function markWatched(id) {
  watchedVideos[id] = true;
  const gate = document.getElementById('video-gate-' + id);
  const form = document.getElementById('video-form-' + id);
  const btn  = document.getElementById('video-watched-btn-' + id);
  if (gate) gate.style.opacity = '1';
  if (btn)  btn.innerHTML = '✅ Video watched — form unlocked';
  if (btn)  btn.style.background = 'var(--green)';
  if (form) { form.style.pointerEvents = 'auto'; form.style.opacity = '1'; }
}

function videoGate(id, title, duration, desc) {
  var w = watchedVideos[id];
  var borderCol  = w ? 'var(--green)' : 'var(--purple2)';
  var bgCol      = w ? 'var(--green-dim)' : 'var(--purple-dim)';
  var labelText  = w ? '&#x2705; Video watched' : '&#x1F4F9; Watch before continuing';
  var btnBg      = w ? 'var(--green)' : 'var(--purple2)';
  var btnText    = w ? '&#x2705; Video watched &mdash; form unlocked' : '&#x25B6; Mark as watched to unlock form';
  var formStyle  = w ? 'pointer-events:auto;opacity:1' : 'pointer-events:none;opacity:0.35';
  var videoOp    = w ? '1' : '0.95';

  return '<div class="card" style="margin-bottom:12px;border-color:' + borderCol + '33;background:' + bgCol + '">'
    + '<div class="card-hdr">'
    + '<div class="card-dot" style="background:' + borderCol + '"></div>'
    + '<div class="card-label" style="color:' + borderCol + '">' + labelText + '</div>'
    + '</div>'
    + '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:4px">' + title + '</div>'
    + '<div style="font-size:12px;color:var(--text2);margin-bottom:12px">' + desc + '</div>'
    + '<div id="video-gate-' + id + '" style="position:relative;border-radius:var(--r);overflow:hidden;background:#000;aspect-ratio:16/9;margin-bottom:12px;opacity:' + videoOp + '">'
    + '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:linear-gradient(135deg,#1a1040,#0a1520)">'
    + '<div style="width:56px;height:56px;background:var(--purple2);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="markWatched('' + id + '')">'
    + '<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
    + '</div>'
    + '<div style="color:#fff;font-size:13px;font-weight:500">' + title + '</div>'
    + '<div style="color:rgba(255,255,255,0.5);font-size:11px">' + duration + ' &middot; Tap to play</div>'
    + '</div>'
    + '<div style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.6);color:#fff;font-size:10px;padding:3px 8px;border-radius:10px">' + duration + '</div>'
    + '</div>'
    + '<button id="video-watched-btn-' + id + '" onclick="markWatched('' + id + '')" '
    + 'style="width:100%;padding:11px;border-radius:var(--r);border:none;background:' + btnBg + ';color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s">'
    + btnText
    + '</button>'
    + '</div>'
    + '<div id="video-form-' + id + '" style="' + formStyle + ';transition:all .3s">';
}

/**
 * SpineIQ — Page Templates v2.0
 * 10-step assessment incorporating SSS clinical scoring system,
 * ODI disability assessment, red flag screening, and age-specific benchmarks.
 */

function ring(val, col, size=60) {
  const r=size/2-6, c=2*Math.PI*r;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="sc-ring">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--bg4)" stroke-width="6"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${col}" stroke-width="6"
      stroke-dasharray="${(val/100)*c} ${c}" stroke-linecap="round" transform="rotate(-90 ${size/2} ${size/2})"/>
    <text x="${size/2}" y="${size/2+5}" text-anchor="middle" font-size="14" font-weight="700"
      fill="${col}" font-family="Inter,sans-serif">${val}</text>
  </svg>`;
}

const PAGES = [

  // ── STEP 0: Patient Information ────────────────────────────────
  () => `
  <div class="step-hdr"><div class="step-title">Patient Information</div>
  <div class="step-desc">Core demographic data and anthropometric measurements</div></div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Identity</div></div>
    <div class="field"><label>Full name</label>
    <input type="text" value="${D.p.name}" placeholder="Patient full name" oninput="D.p.name=this.value"></div>
    <div class="grid3">
      <div class="field"><label>Age (years)</label>
      <input type="number" value="${D.p.age}" placeholder="e.g. 38" oninput="D.p.age=this.value"></div>
      <div class="field"><label>Biological sex</label>
      <select onchange="D.p.gender=this.value">
        <option value="" ${!D.p.gender?'selected':''}>Select</option>
        <option value="male" ${D.p.gender==='male'?'selected':''}>Male</option>
        <option value="female" ${D.p.gender==='female'?'selected':''}>Female</option>
        <option value="other" ${D.p.gender==='other'?'selected':''}>Other</option>
        <option value="pns" ${D.p.gender==='pns'?'selected':''}>Prefer not to say</option>
      </select></div>
      <div class="field"></div>
    </div>
  </div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Body measurements</div></div>
    <div class="grid3">
      <div class="field"><label>Height (cm)</label>
      <input type="number" id="ht" value="${D.p.height}" placeholder="170" oninput="updBMI()"></div>
      <div class="field"><label>Weight (kg)</label>
      <input type="number" id="wt" value="${D.p.weight}" placeholder="70" oninput="updBMI()"></div>
      <div class="field"><label>BMI — auto-calculated</label>
      <div class="bmi-badge" id="bmi-bd" style="color:${bmiCol(D.p.bmi)}">
        ${D.p.bmi ? `${D.p.bmi} — ${bmiLbl(D.p.bmi)}` : 'Enter height & weight'}
      </div></div>
    </div>
  </div>`,

  // ── STEP 1: Occupation ─────────────────────────────────────────
  () => `
  <div class="step-hdr"><div class="step-title">Occupation</div>
  <div class="step-desc">Professional role and work environment</div></div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Role classification</div></div>
    <div class="field"><label>Occupation type</label>
    <select onchange="D.oc.type=this.value;render()">
      <option value="" ${!D.oc.type?'selected':''}>Select occupation category</option>
      <option value="office" ${D.oc.type==='office'?'selected':''}>Office Worker — desk-based</option>
      <option value="field" ${D.oc.type==='field'?'selected':''}>Field Worker — outdoor / site-based</option>
      <option value="driver" ${D.oc.type==='driver'?'selected':''}>Driver — vehicle operator</option>
      <option value="homemaker" ${D.oc.type==='homemaker'?'selected':''}>Homemaker / Caregiver</option>
      <option value="student" ${D.oc.type==='student'?'selected':''}>Student</option>
      <option value="manual" ${D.oc.type==='manual'?'selected':''}>Manual Labour</option>
      <option value="healthcare" ${D.oc.type==='healthcare'?'selected':''}>Healthcare Professional</option>
      <option value="other" ${D.oc.type==='other'?'selected':''}>Other</option>
    </select></div>
    ${D.oc.type==='other'?`<div class="field"><label>Specify occupation</label>
    <input type="text" value="${D.oc.other}" placeholder="Describe occupation" oninput="D.oc.other=this.value"></div>`:''}
    ${D.oc.type==='office'||D.oc.type==='student'?`<div class="alert alert-warn">⚠ Desk-based occupations are associated with prolonged static lumbar loading and hip flexor tightening.</div>`:''}
    ${D.oc.type==='driver'?`<div class="alert alert-warn">⚠ Driving exposes the spine to whole-body vibration and sustained flexion — established risk factors for lumbar disc pathology.</div>`:''}
    ${D.oc.type==='manual'?`<div class="alert alert-danger">⚠ Manual labour involves repetitive mechanical spinal loading — significantly elevated injury risk.</div>`:''}
  </div>`,

  // ── STEP 2: Work Patterns ──────────────────────────────────────
  () => `
  <div class="step-hdr"><div class="step-title">Work Patterns</div>
  <div class="step-desc">Daily postural time distribution and physical demands</div></div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Postural time distribution</div></div>
    ${[['sitting','Sitting hours per day',0,16,'h'],['standing','Standing hours per day',0,12,'h'],['driving','Driving hours per day',0,12,'h']].map(([k,l,mn,mx,u])=>`
    <div class="field">
      <div class="rlrow"><label>${l}</label><span class="rv" id="rv-${k}">${D.wp[k]}${u}</span></div>
      <input type="range" min="${mn}" max="${mx}" step="0.5" value="${D.wp[k]}"
        oninput="D.wp['${k}']=+this.value;document.getElementById('rv-${k}').textContent=this.value+'${u}';checkSitting()">
    </div>`).join('')}
    <div id="sitting-alert"></div>
  </div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Lifting demands</div></div>
    <div class="field"><label>Lifting activity level</label>
    <select onchange="D.wp.lifting=this.value;render()">
      <option value="none" ${D.wp.lifting==='none'?'selected':''}>None / minimal</option>
      <option value="light" ${D.wp.lifting==='light'?'selected':''}>Light — under 5 kg occasionally</option>
      <option value="moderate" ${D.wp.lifting==='moderate'?'selected':''}>Moderate — 5–15 kg regularly</option>
      <option value="heavy" ${D.wp.lifting==='heavy'?'selected':''}>Heavy — over 15 kg frequently</option>
    </select></div>
    ${D.wp.lifting==='heavy'?`<div class="alert alert-danger">⚠ Frequent heavy lifting is a primary risk factor for lumbar disc herniation and facet joint degeneration.</div>`:''}
  </div>`,

  // ── STEP 3: Lifestyle ──────────────────────────────────────────
  () => `
  <div class="step-hdr"><div class="step-title">Lifestyle Assessment</div>
  <div class="step-desc">Sleep, physical activity, and daily movement patterns</div></div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Sleep</div></div>
    <div class="grid2">
      <div class="field">
        <div class="rlrow"><label>Sleep duration (hours/night)</label><span class="rv" id="rv-sl">${D.ls.sleep}h</span></div>
        <input type="range" min="3" max="12" step="0.5" value="${D.ls.sleep}"
          oninput="D.ls.sleep=+this.value;document.getElementById('rv-sl').textContent=this.value+'h'">
      </div>
      <div class="field"><label>Sleep quality</label>
      <select onchange="D.ls.sleepQ=this.value">
        <option value="excellent" ${D.ls.sleepQ==='excellent'?'selected':''}>Excellent</option>
        <option value="good" ${D.ls.sleepQ==='good'?'selected':''}>Good</option>
        <option value="fair" ${D.ls.sleepQ==='fair'?'selected':''}>Fair</option>
        <option value="poor" ${D.ls.sleepQ==='poor'?'selected':''}>Poor</option>
      </select></div>
    </div>
    ${D.ls.sleep<6?`<div class="alert alert-warn">⚠ Less than 6 hours sleep increases pain sensitivity and impairs musculoskeletal recovery.</div>`:''}
  </div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Physical activity</div></div>
    <div class="grid2">
      <div class="field">
        <div class="rlrow"><label>Walking minutes per day</label><span class="rv" id="rv-wk">${D.ls.walking} min</span></div>
        <input type="range" min="0" max="120" step="5" value="${D.ls.walking}"
          oninput="D.ls.walking=+this.value;document.getElementById('rv-wk').textContent=this.value+' min'">
      </div>
      <div class="field"><label>Daily step count</label>
      <input type="number" value="${D.ls.steps}" placeholder="e.g. 8000" oninput="D.ls.steps=+this.value"></div>
    </div>
    <div class="grid2">
      <div class="field"><label>Exercise frequency</label>
      <select onchange="D.ls.exFreq=this.value">
        <option value="none" ${D.ls.exFreq==='none'?'selected':''}>None — sedentary</option>
        <option value="once" ${D.ls.exFreq==='once'?'selected':''}>Once per week</option>
        <option value="twice" ${D.ls.exFreq==='twice'?'selected':''}>Twice per week</option>
        <option value="three" ${D.ls.exFreq==='three'?'selected':''}>3–4 times per week</option>
        <option value="daily" ${D.ls.exFreq==='daily'?'selected':''}>Daily</option>
      </select></div>
      <div class="field"><label>Exercise type</label>
      <input type="text" value="${D.ls.exType}" placeholder="e.g. swimming, yoga, strength" oninput="D.ls.exType=this.value"></div>
    </div>
    <div class="field">
      <div class="rlrow"><label>Active minutes per day</label><span class="rv" id="rv-am">${D.ls.activeMin} min</span></div>
      <input type="range" min="0" max="180" step="5" value="${D.ls.activeMin}"
        oninput="D.ls.activeMin=+this.value;document.getElementById('rv-am').textContent=this.value+' min'">
    </div>
  </div>`,

  // ── STEP 4: Health Data ────────────────────────────────────────
  () => {
    const W=[{id:'manual',icon:'📋',name:'Manual Entry'},{id:'googlefit',icon:'🔷',name:'Google Fit'},
      {id:'apple',icon:'⌚',name:'Apple Watch'},{id:'fitbit',icon:'💚',name:'Fitbit'},
      {id:'samsung',icon:'📱',name:'Samsung'},{id:'garmin',icon:'🏃',name:'Garmin'},
      {id:'xiaomi',icon:'🔴',name:'Mi Band'},{id:'amazfit',icon:'🔵',name:'Amazfit'},
      {id:'oneplus',icon:'🟢',name:'OnePlus'},{id:'other',icon:'◉',name:'Other'}];
    const isConnected = !!googleAccessToken;
    return `
    <div class="step-hdr"><div class="step-title">Health & Fitness Data</div>
    <div class="step-desc">Connect Google Fit for automatic sync or enter manually</div></div>
    <div class="card">
      <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Data source</div></div>
      <div class="wgrid">${W.map(w=>`<button class="wcard ${D.hd.src===w.id?'sel':''}" onclick="D.hd.src='${w.id}';render()">
        <div class="wcard-icon">${w.icon}</div>${w.name}</button>`).join('')}</div>
      ${D.hd.src==='googlefit' ? `<div style="margin-top:14px">
        ${!isConnected ? `
        <div style="background:var(--blue-dim);border:1px solid #3B82F622;border-radius:var(--r);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div>
            <div style="font-size:14px;font-weight:500;color:var(--text);margin-bottom:4px">🔷 Connect Google Fit</div>
            <div style="font-size:12px;color:var(--text2)">Automatically import steps, sleep, heart rate and activity from the last 7 days</div>
          </div>
          <button onclick="connectGoogleFit()" style="padding:10px 20px;background:var(--blue);border:none;border-radius:var(--r);color:#fff;font-size:14px;font-weight:500;cursor:pointer;font-family:Inter,sans-serif;white-space:nowrap">
            Connect Google Fit →
          </button>
        </div>` : `
        <div style="background:var(--green-dim);border:1px solid #22C55E33;border-radius:var(--r);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div style="font-size:14px;color:var(--green)">✅ Google Fit connected</div>
          <button id="gfit-sync-btn" onclick="syncGoogleFitData(()=>render())"
            style="padding:8px 18px;background:var(--green);border:none;border-radius:var(--r);color:#fff;font-size:13px;font-weight:500;cursor:pointer;font-family:Inter,sans-serif">
            🔄 Sync data
          </button>
        </div>
        <div id="gfit-status" style="margin-top:10px"></div>`}
      </div>` : D.hd.src!=='manual' ? `<div class="alert alert-info" style="margin-top:12px">ℹ <strong>Coming in Phase 2:</strong> Auto-sync from this device. Please enter manually below.</div>` : ''}
    </div>
    <div class="card">
      <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Health metrics ${D.hd.src==='googlefit'&&isConnected ? '— synced from Google Fit' : '— manual entry'}</div></div>
      <div class="grid3">
        ${[['steps','Daily steps (avg)','e.g. 8500'],['walkMin','Walking min (avg)','e.g. 45'],['exMin','Exercise min (avg)','e.g. 30'],
           ['activeMin','Active min (avg)','e.g. 60'],['sedentary','Sedentary hours','e.g. 9'],['sleepDur','Sleep hours (avg)','e.g. 7.5'],
           ['rhr','Resting HR (bpm)','e.g. 65'],['weight','Weight (kg)','e.g. 74']].map(([k,l,ph])=>`
        <div class="field"><label>${l}</label>
        <input type="number" value="${D.hd[k]||''}" placeholder="${ph}" oninput="D.hd['${k}']=this.value"
          style="${D.hd[k]&&D.hd.src==='googlefit'?'border-color:var(--green);background:var(--green-dim)':''}"></div>`).join('')}
        <div></div>
      </div>
    </div>`;
  },

  // ── STEP 5: Pain Assessment ────────────────────────────────────
  () => videoGate('pain',
    'Understanding Back Pain & the VAS Scale',
    '2:30',
    'Learn how to accurately rate your pain intensity, identify pain location, and describe your pain pattern before completing this section.'
  ) + `
  <div class="step-hdr"><div class="step-title">Pain Assessment — VAS</div>
  <div class="step-desc">Location, intensity, character, duration, and functional impact of pain</div></div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Pain characteristics</div></div>
    <div class="grid2">
      <div class="field"><label>Pain location</label>
      <select onchange="D.pa.loc=this.value">
        <option value="" ${!D.pa.loc?'selected':''}>Select location</option>
        <option value="lower_back" ${D.pa.loc==='lower_back'?'selected':''}>Lower back — lumbar</option>
        <option value="mid_back" ${D.pa.loc==='mid_back'?'selected':''}>Mid back — thoracic</option>
        <option value="upper_back" ${D.pa.loc==='upper_back'?'selected':''}>Upper back / cervical</option>
        <option value="lower_leg" ${D.pa.loc==='lower_leg'?'selected':''}>Lower back with leg pain</option>
        <option value="bilateral" ${D.pa.loc==='bilateral'?'selected':''}>Bilateral / widespread</option>
        <option value="sacral" ${D.pa.loc==='sacral'?'selected':''}>Sacral / tailbone</option>
      </select></div>
      <div class="field"><label>Radiation / referred pain</label>
      <select onchange="D.pa.radiation=this.value;render()">
        <option value="no" ${D.pa.radiation==='no'?'selected':''}>No radiation</option>
        <option value="buttock" ${D.pa.radiation==='buttock'?'selected':''}>Into buttock</option>
        <option value="thigh" ${D.pa.radiation==='thigh'?'selected':''}>Into thigh</option>
        <option value="leg" ${D.pa.radiation==='leg'?'selected':''}>Into leg / below knee</option>
        <option value="foot" ${D.pa.radiation==='foot'?'selected':''}>Into foot / toes</option>
      </select></div>
    </div>
    <div class="field"><label>Pain intensity — VAS Score (0–10)</label>
    <div class="pain-scale">
      ${Array.from({length:11},(_,i)=>{
        const cls=D.pa.intensity===i?(i<=3?'active-low':i<=6?'active-mid':'active-high'):'';
        return `<button class="ps-btn ${cls}" onclick="D.pa.intensity=${i};render()">${i}</button>`;
      }).join('')}
    </div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-top:4px">
      <span>None</span><span>Moderate</span><span>Severe / Unbearable</span>
    </div>
    <div style="margin-top:8px;font-size:12px;color:var(--text3)">
      VAS Points: <strong style="color:${D.pa.intensity<=3?'var(--green)':D.pa.intensity<=6?'var(--amber)':'var(--red)'}">${D.pa.intensity<=3?'0 (Mild)':D.pa.intensity<=6?'1 (Moderate)':'2 (Severe)'}</strong>
    </div></div>
    <div class="grid2">
      <div class="field"><label>Pain duration</label>
      <select onchange="D.pa.duration=this.value">
        <option value="" ${!D.pa.duration?'selected':''}>Select</option>
        <option value="acute" ${D.pa.duration==='acute'?'selected':''}>Acute — under 6 weeks (Score: 0)</option>
        <option value="subacute" ${D.pa.duration==='subacute'?'selected':''}>Subacute — 6 to 12 weeks (Score: 1)</option>
        <option value="chronic" ${D.pa.duration==='chronic'?'selected':''}>Chronic — over 3 months (Score: 2)</option>
        <option value="recurrent" ${D.pa.duration==='recurrent'?'selected':''}>Recurrent episodes (Score: 2)</option>
      </select></div>
      <div class="field"><label>Pain pattern</label>
      <select onchange="D.pa.pattern=this.value">
        <option value="" ${!D.pa.pattern?'selected':''}>Select</option>
        <option value="constant" ${D.pa.pattern==='constant'?'selected':''}>Constant</option>
        <option value="intermittent" ${D.pa.pattern==='intermittent'?'selected':''}>Intermittent</option>
        <option value="position" ${D.pa.pattern==='position'?'selected':''}>Position-related</option>
        <option value="activity" ${D.pa.pattern==='activity'?'selected':''}>Activity-related</option>
        <option value="morning" ${D.pa.pattern==='morning'?'selected':''}>Morning stiffness</option>
      </select></div>
    </div>
    <div class="field"><label>Pain triggers</label>
    <input type="text" value="${D.pa.triggers}" placeholder="e.g. prolonged sitting, bending, lifting" oninput="D.pa.triggers=this.value"></div>
    <div class="field"><label>Functional limitations</label>
    <input type="text" value="${D.pa.limitations}" placeholder="e.g. cannot sit more than 20 minutes" oninput="D.pa.limitations=this.value"></div>
    ${D.pa.radiation==='leg'||D.pa.radiation==='foot'?`<div class="alert alert-danger">⚠ Pain radiating below the knee may indicate nerve root involvement. Complete the Radiculopathy section on the next step.</div>`:''}
  </div>
  </div>`,

  // ── STEP 6: Radiculopathy + ODI ───────────────────────────────
  () => {
    const odiOpts = [['normal','Normal (0)'],['mild','Mild difficulty (1)'],['severe','Severe difficulty (2)'],['severe3','Severe difficulty (3)']];
    const odiFields = [['walking','Walking'],['sitting','Sitting'],['standing','Standing'],['sleep','Sleep'],['daily','Daily Activities']];
    return `
    <div class="step-hdr"><div class="step-title">Radiculopathy & Disability</div>
    <div class="step-desc">Leg symptom severity (SSS Section 2) and Modified ODI disability scoring (SSS Section 3)</div></div>
` + videoGate('odi',
      'Understanding Nerve Pain & Daily Disability',
      '2:45',
      'Learn the difference between nerve pain and muscle pain, what radiculopathy means, and how to honestly rate your ability to perform daily activities.'
    ) + `
    <div class="card">
      <div class="card-hdr"><div class="card-dot" style="background:var(--red)"></div><div class="card-label">Leg radiculopathy / sciatica severity (0–3)</div></div>
      <div class="field"><label>Select severity grade</label>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[[0,'No pain / symptoms in leg'],[1,'Mild symptoms, occasional, not affecting activities'],
           [2,'Moderate symptoms, affects daily activities / walking'],
           [3,'Severe symptoms, constant pain, marked limitation in walking']].map(([v,l])=>`
        <label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;color:var(--text);font-weight:400;margin-bottom:0">
          <input type="radio" name="rad" value="${v}" ${D.cl.radiculopathy==v?'checked':''} onchange="D.cl.radiculopathy=${v}"
            style="margin-top:2px;accent-color:var(--purple);width:auto">
          <span><strong style="color:${v===0?'var(--green)':v===1?'var(--amber)':v===2?'#C2541A':'var(--red)'}">Score ${v}</strong> — ${l}</span>
        </label>`).join('')}
      </div></div>
    </div>
    <div class="card">
      <div class="card-hdr"><div class="card-dot" style="background:var(--blue)"></div><div class="card-label">Modified ODI disability score — rate each activity</div></div>
      ${odiFields.map(([k,l])=>`
      <div class="field">
        <label>${l}</label>
        <div class="tgroup">
          ${odiOpts.map(([v,lbl])=>`
          <button class="tbtn ${D.od[k]===v?(v==='normal'?'sel-normal':v==='mild'?'sel-mild':v==='severe'?'sel-mod':'sel-severe'):''}"
            onclick="D.od['${k}']='${v}';render()">${lbl}</button>`).join('')}
        </div>
      </div>`).join('')}
      <div style="margin-top:12px;padding:12px;background:var(--bg3);border-radius:var(--r);font-size:13px">
        ODI Total: <strong style="color:var(--purple2)">${['walking','sitting','standing','sleep','daily'].reduce((a,f)=>a+({'normal':0,'mild':1,'severe':2,'severe3':3}[D.od[f]]||0),0)}/15</strong>
        — Points: <strong style="color:var(--purple2)">${['walking','sitting','standing','sleep','daily'].reduce((a,f)=>a+({'normal':0,'mild':1,'severe':2,'severe3':3}[D.od[f]]||0),0)<=2?'0':['walking','sitting','standing','sleep','daily'].reduce((a,f)=>a+({'normal':0,'mild':1,'severe':2,'severe3':3}[D.od[f]]||0),0)<=5?'1':'2'}/2</strong>
      </div>
    </div>`;
  },

  // ── STEP 7: Red Flag Screening ────────────────────────────────
  () => {
    const flags = [
      ['cancer',           'History of cancer'],
      ['weightLoss',       'Unexplained weight loss'],
      ['fever',            'Fever / infection'],
      ['trauma',           'Recent major trauma'],
      ['bowelBladder',     'Bowel or bladder dysfunction'],
      ['saddleAnesthesia', 'Saddle anesthesia'],
      ['neurologicDeficit','Progressive neurological deficit'],
      ['otherPathology',   'Other serious pathology suspicion'],
    ];
    const anyFlag = Object.values(D.rf).some(v=>v);
    return `
    <div class="step-hdr"><div class="step-title">Red Flag Screening</div>
    <div class="step-desc">SSS Section 6 — Tick if present. Any red flag automatically sets SSS score to 11 (urgent).</div></div>
` + videoGate('redflag',
      'Understanding Red Flags in Back Pain',
      '3:00',
      'Some back pain symptoms require urgent medical attention. This video explains each red flag warning sign in plain language so you can answer accurately and safely.'
    ) + `
    <div class="card">
      <div class="card-hdr"><div class="card-dot" style="background:var(--red)"></div><div class="card-label">Red flag indicators</div></div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${flags.map(([k,l])=>`
        <label style="display:flex;align-items:center;gap:12px;cursor:pointer;color:var(--text);font-weight:400;margin-bottom:0;padding:10px 12px;background:${D.rf[k]?'var(--red-dim)':'var(--bg3)'};border-radius:var(--r);border:1px solid ${D.rf[k]?'#EF444433':'var(--border)'}">
          <input type="checkbox" ${D.rf[k]?'checked':''} onchange="D.rf['${k}']=this.checked;render()"
            style="accent-color:var(--red);width:16px;height:16px">
          <span style="color:${D.rf[k]?'#FF9090':'var(--text2)'}">${l}</span>
        </label>`).join('')}
      </div>
      ${anyFlag?`<div class="alert alert-danger" style="margin-top:16px">
        ⚠ <strong>RED FLAG PRESENT — SSS Score automatically = 11.</strong> Urgent spine specialist evaluation required. Do not delay.
      </div>`:`<div class="alert alert-info" style="margin-top:16px">✓ No red flags selected — continue with standard assessment.</div>`}
    </div>
    </div>`;
  },

  // ── STEP 8: Functional Status ──────────────────────────────────
  () => {
    const F=[['sit','Sitting tolerance'],['stand','Standing tolerance'],['walk','Walking capacity'],['stairs','Stair climbing'],['lift','Lifting ability']];
    const O=[['normal','Normal','sel-normal'],['mildly_limited','Mildly limited','sel-mild'],['moderately_limited','Moderately limited','sel-mod'],['severely_limited','Severely limited','sel-severe']];
    return `
    <div class="step-hdr"><div class="step-title">Functional Assessment</div>
    <div class="step-desc">Current physical capacity across key daily movement patterns</div></div>
    <div class="card">
      ${F.map(([k,l])=>`
      <div class="field"><label>${l}</label>
      <div class="tgroup">${O.map(([v,lbl,cls])=>`
        <button class="tbtn ${D.fn[k]===v?cls:''}" onclick="D.fn['${k}']='${v}';render()">${lbl}</button>`).join('')}
      </div></div>`).join('')}
    </div>`;
  },

  // ── STEP 9: Risk Report ────────────────────────────────────────
  () => {
    const sc  = score();
    const sss = calcSSS();
    const bench = habitBenchmark();
    const contribs = getContributors();
    const anyRedFlag = Object.values(D.rf).some(v=>v);

    const SCORES=[['Lifestyle',sc.lifestyle,'#8B7CF6'],['Activity',sc.activity,'#00B4A0'],
      ['Sleep',sc.sleep,'#3B82F6'],['Mobility',sc.mobility,'#F59E0B'],['Weight',sc.obesity,'#22C55E']];

    // SSS breakdown
    const sssItems=[
      ['VAS Back Pain', sss.vas, 2],
      ['Leg Radiculopathy', sss.radiculopathy, 3],
      ['ODI Disability', sss.odi, 2],
      ['BMI Load', sss.bmiScore, 2],
      ['Chronicity', sss.chronicity, 2],
    ];

    return `
    <div class="step-hdr"><div class="step-title">Risk Report</div>
    <div class="step-desc">SSS clinical scoring + evidence-based AI assessment</div></div>

    <div class="summary-bar">
      <div class="sum-cell"><div class="sum-lbl">Patient</div><div class="sum-val">${D.p.name||'—'}</div></div>
      <div class="sum-cell"><div class="sum-lbl">Age</div><div class="sum-val">${D.p.age?D.p.age+' yrs':'—'}</div></div>
      <div class="sum-cell"><div class="sum-lbl">BMI</div><div class="sum-val" style="color:${bmiCol(D.p.bmi)}">${D.p.bmi||'—'}</div></div>
      <div class="sum-cell"><div class="sum-lbl">Classification</div><div class="sum-val" style="font-size:12px;color:${bmiCol(D.p.bmi)}">${bmiLbl(D.p.bmi)||'—'}</div></div>
      <div class="sum-cell"><div class="sum-lbl">Occupation</div><div class="sum-val" style="font-size:12px;text-transform:capitalize">${D.oc.type||'—'}</div></div>
    </div>

    ${anyRedFlag?`<div class="alert alert-danger" style="margin-bottom:16px;font-size:14px">
      🚨 <strong>RED FLAG DETECTED — SSS Score = 11. Urgent spine specialist evaluation required.</strong>
    </div>`:''}

    <!-- SSS SCORE -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-hdr"><div class="card-dot" style="background:${sss.col}"></div><div class="card-label">Spine Severity System (SSS) Score — Clinical</div></div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:14px">
        ${sssItems.map(([l,v,mx])=>`
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:10px;text-align:center">
          <div style="font-size:10px;color:var(--text3);margin-bottom:6px;letter-spacing:0.5px">${l}</div>
          <div style="font-size:20px;font-weight:700;color:var(--purple2)">${v}<span style="font-size:11px;color:var(--text3)">/${mx}</span></div>
        </div>`).join('')}
      </div>
      <div style="background:${sss.bg};border:1px solid ${sss.col}33;border-radius:var(--r);padding:16px 20px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${sss.col};margin-bottom:4px">Total SSS Score</div>
          <div style="font-family:'Syne',sans-serif;font-size:42px;font-weight:800;color:${sss.col};line-height:1">${sss.total}<span style="font-size:18px">/11</span></div>
        </div>
        <div style="text-align:right">
          <div style="background:${sss.col};color:#fff;padding:8px 18px;border-radius:20px;font-weight:700;font-size:14px;margin-bottom:6px">${sss.level}</div>
          <div style="font-size:12px;color:${sss.col}">${sss.mgmt}</div>
        </div>
      </div>
    </div>

    <!-- DIMENSION SCORES -->
    <div class="card">
      <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Lifestyle dimension scores (0–100)</div></div>
      <div class="score-grid">
        ${SCORES.map(([l,v,c])=>`
        <div class="score-cell"><div class="sc-label">${l}</div>${ring(v,c)}<div class="sc-val" style="color:${c}">${v}</div></div>`).join('')}
      </div>
    </div>

    <!-- RISK SCORE -->
    <div class="risk-banner" style="background:${sc.riskBg};border:1px solid ${sc.riskBdr}">
      <div>
        <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${sc.riskCol};margin-bottom:4px">Back Pain Risk Score</div>
        <div class="risk-score-num" style="color:${sc.riskCol}">${sc.risk}<span style="font-size:24px">/100</span></div>
        <div style="font-size:12px;color:${sc.riskCol};opacity:.7;margin-top:3px">5-dimension lifestyle analysis</div>
      </div>
      <div><div class="risk-badge2" style="background:${sc.riskCol};color:#fff">${sc.riskLvl}</div></div>
    </div>

    <!-- AGE BENCHMARK -->
    ${bench?`<div class="card">
      <div class="card-hdr"><div class="card-dot" style="background:var(--blue)"></div>
      <div class="card-label">Age-specific habit benchmark — ${bench.group}</div></div>
      <div class="contrib-list">${bench.flags.map(f=>`
        <div class="contrib-item"><div class="contrib-dot" style="background:${f.col}"></div>${f.text}</div>`).join('')}
      </div>
    </div>`:''}

    <!-- CONTRIBUTORS -->
    <div class="card">
      <div class="card-hdr"><div class="card-dot" style="background:var(--amber)"></div><div class="card-label">Probable pain contributors</div></div>
      <div class="contrib-list">${contribs.map(([t,c])=>`
        <div class="contrib-item"><div class="contrib-dot" style="background:${c}"></div>${t}</div>`).join('')}
      </div>
    </div>

    <button class="gen-btn" id="gbtn" onclick="genReport()">✦ Generate AI Clinical Report</button>
    <div id="rout"></div>
    <div id="download-wrap"></div>`;
  }
];
