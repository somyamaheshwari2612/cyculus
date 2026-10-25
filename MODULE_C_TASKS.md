# Module C: Doctor Brief + Privacy Controls + PWA / Deploy

**Owner:** Devyani (`{OWNER_C}`)  
**Core Responsibilities:** Clinician-facing 1-page consultation brief, print-to-PDF generation, anti-hallucination numeric guard, privacy & storage management (wipe/export), and PWA offline capability.

---

## 📁 Files Owned by Module C

- **Doctor Brief Layer (`src/modules/brief/`):**
  - [`buildBrief.ts`](file:///c:/Users/somya/cyculus/src/modules/brief/buildBrief.ts) — Deterministic clinical brief builder assembling cycle stats, symptoms, flags, and doctor questions.
  - [`BriefScreen.tsx`](file:///c:/Users/somya/cyculus/src/modules/brief/BriefScreen.tsx) — Main consultation brief UI with print-to-PDF formatting and empty states.
  - [`numericGuard.ts`](file:///c:/Users/somya/cyculus/src/modules/brief/numericGuard.ts) — Anti-hallucination numeric and date validator for AI responses.
  - [`numericGuard.test.ts`](file:///c:/Users/somya/cyculus/src/modules/brief/numericGuard.test.ts) — Vitest suite proving hallucinated numbers/dates are rejected.
  - [`geminiPolish.ts`](file:///c:/Users/somya/cyculus/src/modules/brief/geminiPolish.ts) — Optional Hindi tone and phrasing polish client.
  - [`api/brief-polish.ts`](file:///c:/Users/somya/cyculus/api/brief-polish.ts) — Serverless endpoint for brief linguistic polish.
- **Privacy & Storage Management:**
  - [`src/app/SettingsView.tsx`](file:///c:/Users/somya/cyculus/src/app/SettingsView.tsx) — Privacy architecture details, 1-click JSON backup export, and full storage wipe.
  - [`src/app/components/PwaUsageGuide.tsx`](file:///c:/Users/somya/cyculus/src/app/components/PwaUsageGuide.tsx) — Instructions for installing Cyculus on Android / iOS home screen.
- **PWA & Production Build:**
  - [`vite.config.ts`](file:///c:/Users/somya/cyculus/vite.config.ts) — PWA manifest configuration, cache strategies, offline assets.
  - [`dist/`](file:///c:/Users/somya/cyculus/dist/) — Production build assets.
- **Documentation & Presentation:**
  - [`README.md`](file:///c:/Users/somya/cyculus/README.md) — Architecture diagram, safety table, installation guide.
  - [`ACKNOWLEDGEMENTS.md`](file:///c:/Users/somya/cyculus/ACKNOWLEDGEMENTS.md) — Citations for Utah Hive dataset, FIGO 2018 guidelines, ACOG, and open-source packages.
  - [`HACKATHON_SUBMISSION_TASKS.md`](file:///c:/Users/somya/cyculus/HACKATHON_SUBMISSION_TASKS.md) — Slide deck outline, benchmark tables, and demo video script.

---

## ✅ Work Done & Completed Deliverables

1. **Deterministic 1-Page Clinical Brief (`buildBrief.ts`):**
   - Assembles an executive consultation summary readable by a gynecologist in <60 seconds.
   - Categorizes FIGO cycle metrics, frequent symptoms by cycle phase, evidence-grounded flags, and targeted consultation questions.
   - Operates 100% deterministically from `Insights` and `knowledge.json` with zero AI hallucinations.

2. **Strict Anti-Hallucination Guard (`numericGuard.ts`):**
   - Extracts all numbers, integers, percentages, and dates from generated text.
   - Verifies that every single number exists in the deterministic source facts.
   - If an unauthorized number is detected, immediately drops the AI text and falls back to the deterministic brief.
   - Verified via [`numericGuard.test.ts`](file:///c:/Users/somya/cyculus/src/modules/brief/numericGuard.test.ts) (6/6 tests passing).

3. **Natural Conversational Hindi Localization:**
   - Both English and Devanagari Hindi clinical chitthi (`क्लिनिकल चिट्ठी`) fully supported.
   - Uses college-friendly conversational Hindi ("पीरियड", "डॉक्टर", "लॉग") adhering to [`HINDI_STYLE_GUIDE.md`](file:///c:/Users/somya/cyculus/HINDI_STYLE_GUIDE.md).

4. **Privacy Controls & Local Data Sovereignty (`SettingsView.tsx`):**
   - Export all entries and cycle records to a clean `.json` file at any time.
   - Complete 1-click wipe with double-confirmation dialog that purges Dexie IndexedDB.
   - Truthful privacy architecture explanation reflecting that saved logs stay on phone, and typed notes are sent securely to `/api/extract` without server persistence.

5. **PWA Offline Shell (`vite.config.ts`):**
   - Configured with `vite-plugin-pwa` service worker.
   - Web App Manifest configured with icons, standalone display mode, and `#7B5EA7` theme color.
   - Tap logging, cycle viewing, and brief generation work 100% offline without internet.

---

## ⚠️ Remaining Work, Fixes & Polish Needed

### 1. Consultation Date-Range Filter
- **Problem:** Currently, [`BriefScreen.tsx`](file:///c:/Users/somya/cyculus/src/modules/brief/BriefScreen.tsx) always generates a brief from all logged entries. When a patient visits a doctor, they frequently want to summarize only the last 3 or 6 months.
- **Fix:** Add a pill selector above the brief preview:
  - `[Last 3 Months]`
  - `[Last 6 Months]` (Default)
  - `[All History]`
  Filter `entries` and re-run `buildBrief` based on the selected range.

### 2. Print CSS & Single-Page A4 Layout
- **Problem:** When printing from mobile or browser ("Print / Save as PDF"), section breaks can occasionally cut off cards in the middle of a paragraph.
- **Fix:** In [`BriefScreen.tsx`](file:///c:/Users/somya/cyculus/src/modules/brief/BriefScreen.tsx), add:
  ```css
  @media print {
    @page { size: A4 portrait; margin: 12mm; }
    .print-avoid-break { break-inside: avoid; }
  }
  ```
  Ensure the printable header replaces "100% On-Device" with "Phone-First Storage · FIGO Verified".

### 3. Submission Presentation & Video Recording
- **Problem:** The hackathon evaluation is based on the slide deck and 3–4 minute demo video.
- **Fix:** Assemble slides following [`HACKATHON_SUBMISSION_TASKS.md`](file:///c:/Users/somya/cyculus/HACKATHON_SUBMISSION_TASKS.md):
  - Paste the Utah evaluation table (MAE 2.74d, 85.6% window coverage).
  - Emphasize the truthful privacy story: local Dexie persistence, ephemeral stateless extraction.
  - Follow Scenario 0.12 ("Riya", 22, irregular cycles) for the video demo.

---

## 🧪 How to Test Module C

```bash
# Run unit tests for the anti-hallucination guard
npm test src/modules/brief/numericGuard.test.ts

# Test typecheck
npm run typecheck

# Test production PWA build
npm run build
```
