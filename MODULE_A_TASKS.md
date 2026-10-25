# Module A: OofLog (Capture) + App Shell + Storage

**Owner:** Somya (`{OWNER_A}`)  
**Core Responsibilities:** Conversational symptom logging, on-device Dexie storage, design tokens & UI shell, Gemini extraction endpoint (`/api/extract`), and urgent red flags.

---

## 📁 Files Owned by Module A

- **Shell & Navigation:**
  - [`src/app/AppShell.tsx`](file:///c:/Users/somya/cyculus/src/app/AppShell.tsx) — Main layout, mobile bottom bar, persona banners, tab switching.
  - [`src/app/OnboardingModal.tsx`](file:///c:/Users/somya/cyculus/src/app/OnboardingModal.tsx) — Privacy guarantees, initial cycle prior calibration.
  - [`src/app/components/`](file:///c:/Users/somya/cyculus/src/app/components/) — `Button`, `Card`, `Chip`, `Sheet`, `Toast`, `LanguageToggle`.
- **Capture Layer:**
  - [`src/modules/capture/OofLog.tsx`](file:///c:/Users/somya/cyculus/src/modules/capture/OofLog.tsx) — Daily check-in (tap picker + natural text input).
  - [`src/modules/capture/ConfirmCard.tsx`](file:///c:/Users/somya/cyculus/src/modules/capture/ConfirmCard.tsx) — Editable staging card for AI extractions.
  - [`src/modules/capture/UrgentBanner.tsx`](file:///c:/Users/somya/cyculus/src/modules/capture/UrgentBanner.tsx) — Emergency red-flag guidance banner.
- **Storage Layer:**
  - [`src/modules/capture/storage.ts`](file:///c:/Users/somya/cyculus/src/modules/capture/storage.ts) — Dexie IndexedDB implementation (`LogStore`).
  - [`src/modules/capture/mergePatch.ts`](file:///c:/Users/somya/cyculus/src/modules/capture/mergePatch.ts) — Patch-merge semantics (latest flow/pain wins, union for symptoms/moods).
  - [`src/modules/capture/useLogs.ts`](file:///c:/Users/somya/cyculus/src/modules/capture/useLogs.ts) — React hook for logs & user setup.
  - [`src/modules/capture/inMemoryStore.ts`](file:///c:/Users/somya/cyculus/src/modules/capture/inMemoryStore.ts) — In-memory fake store for unit tests.
- **Backend & Knowledge:**
  - [`api/extract.ts`](file:///c:/Users/somya/cyculus/api/extract.ts) — Vercel serverless Gemini function for schema-bound Hinglish extraction.
  - [`src/shared/knowledge.json`](file:///c:/Users/somya/cyculus/src/shared/knowledge.json) — Cited clinical rules and algorithm parameters.

---

## ✅ Work Done & Completed Deliverables

1. **Design Tokens & Shell:**
   - Soft lavender & blush palette (`#7B5EA7`, `#E9DFF5`, `#FBEAF0`, `#FDF7F9`).
   - Bottom navigation bar on mobile (Log, Cycle, Brief) with accessible tap targets and active styling.
   - Desktop responsive sidebar layout.

2. **On-Device Storage Layer (`LogStore` via Dexie):**
   - 100% on-device IndexedDB with zero cloud syncing.
   - Patch-merge rules strictly implemented and verified via [`mergePatch.test.ts`](file:///c:/Users/somya/cyculus/src/modules/capture/mergePatch.test.ts).
   - Export and wipe methods functioning.

3. **Conversational Extraction (`POST /api/extract`):**
   - Vercel serverless function using Gemini with temperature `0`.
   - Strict JSON schema bounded by typed enums: `FLOW_LEVELS`, `SYMPTOMS`, `MOODS`.
   - Hinglish glossary and relative date handling ("kal", "parso", "pichle hafte").
   - Offline fallback parser when internet is unavailable.

4. **Confirmation Card (`ConfirmCard.tsx`):**
   - Extracted results are staged in an editable card with tag toggles.
   - Prevents auto-saving of unconfirmed AI output.

5. **Urgent Red Flags (`UrgentBanner.tsx`):**
   - Keyword + regex and model-flag detection for acute clinical emergencies (severe hemorrhage, syncope, intense pain).
   - Calm, non-alarmist instructions to seek medical care immediately.

6. **Onboarding Modal (`OnboardingModal.tsx`):**
   - Compacted to fit within 100% viewport height without vertical clipping.
   - Removed duplicate arrow icons.
   - Allows users to calibrate an initial cycle prior without defaulting to 28 days.

---

## ⚠️ Remaining Work, Fixes & Polish Needed

### 1. Pain Scale Clinical Anchors
- **Problem:** In [`OofLog.tsx`](file:///c:/Users/somya/cyculus/src/modules/capture/OofLog.tsx#L410-L450), the 0–10 numeric slider has numbers but lacks clinical benchmark descriptions.
- **Fix:** Add descriptive clinical anchors beneath the slider:
  - `0`: None (कोई दर्द नहीं)
  - `3`: Mild / Noticeable (हल्का दर्द)
  - `7`: Severe / Limits activities (तेज़ दर्द, काम में रुकावट)
  - `10`: Incapacitating / Bedridden (असहनीय दर्द)

### 2. Auto-Scroll to Confirmation Card on Extraction
- **Problem:** When a user extracts Hinglish text, the confirmation card appears below the input area. On smaller screens, the user must manually scroll down to find the "Save" button.
- **Fix:** In [`OofLog.tsx`](file:///c:/Users/somya/cyculus/src/modules/capture/OofLog.tsx#L190-L200), after `setExtractedPatches(...)`, trigger a smooth scroll:
  ```ts
  setTimeout(() => {
    confirmCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
  ```

### 3. Truthful Privacy Messaging (Completed)
- **Problem:** Overstating privacy as "No data ever leaves your device" contradicts the extraction architecture (typed notes are sent to `/api/extract` and Gemini for parsing).
- **Accurate & Reassuring Phrasing:**
  - *English:* "Your logs are saved only on this phone. When you type a note for the app to understand, that text is sent securely for processing and is not stored by us."
  - *Hindi:* "आपके लॉग सिर्फ इसी फोन में सेव रहते हैं। जब आप कोई नोट समझने के लिए लिखती हैं, तो वह सुरक्षित रूप से प्रोसेस होने जाता है और हमारे पास सेव नहीं होता।"
- **Status:** Implemented across `OnboardingModal.tsx`, `ConfirmCard.tsx`, `SettingsView.tsx`, `strings.en.ts`, and `strings.hi.ts`.

### 4. Explicit "No Bleeding" State in Tap Check-in
- **Problem:** In [`OofLog.tsx`](file:///c:/Users/somya/cyculus/src/modules/capture/OofLog.tsx), the bleeding flow buttons (`Spotting`, `Light`, `Medium`, `Heavy`) can confuse users logging on non-period days.
- **Fix:** Add a `"None / Clear"` option or helper text: *"Bleeding (Leave unselected if not bleeding today)"*.

---

## 🧪 How to Test Module A

```bash
# Run unit tests for merge rules and storage
npm test tests/flow-normalization.test.ts
npm test src/modules/capture/mergePatch.test.ts

# Typecheck
npm run typecheck
```
