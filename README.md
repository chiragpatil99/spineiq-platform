# SpineIQ — Spine Health Intelligence Platform

> **Evidence-based back pain assessment. Measure → Assess → Score → Classify → Recommend.**

SpineIQ is a scientific, data-driven back pain assessment platform designed to identify *why* a patient is experiencing back pain before recommending any intervention. Unlike fear-based or treatment-first workflows, SpineIQ focuses on root cause identification through structured clinical assessment and risk scoring.

---

## 🚀 Phase 1 — Live Prototype

Phase 1 is a fully functional single-page web application. Open `index.html` in any modern browser — no server, no build step, no dependencies required.

### Features

| Feature | Status |
|---|---|
| 8-step structured assessment flow | ✅ |
| Live BMI auto-calculation | ✅ |
| Occupational risk classification | ✅ |
| Work pattern analysis (sitting/standing/driving) | ✅ |
| Lifestyle & sleep scoring | ✅ |
| Wearable-agnostic health data ingestion | ✅ Phase 1 manual; Phase 2 API sync |
| Pain location, intensity & radiation mapping | ✅ |
| Functional capacity assessment (5-axis) | ✅ |
| 5-dimension scoring engine | ✅ |
| Back Pain Risk Score (0–100) | ✅ |
| Risk classification (Low / Moderate / High) | ✅ |
| Probable contributor identification | ✅ |
| AI-generated clinical report | ✅ (Anthropic API) |
| Responsive design | ✅ |

---

## 📁 Project Structure

```
spineiq/
├── index.html          # App shell & navigation layout
├── css/
│   └── styles.css      # Full UI design system (dark clinical theme)
├── js/
│   ├── data.js         # Patient data model & BMI utilities
│   ├── scoring.js      # 5-dimension scoring engine + AI prompt builder
│   ├── pages.js        # HTML templates for each assessment step
│   └── app.js          # Controller: routing, render, AI report generation
└── README.md
```

---

## 🧠 Scoring Methodology

The scoring engine computes five independent dimension scores (each 0–100, higher = healthier):

| Dimension | Data inputs | Evidence basis |
|---|---|---|
| **Lifestyle Score** | Sitting hours, lifting demands | Occupational spinal load research |
| **Activity Score** | Daily steps, walking, exercise frequency | WHO physical activity guidelines |
| **Sleep Score** | Sleep duration, sleep quality | NSF sleep recommendations + pain sensitisation literature |
| **Mobility Score** | 5-axis functional capacity assessment | Clinical functional assessment tools |
| **Obesity Score** | BMI | WHO BMI classification + spinal loading studies |

The **Back Pain Risk Score** (0–100, higher = more risk) is a composite inverse of average health score, weighted by reported pain intensity.

**Risk Classification:**
- 🟢 `0–34` — Low Risk
- 🟡 `35–64` — Moderate Risk
- 🔴 `65–100` — High Risk

---

## 🔌 Wearable Integration (Phase 2)

Phase 1 supports manual entry of all health metrics. The architecture is designed to be wearable-agnostic. Phase 2 will add OAuth-based API sync for:

- Apple Watch (Apple HealthKit)
- Fitbit (Fitbit Web API)
- Garmin (Garmin Connect API)
- Samsung (Samsung Health SDK)
- Xiaomi / Mi Band (Mi Fit API)
- Amazfit
- OnePlus Watch
- Google Fit (REST API)

---

## 🤖 AI Report Generation

The report step calls the Anthropic Claude API to generate an 8-section evidence-based clinical summary:

1. Patient Summary
2. BMI & Weight Analysis
3. Lifestyle & Activity Assessment
4. Occupational Risk Factors
5. Pain Pattern Analysis
6. Key Risk Factors Identified
7. Probable Contributors to Current Pain
8. Recommended Next Steps

The AI is prompted to focus on **root cause identification**, not treatment prescription.

---

## 🗺️ Roadmap

### Phase 2 — Clinical Platform
- [ ] Backend (Node.js / Python) + database (PostgreSQL)
- [ ] User authentication & role-based access (clinician / patient)
- [ ] Wearable OAuth integration (Apple HealthKit, Fitbit, Garmin, Google Fit)
- [ ] Patient records & longitudinal tracking
- [ ] Progress monitoring over time

### Phase 3 — Intelligence Layer
- [ ] AI-assisted root cause analysis (deep pattern recognition)
- [ ] Personalised recommendation engine
- [ ] Outcome monitoring
- [ ] Population-level back pain risk analytics
- [ ] Clinician dashboard & reporting portal

---

## 🛠️ Getting Started

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/spineiq-platform.git

# Open in browser — no build step needed
open index.html
```

For the AI report generation to work, the Anthropic API key must be configured. In Phase 1 the API is called client-side for prototyping. In Phase 2 this will move to a secure backend endpoint.

---

## 📋 Assessment Flow

```
Patient Info → Occupation → Work Patterns → Lifestyle →
Health Data → Pain Assessment → Functional Status → Risk Report
```

---

## 🏥 Clinical Principle

> Many clinics rely on fear-based marketing and generic treatment plans.
> SpineIQ is different — we **measure** before we **recommend**.

The platform is built on the principle that back pain has identifiable, measurable root causes. By systematically collecting data across occupational, lifestyle, biomechanical, and pain dimensions — then scoring and classifying risk — we can generate meaningful, personalised clinical insights rather than generic treatment packages.

---

## 📄 Licence

MIT — see `LICENSE` for details.

---

*SpineIQ Phase 1 Prototype — Built with evidence-based clinical methodology.*
