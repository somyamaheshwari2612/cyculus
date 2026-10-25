# recHERsion 2026 — Final Submission & Deliverables Checklist

**Deadline:** Sunday 25 Oct 2026, 9:00 PM IST  
**Recommended Code Freeze:** ~6:00 PM IST  
**Final Commit Target:** By ~7:30 PM IST (Zero commits after 9:00 PM IST)

---

## 🏆 Deliverables Breakdown (100 Marks Total)

| Deliverable | Weight | Status | Next Actions |
|:---|:---:|:---:|:---|
| **Working MVP & End-to-End Flow** | 25 pts | ✅ **95% Ready** | Live at [cyculus.vercel.app](https://cyculus.vercel.app/). All 3 modules integrated. |
| **Technical Implementation & Accuracy** | 20 pts | ✅ **100% Ready** | Deterministic FIGO engine, zero-hallucination numeric guard, 69 vitest tests passing. |
| **Problem Relevance (Women's Healthcare)** | 15 pts | ✅ **100% Ready** | Tackles the 28-day myth, appointment data gap, and on-device privacy. |
| **Innovation & Scientific Validation** | 15 pts | ✅ **100% Ready** | Utah Hive benchmark table generated (**2.74d MAE, 85.6% window coverage**). |
| **Feasibility & Impact** | 15 pts | ✅ **Ready** | 100% on-device PWA; complementary to Medhya (future scope). |
| **UX & Accessibility** | 10 pts | ✅ **Ready** | Bilingual English & Conversational Hindi; responsive; botanical pastel design. |

---

## 📋 The 3 Required Hackathon Deliverables

### 1. GitHub Repository
- **Status:** ✅ **Complete & Live**
- **Repo URL:** `https://github.com/somyamaheshwari2612/cyculus`
- **Checklist:**
  - [x] All 69 Vitest unit tests pass (`npm test`).
  - [x] Zero TypeScript compilation errors (`npm run typecheck`).
  - [x] Clean history, no hardcoded API keys or secrets in repo.
  - [x] `.env.example` committed.
  - [x] [`ACKNOWLEDGEMENTS.md`](file:///c:/Users/somya/cyculus/ACKNOWLEDGEMENTS.md) contains full attribution for Utah Hive dataset, FIGO/ACOG literature, fonts, and packages.
  - [x] [`README.md`](file:///c:/Users/somya/cyculus/README.md) contains live demo link, architecture diagram, and Utah Hive benchmark table.

---

### 2. Hackathon Presentation Slides (PPT)
- **Status:** ⏳ **Needs Assembly**
- **Slide-by-Slide Blueprint (Recommended by Organizers & Section 0.1 / Part 4):**
  1. **Title Slide:**
     - Cyculus: Private, Longitudinal Menstrual Diary & Doctor-Ready Consultation Brief.
     - Team: Somya, Eva, Devyani — GLA University, Mathura.
  2. **The Problem:**
     - The "28-Day Cycle Myth" creates anxiety (Bull et al. 2019: real cycles vary widely).
     - The 5-Minute Doctor Consultation Gap: appointments lack structured longitudinal data.
     - Privacy concerns: women hesitant to put intimate health data on cloud servers.
  3. **Proposed Solution:**
     - 100% on-device PWA.
     - Natural Hinglish/English symptom logging with confirmed extraction.
     - Calibrated prediction windows (not single dates).
     - 1-page clinician brief (Chitthi) with anti-hallucination numeric guards.
  4. **Technical & System Architecture:**
     - Pure TypeScript FIGO cycle derivation engine.
     - Schema-bound Gemini extraction via serverless Vercel function.
     - On-device IndexedDB storage via Dexie (zero cloud transmission).
     - Offline bilingual rendering with bundled Noto Sans Devanagari.
  5. **Scientific Validation (The Utah Hive Benchmark):**
     - Evaluated on **351 women across 1,696 cycles** using the Utah Hive Dataset (`CrMcyclelength_share.csv`).
     - **Copy this table into the slide:**
       | Metric | Naive 28-Day Model | Cumulative User Mean | Cyculus Calibrated Engine |
       |:---|:---:|:---:|:---:|
       | **Mean Absolute Error (MAE)** | 3.38 days | 2.73 days | **2.74 days** |
       | **Accuracy within $\pm 3$ days** | — | — | **78.3%** |
       | **Accuracy within $\pm 5$ days** | — | — | **89.0%** |
       | **Window Coverage Rate** | 0% *(single point)* | 0% *(single point)* | **85.6%** *(~80% target)* |
       | **Average Window Width** | 0 days | 0 days | **8.6 days** |
  6. **Clinical Safety & Non-Diagnostic Principles:**
     - Never diagnoses ("you have PCOS" forbidden; "outside commonly cited ranges, worth discussing with a doctor" enforced).
     - Deterministic rule thresholds in `knowledge.json` cited from FIGO, ACOG, NICE, and WHO.
     - Anti-hallucination numeric guard rejects any number or date not in verified local logs.
  7. **Demonstration Persona (Riya, 22):**
     - Walkthrough of the live scenario: 41-day irregular cycle, Hinglish check-in, FIGO flag, 1-page PDF export.
  8. **Feasibility, Impact & Future Scope:**
     - Zero recurring server costs (100% client-side compute & storage).
     - Future roadmap: standalone today, can seamlessly integrate with Medhya (as context for reproductive health Q&A).
  9. **References & Citations:**
     - FIGO (Munro et al. 2018), ACOG Committee Opinions, Bull et al. (2019), Utah Hive Dataset (Stanford & Najmabadi, 2023).

---

### 3. Demo Video (3–4 Minutes)
- **Status:** ⏳ **Needs Recording**
- **Exact Demo Script (Section 0.12):**
  1. **Scene 1 (First 30 seconds): Opening & Onboarding:**
     - Open `https://cyculus.vercel.app/` (or mobile PWA installed).
     - Show the onboarding modal: explain the 100% on-device privacy guarantee and the optional cycle calibration (emphasize *no 28-day default*).
  2. **Scene 2 (Minute 1): OofLog Conversational Logging:**
     - Go to OofLog. Type or click the sample chip: *"kal se pet mein bohot dard hai aur flow heavy hai"*.
     - Tap Extract: show the **Confirmation Card** ("This is what I understood"). Emphasize that AI output is never auto-saved without user confirmation. Save it.
  3. **Scene 3 (Minute 2): Dayum Cycle Timeline & Flags:**
     - Switch to the Cycle tab with Riya's persona.
     - Show the timeline, the 41-day cycle, high variability, and the predicted window (e.g. ~80% coverage).
     - Tap *"why am I seeing this?"* to show the FIGO guideline citation and transparent formula.
  4. **Scene 4 (Minute 3): Doctor Brief (Chitthi) & Hindi PDF:**
     - Switch to the Brief tab.
     - Switch language to **Hindi (हिंदी)**: show how the brief renders natural conversational phrasing (*"पिछले 5 में से 3 बार पीरियड 35 दिन से ज़्यादा के गैप पर आए"*).
     - Click **"Print / Save as PDF"** to preview the clean 1-page clinician document.
  5. **Closing Line:**
     - *"Your data never left your phone."*

---

## ⏰ Time Management Timeline (Sunday 25 Oct)

- **2:40 PM – 4:00 PM:** Finish code polish items (Date filter in Brief, Pain scale anchors).
- **4:00 PM – 5:30 PM:** Assemble presentation slides (PPT) using the blueprint above.
- **5:30 PM – 6:30 PM:** Record and edit the 3–4 minute demo video following Scenario 0.12.
- **6:30 PM – 7:30 PM:** Final code check, final git commit, and push.
- **7:30 PM – 8:30 PM:** Upload video, check submission links, and submit before 9:00 PM IST buffer.
