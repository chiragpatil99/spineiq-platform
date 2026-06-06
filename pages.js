/**
 * SpineIQ — Page Templates
 * Each function returns an HTML string for its assessment step.
 * Pages are assembled by app.js render().
 */

/** SVG score ring helper */
function ring(val, col, size = 60) {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="sc-ring">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--bg4)" stroke-width="6"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${col}" stroke-width="6"
      stroke-dasharray="${(val/100)*c} ${c}" stroke-linecap="round"
      transform="rotate(-90 ${size/2} ${size/2})"/>
    <text x="${size/2}" y="${size/2+5}" text-anchor="middle" font-size="14" font-weight="700"
      fill="${col}" font-family="Inter,sans-serif">${val}</text>
  </svg>`;
}

const PAGES = [

  // ── STEP 0: Patient Information ────────────────────────────────
  () => `
  <div class="step-hdr">
    <div class="step-title">Patient Information</div>
    <div class="step-desc">Core demographic data and anthropometric measurements</div>
  </div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Identity</div></div>
    <div class="field">
      <label>Full name</label>
      <input type="text" value="${D.p.name}" placeholder="Patient full name"
        oninput="D.p.name=this.value">
    </div>
    <div class="grid3">
      <div class="field">
        <label>Age (years)</label>
        <input type="number" value="${D.p.age}" placeholder="e.g. 38" oninput="D.p.age=this.value">
      </div>
      <div class="field">
        <label>Biological sex</label>
        <select onchange="D.p.gender=this.value">
          <option value="" ${!D.p.gender ? 'selected' : ''}>Select</option>
          <option value="male"   ${D.p.gender === 'male'   ? 'selected' : ''}>Male</option>
          <option value="female" ${D.p.gender === 'female' ? 'selected' : ''}>Female</option>
          <option value="other"  ${D.p.gender === 'other'  ? 'selected' : ''}>Other</option>
          <option value="pns"    ${D.p.gender === 'pns'    ? 'selected' : ''}>Prefer not to say</option>
        </select>
      </div>
      <div class="field"></div>
    </div>
  </div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Body measurements</div></div>
    <div class="grid3">
      <div class="field">
        <label>Height (cm)</label>
        <input type="number" id="ht" value="${D.p.height}" placeholder="170" oninput="updBMI()">
      </div>
      <div class="field">
        <label>Weight (kg)</label>
        <input type="number" id="wt" value="${D.p.weight}" placeholder="70" oninput="updBMI()">
      </div>
      <div class="field">
        <label>BMI — auto-calculated</label>
        <div class="bmi-badge" id="bmi-bd" style="color:${bmiCol(D.p.bmi)}">
          ${D.p.bmi ? `${D.p.bmi} — ${bmiLbl(D.p.bmi)}` : 'Enter height & weight'}
        </div>
      </div>
    </div>
  </div>`,

  // ── STEP 1: Occupation ─────────────────────────────────────────
  () => `
  <div class="step-hdr">
    <div class="step-title">Occupation</div>
    <div class="step-desc">Understanding the patient's professional role and work environment</div>
  </div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Role classification</div></div>
    <div class="field">
      <label>Occupation type</label>
      <select onchange="D.oc.type=this.value;render()">
        <option value=""           ${!D.oc.type                ? 'selected':''}>Select occupation category</option>
        <option value="office"     ${D.oc.type==='office'     ? 'selected':''}>Office Worker — predominantly desk-based</option>
        <option value="field"      ${D.oc.type==='field'      ? 'selected':''}>Field Worker — outdoor / site-based</option>
        <option value="driver"     ${D.oc.type==='driver'     ? 'selected':''}>Driver — vehicle operator</option>
        <option value="homemaker"  ${D.oc.type==='homemaker'  ? 'selected':''}>Homemaker / Caregiver</option>
        <option value="student"    ${D.oc.type==='student'    ? 'selected':''}>Student</option>
        <option value="manual"     ${D.oc.type==='manual'     ? 'selected':''}>Manual Labour — physical work</option>
        <option value="healthcare" ${D.oc.type==='healthcare' ? 'selected':''}>Healthcare Professional</option>
        <option value="other"      ${D.oc.type==='other'      ? 'selected':''}>Other</option>
      </select>
    </div>
    ${D.oc.type === 'other' ? `
    <div class="field">
      <label>Specify occupation</label>
      <input type="text" value="${D.oc.other}" placeholder="Describe occupation" oninput="D.oc.other=this.value">
    </div>` : ''}
    ${D.oc.type === 'office' || D.oc.type === 'student' ? `
    <div class="alert alert-warn">⚠ Desk-based occupations are associated with prolonged static loading of the lumbar spine and hip flexor tightening. This will be factored into your risk assessment.</div>` : ''}
    ${D.oc.type === 'driver' ? `
    <div class="alert alert-warn">⚠ Driving occupations expose the spine to whole-body vibration and sustained flexion posture — both established risk factors for lumbar disc pathology.</div>` : ''}
    ${D.oc.type === 'manual' ? `
    <div class="alert alert-danger">⚠ Manual labour involves repetitive mechanical loading of spinal structures. Combined with other risk factors this significantly elevates injury risk.</div>` : ''}
  </div>`,

  // ── STEP 2: Work Patterns ──────────────────────────────────────
  () => `
  <div class="step-hdr">
    <div class="step-title">Work Patterns</div>
    <div class="step-desc">Daily time distribution and physical demands at work</div>
  </div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Postural time distribution</div></div>
    ${[['sitting','Sitting hours per day',0,16,'h'],['standing','Standing hours per day',0,12,'h'],['driving','Driving hours per day',0,12,'h']].map(([k,l,mn,mx,u]) => `
    <div class="field">
      <div class="rlrow">
        <label>${l}</label>
        <span class="rv" id="rv-${k}">${D.wp[k]}${u}</span>
      </div>
      <input type="range" min="${mn}" max="${mx}" step="0.5" value="${D.wp[k]}"
        oninput="D.wp['${k}']=+this.value;document.getElementById('rv-${k}').textContent=this.value+'${u}';checkSitting()">
    </div>`).join('')}
    <div id="sitting-alert"></div>
  </div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Lifting demands</div></div>
    <div class="field">
      <label>Lifting activity level</label>
      <select onchange="D.wp.lifting=this.value;render()">
        <option value="none"     ${D.wp.lifting==='none'     ? 'selected':''}>None / minimal</option>
        <option value="light"    ${D.wp.lifting==='light'    ? 'selected':''}>Light — under 5 kg occasionally</option>
        <option value="moderate" ${D.wp.lifting==='moderate' ? 'selected':''}>Moderate — 5–15 kg regularly</option>
        <option value="heavy"    ${D.wp.lifting==='heavy'    ? 'selected':''}>Heavy — over 15 kg frequently</option>
      </select>
    </div>
    ${D.wp.lifting === 'heavy' ? `
    <div class="alert alert-danger">⚠ Frequent heavy lifting is a primary risk factor for lumbar disc herniation and facet joint degeneration.</div>` : ''}
  </div>`,

  // ── STEP 3: Lifestyle ──────────────────────────────────────────
  () => `
  <div class="step-hdr">
    <div class="step-title">Lifestyle Assessment</div>
    <div class="step-desc">Sleep, physical activity, and daily movement patterns</div>
  </div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Sleep</div></div>
    <div class="grid2">
      <div class="field">
        <div class="rlrow">
          <label>Sleep duration (hours/night)</label>
          <span class="rv" id="rv-sl">${D.ls.sleep}h</span>
        </div>
        <input type="range" min="3" max="12" step="0.5" value="${D.ls.sleep}"
          oninput="D.ls.sleep=+this.value;document.getElementById('rv-sl').textContent=this.value+'h'">
      </div>
      <div class="field">
        <label>Sleep quality</label>
        <select onchange="D.ls.sleepQ=this.value">
          <option value="excellent" ${D.ls.sleepQ==='excellent' ? 'selected':''}>Excellent — refreshed on waking</option>
          <option value="good"      ${D.ls.sleepQ==='good'      ? 'selected':''}>Good — mostly restful</option>
          <option value="fair"      ${D.ls.sleepQ==='fair'      ? 'selected':''}>Fair — some disturbances</option>
          <option value="poor"      ${D.ls.sleepQ==='poor'      ? 'selected':''}>Poor — frequently disrupted</option>
        </select>
      </div>
    </div>
    ${D.ls.sleep < 6 ? `
    <div class="alert alert-warn">⚠ Less than 6 hours sleep is associated with increased pain sensitivity and impaired musculoskeletal recovery.</div>` : ''}
  </div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Physical activity</div></div>
    <div class="grid2">
      <div class="field">
        <div class="rlrow">
          <label>Walking minutes per day</label>
          <span class="rv" id="rv-wk">${D.ls.walking} min</span>
        </div>
        <input type="range" min="0" max="120" step="5" value="${D.ls.walking}"
          oninput="D.ls.walking=+this.value;document.getElementById('rv-wk').textContent=this.value+' min'">
      </div>
      <div class="field">
        <label>Daily step count</label>
        <input type="number" value="${D.ls.steps}" placeholder="e.g. 8000" oninput="D.ls.steps=+this.value">
      </div>
    </div>
    <div class="grid2">
      <div class="field">
        <label>Exercise frequency</label>
        <select onchange="D.ls.exFreq=this.value">
          <option value="none"  ${D.ls.exFreq==='none'  ? 'selected':''}>None — sedentary</option>
          <option value="once"  ${D.ls.exFreq==='once'  ? 'selected':''}>Once per week</option>
          <option value="twice" ${D.ls.exFreq==='twice' ? 'selected':''}>Twice per week</option>
          <option value="three" ${D.ls.exFreq==='three' ? 'selected':''}>3–4 times per week</option>
          <option value="daily" ${D.ls.exFreq==='daily' ? 'selected':''}>Daily</option>
        </select>
      </div>
      <div class="field">
        <label>Exercise type</label>
        <input type="text" value="${D.ls.exType}" placeholder="e.g. swimming, yoga, strength"
          oninput="D.ls.exType=this.value">
      </div>
    </div>
    <div class="field">
      <div class="rlrow">
        <label>Active minutes per day</label>
        <span class="rv" id="rv-am">${D.ls.activeMin} min</span>
      </div>
      <input type="range" min="0" max="180" step="5" value="${D.ls.activeMin}"
        oninput="D.ls.activeMin=+this.value;document.getElementById('rv-am').textContent=this.value+' min'">
    </div>
  </div>`,

  // ── STEP 4: Health Data ────────────────────────────────────────
  () => {
    const WEARABLES = [
      { id:'manual',    icon:'📋', name:'Manual Entry' },
      { id:'apple',     icon:'⌚', name:'Apple Watch'  },
      { id:'fitbit',    icon:'💚', name:'Fitbit'       },
      { id:'samsung',   icon:'📱', name:'Samsung'      },
      { id:'garmin',    icon:'🏃', name:'Garmin'       },
      { id:'xiaomi',    icon:'🔴', name:'Mi Band'      },
      { id:'amazfit',   icon:'🔵', name:'Amazfit'      },
      { id:'oneplus',   icon:'🟢', name:'OnePlus'      },
      { id:'googlefit', icon:'🔷', name:'Google Fit'   },
      { id:'other',     icon:'◉',  name:'Other'        },
    ];
    const selected = WEARABLES.find(x => x.id === D.hd.src);
    return `
    <div class="step-hdr">
      <div class="step-title">Health &amp; Fitness Data</div>
      <div class="step-desc">Import from wearable device or enter manually. Architecture is wearable-agnostic.</div>
    </div>
    <div class="card">
      <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Data source</div></div>
      <div class="wgrid">
        ${WEARABLES.map(w => `
        <button class="wcard ${D.hd.src === w.id ? 'sel' : ''}" onclick="D.hd.src='${w.id}';render()">
          <div class="wcard-icon">${w.icon}</div>${w.name}
        </button>`).join('')}
      </div>
      ${D.hd.src !== 'manual' ? `
      <div class="alert alert-info">ℹ <strong>Phase 2 feature:</strong> Automatic sync from
        ${selected ? selected.name : 'this device'} will be enabled via OAuth health platform APIs
        (Apple HealthKit, Fitbit Web API, Google Fit REST API, Garmin Connect, etc.).
        All data points below will be auto-populated. Please enter manually for this assessment.
      </div>` : ''}
    </div>
    <div class="card">
      <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Health metrics</div></div>
      <div class="grid3">
        ${[['steps','Daily steps','e.g. 8500'],['walkMin','Walking minutes','e.g. 45'],
           ['exMin','Exercise minutes','e.g. 30'],['activeMin','Active minutes','e.g. 60'],
           ['sedentary','Sedentary hours','e.g. 9'],['sleepDur','Sleep hours','e.g. 7.5'],
           ['rhr','Resting HR (bpm)','e.g. 65'],['weight','Weight (kg)','e.g. 74']
          ].map(([k, l, ph]) => `
        <div class="field">
          <label>${l}</label>
          <input type="number" value="${D.hd[k] || ''}" placeholder="${ph}"
            oninput="D.hd['${k}']=this.value">
        </div>`).join('')}
        <div></div>
      </div>
    </div>`;
  },

  // ── STEP 5: Pain Assessment ────────────────────────────────────
  () => `
  <div class="step-hdr">
    <div class="step-title">Pain Assessment</div>
    <div class="step-desc">Location, character, duration, and functional impact of pain</div>
  </div>
  <div class="card">
    <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Pain characteristics</div></div>
    <div class="grid2">
      <div class="field">
        <label>Pain location</label>
        <select onchange="D.pa.loc=this.value">
          <option value=""            ${!D.pa.loc                   ? 'selected':''}>Select location</option>
          <option value="lower_back"  ${D.pa.loc==='lower_back'     ? 'selected':''}>Lower back — lumbar region</option>
          <option value="mid_back"    ${D.pa.loc==='mid_back'       ? 'selected':''}>Mid back — thoracic region</option>
          <option value="upper_back"  ${D.pa.loc==='upper_back'     ? 'selected':''}>Upper back / cervical</option>
          <option value="lower_leg"   ${D.pa.loc==='lower_leg'      ? 'selected':''}>Lower back with leg pain</option>
          <option value="bilateral"   ${D.pa.loc==='bilateral'      ? 'selected':''}>Bilateral / widespread</option>
          <option value="sacral"      ${D.pa.loc==='sacral'         ? 'selected':''}>Sacral / tailbone</option>
        </select>
      </div>
      <div class="field">
        <label>Radiation / referred pain</label>
        <select onchange="D.pa.radiation=this.value;render()">
          <option value="no"      ${D.pa.radiation==='no'      ? 'selected':''}>No radiation</option>
          <option value="buttock" ${D.pa.radiation==='buttock' ? 'selected':''}>Into buttock</option>
          <option value="thigh"   ${D.pa.radiation==='thigh'   ? 'selected':''}>Into thigh</option>
          <option value="leg"     ${D.pa.radiation==='leg'     ? 'selected':''}>Into leg / below knee</option>
          <option value="foot"    ${D.pa.radiation==='foot'    ? 'selected':''}>Into foot / toes</option>
        </select>
      </div>
    </div>
    <div class="field">
      <label>Pain intensity — select a value from 0 to 10</label>
      <div class="pain-scale">
        ${Array.from({length:11}, (_, i) => {
          const cls = D.pa.intensity === i
            ? (i <= 3 ? 'active-low' : i <= 6 ? 'active-mid' : 'active-high') : '';
          return `<button class="ps-btn ${cls}" onclick="D.pa.intensity=${i};render()">${i}</button>`;
        }).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-top:4px">
        <span>None</span><span>Moderate</span><span>Severe / Unbearable</span>
      </div>
    </div>
    <div class="grid2">
      <div class="field">
        <label>Pain duration</label>
        <select onchange="D.pa.duration=this.value">
          <option value=""         ${!D.pa.duration              ? 'selected':''}>Select</option>
          <option value="acute"    ${D.pa.duration==='acute'     ? 'selected':''}>Acute — under 6 weeks</option>
          <option value="subacute" ${D.pa.duration==='subacute'  ? 'selected':''}>Subacute — 6 to 12 weeks</option>
          <option value="chronic"  ${D.pa.duration==='chronic'   ? 'selected':''}>Chronic — over 3 months</option>
          <option value="recurrent"${D.pa.duration==='recurrent' ? 'selected':''}>Recurrent episodes</option>
        </select>
      </div>
      <div class="field">
        <label>Pain pattern</label>
        <select onchange="D.pa.pattern=this.value">
          <option value=""          ${!D.pa.pattern               ? 'selected':''}>Select</option>
          <option value="constant"  ${D.pa.pattern==='constant'   ? 'selected':''}>Constant</option>
          <option value="intermittent"${D.pa.pattern==='intermittent'?'selected':''}>Intermittent</option>
          <option value="position"  ${D.pa.pattern==='position'   ? 'selected':''}>Position-related</option>
          <option value="activity"  ${D.pa.pattern==='activity'   ? 'selected':''}>Activity-related</option>
          <option value="morning"   ${D.pa.pattern==='morning'    ? 'selected':''}>Morning stiffness</option>
        </select>
      </div>
    </div>
    <div class="field">
      <label>Pain triggers</label>
      <input type="text" value="${D.pa.triggers}"
        placeholder="e.g. prolonged sitting, bending forward, lifting" oninput="D.pa.triggers=this.value">
    </div>
    <div class="field">
      <label>Functional limitations</label>
      <input type="text" value="${D.pa.limitations}"
        placeholder="e.g. cannot sit more than 20 minutes, difficulty with stairs"
        oninput="D.pa.limitations=this.value">
    </div>
    ${D.pa.radiation === 'leg' || D.pa.radiation === 'foot' ? `
    <div class="alert alert-danger">⚠ Pain radiating below the knee may indicate nerve root involvement (radiculopathy / sciatica). This warrants further clinical investigation.</div>` : ''}
  </div>`,

  // ── STEP 6: Functional Status ──────────────────────────────────
  () => {
    const FIELDS = [
      ['sit',    'Sitting tolerance',  'How long can the patient sit continuously?'],
      ['stand',  'Standing tolerance', 'How long can the patient stand?'],
      ['walk',   'Walking capacity',   'Distance / duration of comfortable walking'],
      ['stairs', 'Stair climbing',     'Ability to ascend / descend stairs'],
      ['lift',   'Lifting ability',    'Capacity to lift and carry objects'],
    ];
    const OPTS = [
      ['normal',             'Normal',              'sel-normal'],
      ['mildly_limited',     'Mildly limited',      'sel-mild'  ],
      ['moderately_limited', 'Moderately limited',  'sel-mod'   ],
      ['severely_limited',   'Severely limited',    'sel-severe'],
    ];
    return `
    <div class="step-hdr">
      <div class="step-title">Functional Assessment</div>
      <div class="step-desc">Current physical capacity across key daily movement patterns</div>
    </div>
    <div class="card">
      ${FIELDS.map(([k, l, d]) => `
      <div class="field">
        <label>${l} <span style="font-weight:400;color:var(--text3);font-size:12px">— ${d}</span></label>
        <div class="tgroup">
          ${OPTS.map(([v, lbl, cls]) => `
          <button class="tbtn ${D.fn[k] === v ? cls : ''}"
            onclick="D.fn['${k}']='${v}';render()">${lbl}</button>`).join('')}
        </div>
      </div>`).join('')}
    </div>`;
  },

  // ── STEP 7: Risk Report ────────────────────────────────────────
  () => {
    const sc = score();
    const SCORES = [
      ['Lifestyle', sc.lifestyle, '#8B7CF6'],
      ['Activity',  sc.activity,  '#00B4A0'],
      ['Sleep',     sc.sleep,     '#3B82F6'],
      ['Mobility',  sc.mobility,  '#F59E0B'],
      ['Weight',    sc.obesity,   '#22C55E'],
    ];
    const contribs = getContributors();

    return `
    <div class="step-hdr">
      <div class="step-title">Risk Report</div>
      <div class="step-desc">Evidence-based scoring and AI-generated clinical assessment</div>
    </div>

    <div class="summary-bar">
      <div class="sum-cell"><div class="sum-lbl">Patient</div><div class="sum-val">${D.p.name || '—'}</div></div>
      <div class="sum-cell"><div class="sum-lbl">Age</div><div class="sum-val">${D.p.age ? D.p.age + ' yrs' : '—'}</div></div>
      <div class="sum-cell"><div class="sum-lbl">BMI</div><div class="sum-val" style="color:${bmiCol(D.p.bmi)}">${D.p.bmi || '—'}</div></div>
      <div class="sum-cell"><div class="sum-lbl">Classification</div>
        <div class="sum-val" style="font-size:13px;color:${bmiCol(D.p.bmi)}">${bmiLbl(D.p.bmi) || '—'}</div>
      </div>
      <div class="sum-cell"><div class="sum-lbl">Occupation</div>
        <div class="sum-val" style="font-size:12px;text-transform:capitalize">${D.oc.type || '—'}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-hdr"><div class="card-dot"></div><div class="card-label">Dimension scores (0–100)</div></div>
      <div class="score-grid">
        ${SCORES.map(([l, v, c]) => `
        <div class="score-cell">
          <div class="sc-label">${l}</div>
          ${ring(v, c)}
          <div class="sc-val" style="color:${c}">${v}</div>
        </div>`).join('')}
      </div>
    </div>

    <div class="risk-banner" style="background:${sc.riskBg};border:1px solid ${sc.riskBdr}">
      <div>
        <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${sc.riskCol};margin-bottom:4px">
          Back Pain Risk Score
        </div>
        <div class="risk-score-num" style="color:${sc.riskCol}">
          ${sc.risk}<span style="font-size:24px">/100</span>
        </div>
        <div class="risk-score-sub" style="color:${sc.riskCol}">Based on 5-dimension analysis</div>
      </div>
      <div>
        <div class="risk-badge2" style="background:${sc.riskCol};color:#fff">${sc.riskLvl}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-hdr">
        <div class="card-dot" style="background:var(--amber)"></div>
        <div class="card-label">Probable pain contributors</div>
      </div>
      <div class="contrib-list">
        ${contribs.map(([t, c]) => `
        <div class="contrib-item">
          <div class="contrib-dot" style="background:${c}"></div>${t}
        </div>`).join('')}
      </div>
    </div>

    <button class="gen-btn" id="gbtn" onclick="genReport()">✦ Generate AI Clinical Report</button>
    <div id="rout"></div>`;
  }

]; // end PAGES
