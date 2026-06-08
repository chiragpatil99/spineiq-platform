/**
 * SpineIQ — Google Fit OAuth Integration
 * Fetches steps, sleep, heart rate, weight, and activity data
 * using Google Fit REST API with OAuth 2.0.
 */

const GOOGLE_CLIENT_ID = '633948181935-ufu7qsjsdpddupuhbi1cgu3ph50q10no.apps.googleusercontent.com';
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.body.read',
].join(' ');

let googleAccessToken = null;

// ── OAUTH LOGIN ───────────────────────────────────────────────────
function connectGoogleFit() {
  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  window.location.origin + window.location.pathname,
    response_type: 'token',
    scope:         GOOGLE_SCOPES,
    include_granted_scopes: 'true',
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// ── HANDLE REDIRECT ───────────────────────────────────────────────
function handleGoogleFitCallback() {
  const hash = window.location.hash.substring(1);
  if (!hash) return false;
  const params = new URLSearchParams(hash);
  const token  = params.get('access_token');
  if (!token) return false;
  googleAccessToken = token;
  // Clean URL
  window.history.replaceState({}, document.title, window.location.pathname);
  return true;
}

// ── FETCH HELPERS ─────────────────────────────────────────────────
async function fitPOST(endpoint, body) {
  const r = await fetch(`https://www.googleapis.com/fitness/v1/users/me/${endpoint}`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${googleAccessToken}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  return r.json();
}

async function fitGET(endpoint) {
  const r = await fetch(`https://www.googleapis.com/fitness/v1/users/me/${endpoint}`, {
    headers: { Authorization: `Bearer ${googleAccessToken}` },
  });
  return r.json();
}

// ── TIME HELPERS ──────────────────────────────────────────────────
function last7DaysNanos() {
  const now   = Date.now();
  const start = now - 7 * 24 * 60 * 60 * 1000;
  return { startTimeNanos: String(start * 1e6), endTimeNanos: String(now * 1e6) };
}

function todayNanos() {
  const now   = Date.now();
  const start = new Date(); start.setHours(0,0,0,0);
  return { startTimeNanos: String(start.getTime() * 1e6), endTimeNanos: String(now * 1e6) };
}

// ── FETCH ALL FITNESS DATA ────────────────────────────────────────
async function fetchGoogleFitData() {
  const { startTimeNanos, endTimeNanos } = last7DaysNanos();

  const aggregateBody = {
    aggregateBy: [
      { dataTypeName: 'com.google.step_count.delta' },
      { dataTypeName: 'com.google.active_minutes'   },
      { dataTypeName: 'com.google.calories.expended'},
      { dataTypeName: 'com.google.heart_rate.bpm'   },
      { dataTypeName: 'com.google.weight'            },
      { dataTypeName: 'com.google.sleep.segment'     },
    ],
    bucketByTime:  { durationMillis: 86400000 }, // 1 day buckets
    startTimeMillis: String(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endTimeMillis:   String(Date.now()),
  };

  try {
    const data = await fitPOST('dataset:aggregate', aggregateBody);

    let totalSteps = 0, totalActiveMin = 0, avgHR = 0, hrCount = 0;
    let latestWeight = 0, totalSleepMin = 0, sleepDays = 0;

    if (data.bucket) {
      data.bucket.forEach(bucket => {
        bucket.dataset?.forEach(ds => {
          ds.point?.forEach(pt => {
            const type = ds.dataSourceId || '';

            // Steps
            if (type.includes('step_count')) {
              pt.value?.forEach(v => { totalSteps += v.intVal || 0; });
            }
            // Active minutes
            if (type.includes('active_minutes')) {
              pt.value?.forEach(v => { totalActiveMin += v.intVal || 0; });
            }
            // Heart rate
            if (type.includes('heart_rate')) {
              pt.value?.forEach(v => { if (v.fpVal) { avgHR += v.fpVal; hrCount++; } });
            }
            // Weight
            if (type.includes('weight')) {
              pt.value?.forEach(v => { if (v.fpVal) latestWeight = v.fpVal; });
            }
            // Sleep
            if (type.includes('sleep')) {
              pt.value?.forEach(v => {
                // Sleep segment types: 1=awake, 2=sleep, 3=out-of-bed, 4=light, 5=deep, 6=REM
                if (v.intVal >= 2) {
                  const durationMs = (parseInt(pt.endTimeNanos) - parseInt(pt.startTimeNanos)) / 1e6;
                  totalSleepMin += durationMs / 60000;
                  sleepDays++;
                }
              });
            }
          });
        });
      });
    }

    const avgSteps     = Math.round(totalSteps / 7);
    const avgActiveMin = Math.round(totalActiveMin / 7);
    const avgSleepHrs  = sleepDays > 0 ? (totalSleepMin / sleepDays / 60).toFixed(1) : 0;
    const finalHR      = hrCount > 0 ? Math.round(avgHR / hrCount) : 0;

    return {
      steps:      avgSteps,
      activeMin:  avgActiveMin,
      sleepDur:   avgSleepHrs,
      rhr:        finalHR,
      weight:     latestWeight ? latestWeight.toFixed(1) : '',
      walkMin:    Math.round(avgActiveMin * 0.6), // estimate
      exMin:      Math.round(avgActiveMin * 0.4), // estimate
    };

  } catch (err) {
    console.error('Google Fit fetch error:', err);
    return null;
  }
}

// ── POPULATE FORM ─────────────────────────────────────────────────
async function syncGoogleFitData(onComplete) {
  const btn = document.getElementById('gfit-sync-btn');
  const status = document.getElementById('gfit-status');
  if (btn) { btn.disabled = true; btn.textContent = 'Syncing…'; }
  if (status) status.innerHTML = '<div class="gen-loading"><div class="spinner"></div>Fetching your Google Fit data…</div>';

  const fitData = await fetchGoogleFitData();

  if (!fitData) {
    if (status) status.innerHTML = '<div class="alert alert-danger">Failed to fetch data. Please try again or enter manually.</div>';
    if (btn) { btn.disabled = false; btn.textContent = '🔄 Retry sync'; }
    return;
  }

  // Populate health data model
  D.hd.steps     = fitData.steps     || '';
  D.hd.walkMin   = fitData.walkMin   || '';
  D.hd.exMin     = fitData.exMin     || '';
  D.hd.activeMin = fitData.activeMin || '';
  D.hd.sleepDur  = fitData.sleepDur  || '';
  D.hd.rhr       = fitData.rhr       || '';
  D.hd.weight    = fitData.weight    || '';

  // Also auto-populate lifestyle fields
  if (fitData.steps)     D.ls.steps      = fitData.steps;
  if (fitData.walkMin)   D.ls.walking    = fitData.walkMin;
  if (fitData.activeMin) D.ls.activeMin  = fitData.activeMin;
  if (fitData.sleepDur)  D.ls.sleep      = parseFloat(fitData.sleepDur);

  if (status) status.innerHTML = `<div class="alert alert-info" style="background:var(--green-dim);border-color:var(--green)33;color:var(--green)">
    ✅ Google Fit data synced successfully — last 7 days average
  </div>`;
  if (btn) { btn.disabled = false; btn.textContent = '🔄 Resync'; }

  if (onComplete) onComplete(fitData);
}
