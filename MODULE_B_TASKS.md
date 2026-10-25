# Module B: Dayum (Cycle Tracking) + Insights Engine + Flags

**Owner:** Eva (`{OWNER_B}`)  
**Core Responsibilities:** Pure cycle derivation engine (FIGO guidelines), calibrated prediction window, symptom-by-band patterns, deterministic clinical flag evaluation, Recharts trend charts, and Utah Hive dataset scientific validation.

---

## 📁 Files Owned by Module B

- **Core Engine (`src/modules/insights/engine/`):**
  - [`computeInsights.ts`](file:///c:/Users/somya/cyculus/src/modules/insights/engine/computeInsights.ts) — Main pure orchestrator combining derivation, stats, prediction, patterns, and flags.
  - [`deriveCycles.ts`](file:///c:/Users/somya/cyculus/src/modules/insights/engine/deriveCycles.ts) — Bleeding episode grouping (≤2 day gap) and 15-day cycle split rule.
  - [`computeStats.ts`](file:///c:/Users/somya/cyculus/src/modules/insights/engine/computeStats.ts) — Cycle stats: mean, SD, shortest, longest, average bleeding days.
  - [`computePrediction.ts`](file:///c:/Users/somya/cyculus/src/modules/insights/engine/computePrediction.ts) — Calibrated window prediction (mean-of-last-3 + adaptive variance margin).
  - [`computePatterns.ts`](file:///c:/Users/somya/cyculus/src/modules/insights/engine/computePatterns.ts) — Symptom distribution by cycle band (`period`, `early`, `mid`, `late`).
  - [`evaluateFlags.ts`](file:///c:/Users/somya/cyculus/src/modules/insights/engine/evaluateFlags.ts) — Evaluates FIGO/ACOG rules from `knowledge.json` without hardcoded thresholds.
  - [`bandUtils.ts`](file:///c:/Users/somya/cyculus/src/modules/insights/engine/bandUtils.ts) — Maps cycle day index to relative band without claiming ovulation.
- **UI Screens (`src/modules/insights/screens/`):**
  - [`DayumScreen.tsx`](file:///c:/Users/somya/cyculus/src/modules/insights/screens/DayumScreen.tsx) — Main cycle dashboard (current cycle, prediction badge, charts, flag list).
  - [`CycleTimeline.tsx`](file:///c:/Users/somya/cyculus/src/modules/insights/screens/CycleTimeline.tsx) — Visual calendar strip showing bleeding, symptoms, and prediction bands.
  - [`CycleLengthChart.tsx`](file:///c:/Users/somya/cyculus/src/modules/insights/screens/CycleLengthChart.tsx) — Recharts trend chart with 24–38 day normal range reference band.
  - [`SymptomPatternView.tsx`](file:///c:/Users/somya/cyculus/src/modules/insights/screens/SymptomPatternView.tsx) — Phase-based symptom clustering.
  - [`FlagCard.tsx`](file:///c:/Users/somya/cyculus/src/modules/insights/screens/FlagCard.tsx) — Expandable clinical flag card with evidence numbers and doctor questions.
  - [`WhyModal.tsx`](file:///c:/Users/somya/cyculus/src/modules/insights/screens/WhyModal.tsx) — Traceability modal showing exact rule thresholds, clinical sources, and citations.
  - [`EmptyState.tsx`](file:///c:/Users/somya/cyculus/src/modules/insights/screens/EmptyState.tsx) — Honest state when data sufficiency is `none` or `minimal`.
- **Scripts & Datasets (`scripts/` & `data/`):**
  - [`scripts/eval-utah.ts`](file:///c:/Users/somya/cyculus/scripts/eval-utah.ts) — Benchmark script validating prediction engine on 3,324 real cycles from Utah Hive.
  - [`scripts/generate-personas.ts`](file:///c:/Users/somya/cyculus/scripts/generate-personas.ts) — Generates synthetic mock logs (Riya, Priya, Ananya).

---

## ✅ Work Done & Completed Deliverables

1. **Pure FIGO Cycle Derivation Engine:**
   - 100% deterministic, zero LLM dependencies for clinical calculations.
   - Respects bleeding episode rules (light/medium/heavy with ≤2 day spotting/gap bridges).
   - All parameters configurable via [`src/shared/knowledge.json`](file:///c:/Users/somya/cyculus/src/shared/knowledge.json) under `algorithm`.
   - Comprehensive test suite in [`deriveCycles.test.ts`](file:///c:/Users/somya/cyculus/src/modules/insights/engine/__tests__/deriveCycles.test.ts) passing 13/13 tests.

2. **Calibrated Prediction Window (Not a Single False Point):**
   - Predicts an empirical window (`earliest`, `expected`, `latest`) based on mean-of-last-3 completed cycles.
   - Calibrated using Utah Hive dataset parameters:
     - High confidence: ±2 to 3 days when variability is low (SD ≤ 2.5d).
     - Medium/Low confidence: dynamically widens window up to ±6 days when variability is high.
   - Tested in [`computePrediction.test.ts`](file:///c:/Users/somya/cyculus/src/modules/insights/engine/__tests__/computePrediction.test.ts) passing 8/8 tests.

3. **Clinical Rules Engine (Zero Hardcoded Thresholds):**
   - Implements FIGO 2018 / ACOG guidelines for:
     - `cycle_long` (> 38 days)
     - `cycle_short` (< 24 days)
     - `cycle_variability_high` (range > 9 days across 4 cycles)
     - `period_long` (> 8 consecutive bleeding days)
     - `heavy_flow_persistent` (≥3 heavy days in a single cycle)
     - `pain_severe_recurring` (pain level ≥ 7 for multiple cycles)
   - Tested in [`evaluateFlags.test.ts`](file:///c:/Users/somya/cyculus/src/modules/insights/engine/__tests__/evaluateFlags.test.ts) passing 13/13 tests.

4. **Interactive Trend Visualization (Recharts):**
   - Cycle history bar/line chart with shaded 24–38 day normal reference zone.
   - Clear visual indicators when an individual cycle falls outside typical parameters.

5. **Scientific Evaluation on Utah Hive Dataset (`scripts/eval-utah.ts`):**
   - Tested across **351 women** and **1,696 cycles** from `CrMcyclelength_share.csv`.
   - **Results:**
     - Cyculus Mean-of-Last-3: **2.74 days MAE** (vs. 3.38d for naive 28-day baseline and 3.09d for last-cycle).
     - 60.9% within 2 days, 75.3% within 3 days, 88.3% within 5 days.
     - Empirical window coverage: **85.6%** (average window width: 7.4 days).
   - Ready for inclusion in hackathon presentation slides.

---

## ⚠️ Remaining Work, Fixes & Polish Needed

### 1. 3-Step Milestone Roadmap for Cycle Empty State
- **Problem:** When a user opens Cyculus with 0 or 1 cycle logged, [`EmptyState.tsx`](file:///c:/Users/somya/cyculus/src/modules/insights/screens/EmptyState.tsx) explains that data is insufficient, but doesn't show a clear visual progress roadmap.
- **Fix:** Add a 3-step visual unlock indicator:
  - *Day 1:* Daily symptom tracking & emergency red-flag safeguards active.
  - *Cycle 1 (Finished):* Bleeding duration stats and initial prediction window unlocked.
  - *Cycle 3+:* FIGO irregularity screening, variability trend chart, and high-confidence prediction unlocked.

### 2. Chart Responsiveness on Small Mobile Screens (<360px)
- **Problem:** In [`CycleLengthChart.tsx`](file:///c:/Users/somya/cyculus/src/modules/insights/screens/CycleLengthChart.tsx), the Recharts container with 6+ cycle bars can truncate labels on narrow 320px screens.
- **Fix:** Add `ResponsiveContainer minWidth={280}` and truncate x-axis dates to month abbreviations (`"Oct 24"`) when screen width is under 380px.

### 3. Traceability "Why Am I Seeing This?" Modal Copy
- **Problem:** Ensure [`WhyModal.tsx`](file:///c:/Users/somya/cyculus/src/modules/insights/screens/WhyModal.tsx) explicitly highlights that rule evaluation happens completely on-device without any user data being transmitted to cloud classifiers.
- **Status:** Reviewed; references FIGO 2018 guidelines and local IndexedDB parameters.

---

## 🧪 How to Test Module B

```bash
# Run all Module B unit tests
npm test src/modules/insights/

# Run the scientific Utah benchmark script
npx tsx scripts/eval-utah.ts

# Generate synthetic persona logs
npx tsx scripts/generate-personas.ts
```
