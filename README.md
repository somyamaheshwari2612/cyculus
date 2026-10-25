# 🌸 Cyculus

> **Private, longitudinal cycle tracking with conversational symptom capture and clinician-ready briefs.**  
> Built for **recHERsion 2026** (ACM-W NITK Surathkal, Engineer NITK 2K26) — **Problem Statement 1: Women's Healthcare**  
> **Team:** Somya (Lead: UI, AI & Shell), Eva (Insights & Cycle Engine), Devyani (Doctor Brief & Numeric Guards) — *GLA University, Mathura*

[![Live Demo](https://img.shields.io/badge/Live_Demo-cyculus.vercel.app-E11D48?style=for-the-badge&logo=vercel)](https://cyculus.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Dexie](https://img.shields.io/badge/Dexie.js-Zero--Cloud_IndexedDB-7C3AED?style=for-the-badge)](https://dexie.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline_Ready-10B981?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![Vitest](https://img.shields.io/badge/Tests-69_Passed_·_10_Suites-success?style=for-the-badge&logo=vitest)](https://vitest.dev/)

---

## 🌸 Overview & Vision

Most menstrual tracking applications suffer from three critical flaws:
1. **Rigid "28-day" Assumptions**: They treat standard cycle lengths as universal truth, creating unnecessary anxiety for women with natural variation or conditions like PCOS.
2. **Friction-Heavy Logging**: Rigid form pickers fail to capture how women actually experience symptoms, particularly in multilingual or colloquial contexts (e.g., Hinglish: *"kal se pet mein bohot dard hai aur flow heavy hai"*).
3. **The 5-Minute Doctor Consultation Gap**: Medical appointments routinely lack structured, longitudinal symptom timelines. Patients struggle to recall past cycle intervals, while clinicians don't have time to parse months of raw notes.

**Cyculus** answers: *"What is happening to my body over time, and what specific facts do I share with my doctor?"*

---

## ✨ Key Features & Module Architecture

```
                                  CYCULUS ARCHITECTURE
                                  
   ┌────────────────────────────────────────────────────────────────────────┐
   │                  100% On-Device Local Storage (Dexie / IndexedDB)       │
   │           No Cloud Sync · No User Accounts · Health Data Stays on Phone│
   └───────────────────────────────────┬────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
  [ MODULE A ]                   [ MODULE B ]                   [ MODULE C ]
     OofLog                         Dayum                       Doctor Brief
(Symptom Capture)             (Cycle & Insights)              (Chitthi Report)
        │                              │                              │
 • Hinglish Voice & Text        • FIGO Cycle Derivation        • 1-Page Summary
 • Schema-Bound Gemini          • Calibrated Windows (~80%)    • Anti-Hallucination
 • Confirmation Card            • FIGO/ACOG Clinical Flags       Numeric Guard
 • Offline-First Queue          • Longitudinal Trends          • English & Hindi PDF
```

### 1. Module A · OofLog (Conversational Symptom Diary)
- **Natural Language Check-in**: Speak or type naturally in everyday Hinglish or English.
- **Zero-Hallucination Schema Extraction**: Server-side Vercel lambda (`POST /api/extract`) powered by Gemini with temperature `0` and strict enum typing (`FLOW_LEVELS`, `SYMPTOMS`, `MOODS`).
- **User-Confirmed Staging**: Extracted data is always presented in an editable **Confirmation Card**. The app never auto-saves unconfirmed model output.
- **Offline Reliability**: When offline, entries are logged immediately via the 1-tap UI, and raw text is queued locally for interpretation once connected.

### 2. Module B · Dayum (Longitudinal Cycle Tracker & Clinical Insights)
- **Deterministic Cycle Derivation**: Pure mathematical evaluation based on FIGO clinical definitions (bleeding episodes with gaps $\le 2$ days merged).
- **Calibrated Prediction Windows**: Rather than naive point estimates, Cyculus computes an empirical prediction window ($N=3$ rolling center $\pm 1.28 \times \text{SD}$), validated against the **Utah Hive Menstrual Cycle Dataset** (achieving **85.6% empirical coverage** across 351 women).
- **Evidence-Based Rule Flags**: Flags cycles outside accepted clinical ranges (e.g., FIGO criteria for cycle variability, heavy flow persistence, severe recurring dysmenorrhea) using clear, non-alarmist language.
- **Interactive Visualizations**: Cycle Timeline, Cycle Length History Chart, and Symptom Pattern Phase Distribution (Follicular, Midcycle, Luteal, Bleeding).

### 3. Module C · Doctor Brief (चिट्ठी · Clinician Summary)
- **1-Page Clinician Brief**: Factual, high-density summary designed for rapid review during gynecology visits.
- **Strict Numeric & Date Guard**: Pure verification guard ([`numericGuard.ts`](file:///c:/Users/somya/cyculus/src/modules/brief/numericGuard.ts)) ensures that every number, cycle length, and date in the brief exists in verified local ground-truth logs. Invented numbers are categorically rejected.
- **Bilingual English & Hindi**: Complete Devanagari script support bundled locally with `@fontsource/noto-sans-devanagari` for offline rendering.
- **Direct Questions for Care**: Surfaces relevant questions for the physician based on triggered clinical guidelines.
- **1-Click Print & PDF Export**: Clean, print-styled document layout.

---

## 🛡️ Non-Negotiable Safety & Privacy Architecture

| Principle | Implementation |
|---|---|
| **Zero-Cloud Privacy** | All daily logs, cycle calculations, and user preferences are stored strictly on-device in **IndexedDB via Dexie**. No server databases, no analytics tracking, no data leaves the phone. |
| **Zero-Hallucination Guard** | LLMs never diagnose conditions or calculate statistics. All stats, predictions, and flags are computed deterministically by pure TypeScript functions against thresholds in [`knowledge.json`](file:///c:/Users/somya/cyculus/src/shared/knowledge.json). |
| **Strict Numeric Whitelist** | Generated clinician briefs pass through [`passesNumericGuard`](file:///c:/Users/somya/cyculus/src/modules/brief/numericGuard.ts), rejecting any number or date not present in local logs. |
| **Descriptive, Not Diagnostic** | The interface uses clear, supportive phrasing (*"outside commonly cited ranges, worth discussing with a doctor"*), strictly avoiding medical diagnoses. |

---

## 📊 Scientific Validation: Utah Hive Dataset Evaluation

To avoid naive 28-day assumptions, Cyculus's rolling prediction window was evaluated against real-world longitudinal data from the **Utah Hive Menstrual Cycle Dataset** (351 women, 1,696 completed cycles; Stanford & Najmabadi, 2023):

```bash
npm run eval:utah
```

### Empirical Benchmark Results

| Metric | Naive 28-Day Model | Cumulative User Mean | Cyculus Calibrated Engine |
|---|:---:|:---:|:---:|
| **Mean Absolute Error (MAE)** | 3.38 days | 2.73 days | **2.74 days** |
| **Prediction within ±2 Days** | — | — | **66.0%** |
| **Prediction within ±3 Days** | — | — | **78.3%** |
| **Prediction within ±5 Days** | — | — | **89.0%** |
| **Window Coverage Rate** | 0% *(single day point)* | 0% *(single day point)* | **85.6%** *(Target: ~80% window)* |
| **Average Window Width** | 0 days | 0 days | **8.6 days** *(±4.3 days)* |
| **Clinical Citations** | None | None | **FIGO / ACOG / Bull et al. (2019)** |

---

## 🧪 Demonstration Personas (Built-in for Judges)

For instant evaluation, Cyculus includes three pre-calibrated 6-month synthetic personas seeded into IndexedDB with a persistent banner and 1-click cleanup:

1. **✨ Riya (Irregular / 41-day cycle)**:
   - 6 complete cycles with high variability (27–41 days), latest cycle 41 days.
   - Evaluates: triggers `cycle_variability_high` and `cycle_long` flags with tailored doctor consultation questions.
2. **🌿 Regular Cycles Persona**:
   - Consistent 28–29 day cycles with low standard deviation.
   - Evaluates: healthy baseline, narrow prediction window, zero false-positive clinical flags.
3. **🩸 Heavy Bleeding Persona**:
   - 4+ heavy flow days per cycle with severe dysmenorrhea (pain 8/10).
   - Evaluates: triggers `heavy_flow_persistent` and `pain_severe_recurring` flags.

---

## 📂 Repository Structure

```
cyculus/
├── api/
│   └── extract.ts                  # Vercel serverless function (Gemini structured extraction)
├── src/
│   ├── app/                        # Shell, responsive layouts & navigation (Module A)
│   │   ├── AppShell.tsx            # Dual-column desktop & mobile layout
│   │   ├── SettingsView.tsx        # Persona loader, JSON export & data controls
│   │   ├── OnboardingModal.tsx     # Privacy disclaimer & initial cycle setup
│   │   └── components/             # Reusable UI tokens (Card, Button, Chip, Sheet, Toast)
│   ├── modules/
│   │   ├── capture/                # Module A: OofLog UI, Dexie storage, mergePatch
│   │   ├── insights/               # Module B: Dayum screen, timeline, stats & charts
│   │   │   ├── engine/             # Pure deterministic engine (deriveCycles, evaluateFlags, etc.)
│   │   │   └── screens/            # DayumScreen, CycleTimeline, CycleLengthChart
│   │   └── brief/                  # Module C: Doctor brief, buildBrief, numericGuard
│   └── shared/
│       ├── types.ts                # Master contracts & data models
│       ├── knowledge.json          # FIGO / ACOG cited clinical rules & algorithm parameters
│       ├── translations.ts         # English & Hindi bilingual dictionaries
│       └── mocks/                  # Offline synthetic persona datasets
├── scripts/
│   ├── eval-utah.ts                # Evaluation benchmark against Utah Hive dataset
│   └── generate-personas.ts        # Persona generation script
├── ACKNOWLEDGEMENTS.md             # Dataset licenses, academic papers & library attributions
└── README.md
```

---

## 🛠️ Technology Stack

- **Core**: React 18, TypeScript 5.5, Vite 5.4
- **Local-First Storage**: Dexie.js (IndexedDB wrapper)
- **Styling**: Tailwind CSS with custom editorial palette, botanical accents, and dual-column desktop scaling
- **Data Visualization**: Recharts (responsive cycle trends)
- **Icons**: Lucide React
- **Typography**: Noto Sans Devanagari (`@fontsource/noto-sans-devanagari` for offline Devanagari script support)
- **PWA**: `vite-plugin-pwa` with Workbox offline precaching
- **AI / NLP**: Google Generative AI SDK (`@google/genai`), serverless Vercel Edge/Node functions
- **Testing**: Vitest (10 test suites, 69 unit & snapshot tests)

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/somyamaheshwari2612/cyculus.git
cd cyculus
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Verification

```bash
# Run all 69 unit, engine, and numeric guard tests
npm test

# Typecheck the entire codebase
npm run typecheck

# Build for production and generate PWA service worker
npm run build

# Run the Utah Hive Menstrual Cycle evaluation benchmark
npm run eval:utah
```

---

## 📚 Datasets & Academic Citations

Detailed citations, dataset licenses, and research foundations are documented in [`ACKNOWLEDGEMENTS.md`](file:///c:/Users/somya/cyculus/ACKNOWLEDGEMENTS.md):
- **Utah Hive Menstrual Cycle Dataset**: Stanford, J., & Najmabadi, S. (2023). *Menstrual Cycles Length of Women in the USA and Canada, 1990-2013*. The Hive: University of Utah Research Data Repository. [doi:10.7278/S50d-4gxs-s4hj](https://doi.org/10.7278/S50d-4gxs-s4hj)
- **Bull et al. (2019)**: Real-world menstrual cycle characteristics of >600,000 cycles. *npj Digital Medicine 2*, 83.
- **FIGO Standards**: Normal menstrual parameters and abnormal uterine bleeding (AUB) guidelines.
- **ACOG Committee Opinion No. 651**: Menstruation in girls and adolescents as a vital sign.

---

## 📄 License
This project is developed for **recHERsion 2026**. Open source code is available under the [MIT License](LICENSE).

## Doctor brief, privacy and offline use (Module C)

- **Doctor brief:** a one-page summary in English or Hindi, built only from computed data and cited rules. Print or save as PDF.
- **Numeric guard:** any number in AI-polished text must appear in the source facts, or the plain text is used. Covered by tests.
- **Privacy:** data stays on the device. Users can export everything as JSON or delete it with confirmation.
- **Installable PWA:** works offline after the first visit.
- **Live link:** [paste your Vercel link]
- **Limits:** Hindi text is a first draft pending review. The demo uses one persona. This app is not a medical device and does not replace a doctor.
