# Cyculus — Critical UX & Clinical Product Audit Report

**Auditor Persona:** First-Time User, Digital Health Product Designer & Clinical Evaluator  
**Date:** October 25, 2026  
**Environment Evaluated:** Local Web App (`http://localhost:5173/`) & Production Preview (`cyculus.vercel.app`)  
**Scope:** Onboarding, Daily Logging (OofLog), Cycle Timeline (Dayum), Doctor Brief (Chitthi), Settings & Privacy, Bilingual Hindi/English Experience, and Mobile/Desktop Responsiveness.

---

## Executive Summary

Cyculus demonstrates outstanding craft in its core commitments: **100% on-device privacy (zero cloud data harvesting), adherence to FIGO/ACOG clinical guidelines, and a clean bilingual experience (English & Conversational Hindi)**. The visual identity (botanical pastel palettes, serif typography, soft elevation) feels calming and medical-grade rather than cold or clinical.

However, viewing the application through the lens of a **critical first-time user** reveals several opportunities to eliminate subtle friction, improve information hierarchy, enhance clinical actionability, and ensure mobile ergonomics are flawless.

---

## 1. Onboarding & First Minute Experience

### Current State
Step 1 presents Cyculus's privacy architecture and value propositions, followed by Step 2's optional cycle calibration prior (with no default to 28 days, per medical research).

### Friction Points & Improvement Opportunities
1. **PWA / Technical Terminology in Consumer Copy:**
   - *Observation:* Step 1 mentions technical terms like `"IndexedDB"` and `"Progressive Web App (PWA)"`. A general user or college student tracking their period does not know or need to know what IndexedDB is.
   - *Recommendation:* Replace with simple, reassuring language: *"Saved strictly inside your phone’s browser. No data ever leaves your device."*
   - *File:* [`src/app/OnboardingModal.tsx`](file:///c:/Users/somya/cyculus/src/app/OnboardingModal.tsx#L134-L140) and [`src/shared/strings.en.ts`](file:///c:/Users/somya/cyculus/src/shared/strings.en.ts).

2. **Stepper & Direct Input Collision on Small Screens:**
   - *Observation:* While the stepper (`-` and `+`) is responsive, manually typing into the cycle length input on mobile triggers the software keyboard, which can shift the modal slightly.
   - *Recommendation:* Restrict input to `inputMode="numeric"` and `pattern="[0-9]*"` to open the native numeric keypad, avoiding layout jumps.
   - *File:* [`src/app/OnboardingModal.tsx`](file:///c:/Users/somya/cyculus/src/app/OnboardingModal.tsx#L326-L355).

3. **Post-Onboarding Orientation (The "What Now?" Moment):**
   - *Observation:* After clicking *"Log your first day"*, the user lands directly on OofLog with a brief toast message. A first-time user might wonder whether they should log today even if they are not on their period.
   - *Recommendation:* Add an inline helper card above the check-in when zero logs exist: *"Not bleeding today? You can still log your mood, energy, or cramps, or return when your period begins."*

---

## 2. Daily Logging (`OofLog`)

### Current State
OofLog provides a dual-mode capture mechanism: structured tap check-in (moods, bleeding flow, pain scale 0–10, symptom tags) and natural language text/voice input parsed on-device into a confirmation card.

### Friction Points & Improvement Opportunities
1. **Pain Scale (0–10) Needs Clinical Anchors:**
   - *Observation:* The numeric pain slider/stepper currently ranges from 0 to 10, but lacks descriptive clinical benchmarks (e.g., *0: None, 3: Mild/Noticeable, 7: Severe/Limits activity, 10: Incapacitating*).
   - *Recommendation:* Display standard clinical anchors beneath the slider so users don't guess between a 6 and an 8.
   - *File:* [`src/modules/capture/OofLog.tsx`](file:///c:/Users/somya/cyculus/src/modules/capture/OofLog.tsx#L400-L450).

2. **Natural Language Confirmation Card Auto-Scroll:**
   - *Observation:* When extracting Hinglish text (e.g., *"kal se pet mein bohot dard hai aur flow heavy hai"*), the confirmation card renders below the input box. On standard viewports, the user has to scroll down to see the *"Save Today's Check-in"* button.
   - *Recommendation:* Smoothly auto-scroll the confirmation card into view (`scrollIntoView({ behavior: 'smooth', block: 'nearest' })`) when extraction completes.
   - *File:* [`src/modules/capture/OofLog.tsx`](file:///c:/Users/somya/cyculus/src/modules/capture/OofLog.tsx#L280-L310).

3. **Bleeding Flow vs. Non-Bleeding Distinction:**
   - *Observation:* Users logging on non-period days might accidentally tap a flow button or wonder if selecting nothing is permitted.
   - *Recommendation:* Add an explicit *"No Bleeding / Clear"* pill or clearly label the section *"Bleeding (Leave empty if not bleeding today)"*.

4. **Speech-to-Text Browser Availability Feedback:**
   - *Observation:* On browsers that lack Web Speech API support (e.g., Firefox or certain iOS webviews), the microphone icon is either hidden or non-functional without explanation.
   - *Recommendation:* Provide a gentle fallback tooltip if speech recognition is unsupported: *"Voice input is supported in Chrome, Safari, and Edge."*

---

## 3. Cycle Timeline & Clinical Insights (`Dayum`)

### Current State
Visualizes menstrual timeline, interval lengths between bleeds, prediction intervals with confidence windows, and deterministic clinical rule evaluations.

### Friction Points & Improvement Opportunities
1. **Empty State Needs a Clear Milestones Roadmap:**
   - *Observation:* Before any cycles are recorded, the empty state explains that predictions need data, but doesn't visualize the progression roadmap (e.g., *1 cycle: baseline recorded -> 2 cycles: first interval calculated -> 3+ cycles: prediction window activated*).
   - *Recommendation:* Replace the static text with a 3-step visual milestone tracker:
     - `⚪ Cycle 1: Establish baseline`
     - `⚪ Cycle 2: First observed interval`
     - `⚪ Cycle 3: Prediction band unlocked (~80% confidence)`
   - *File:* [`src/modules/insights/DayumPlaceholder.tsx`](file:///c:/Users/somya/cyculus/src/modules/insights/DayumPlaceholder.tsx).

2. **Calendar Day Touch Targets on Mobile:**
   - *Observation:* In the month grid calendar, individual day cells on small screens (360px–390px) can feel slightly tight to tap accurately when inspecting historical entries.
   - *Recommendation:* Increase minimum touch target padding or tap feedback radius to 36x36px.
   - *File:* [`src/modules/insights/screens/CycleTimeline.tsx`](file:///c:/Users/somya/cyculus/src/modules/insights/screens/CycleTimeline.tsx#L160-L210).

3. **Clinical Guideline Reference Link Visibility:**
   - *Observation:* The *"why am I seeing this?"* and *"Clinical guidelines (ACOG/FIGO)"* links are informative, but the modal contains dense clinical text.
   - *Recommendation:* Add short bullet summaries at the top of the guideline modal before showing raw references:
     - *"Normal adult cycle length: 24 to 38 days (FIGO)."*
     - *"Cycle variation: less than 7–9 days difference between shortest and longest cycle."*
   - *File:* [`src/modules/insights/screens/WhyModal.tsx`](file:///c:/Users/somya/cyculus/src/modules/insights/screens/WhyModal.tsx).

---

## 4. Doctor Brief (`Chitthi`)

### Current State
Synthesizes longitudinal cycle logs into a structured 1-page clinical summary containing bleeding patterns, dysmenorrhea severity, symptom frequency tables, and clinical flags.

### Friction Points & Improvement Opportunities
1. **Print / PDF Page-Break Containment:**
   - *Observation:* While the on-screen brief is concise, printing via browser (`window.print()`) can occasionally split tables or cards across two pages if there are multiple clinical flags.
   - *Recommendation:* Add strict CSS print rules:
     ```css
     @media print {
       .brief-card { break-inside: avoid; }
       @page { size: A4 portrait; margin: 12mm; }
     }
     ```
   - *File:* [`src/modules/brief/BriefScreen.tsx`](file:///c:/Users/somya/cyculus/src/modules/brief/BriefScreen.tsx).

2. **"Questions to Ask Your Doctor" Personalization:**
   - *Observation:* The suggestions for doctor appointments are helpful, but could dynamically adapt based on active flags (e.g., if `cycle_long` is active, suggest: *"Could my cycle length of 41 days indicate anovulation or hormonal fluctuation?"*).
   - *Recommendation:* Connect the appointment questions generator directly to the active clinical rule triggers.
   - *File:* [`src/modules/brief/buildBrief.ts`](file:///c:/Users/somya/cyculus/src/modules/brief/buildBrief.ts).

3. **Date Range Filter for Consultation Window:**
   - *Observation:* The brief defaults to showing all logged cycles. A doctor often asks *"What happened in the last 3 to 6 months?"*.
   - *Recommendation:* Add a quick toggle: `[Last 3 Months] [Last 6 Months] [All History]`.

---

## 5. Settings, Personas & Data Sovereignty

### Current State
Offers demonstration persona loading (Riya irregular, regular baseline, heavy flow), JSON export, and full storage wipe.

### Friction Points & Improvement Opportunities
1. **Persistent Demo Persona Banner:**
   - *Observation:* When a demo persona is active, a top banner alerts the user, but the *"Wipe Demo Data"* action could be more prominent to prevent accidental confusion between demo and personal data.
   - *Recommendation:* Add a small floating indicator or clear badge on OofLog and Dayum indicating `[Demo Mode Active]` with a 1-click exit button.
   - *File:* [`src/app/AppShell.tsx`](file:///c:/Users/somya/cyculus/src/app/AppShell.tsx).

2. **CSV / Spreadsheet Export Option:**
   - *Observation:* The app exports `.json`. While perfect for backup and re-import, doctors and patients often prefer opening a `.csv` in Excel or Google Sheets.
   - *Recommendation:* Add an *"Export as CSV"* button alongside the JSON export.
   - *File:* [`src/modules/capture/storage.ts`](file:///c:/Users/somya/cyculus/src/modules/capture/storage.ts) and [`src/app/SettingsView.tsx`](file:///c:/Users/somya/cyculus/src/app/SettingsView.tsx).

3. **PWA Installation Banner for iOS / Android:**
   - *Observation:* The PWA guide in Settings explains manual installation steps (Safari Share -> Add to Home Screen, Chrome 3-dots -> Install). However, first-time users on mobile rarely navigate to Settings to learn this.
   - *Recommendation:* Trigger a subtle, non-intrusive bottom banner after 2 days of usage or after logging the first entry: *"Add Cyculus to Home Screen for 1-tap offline access"*.

---

## 6. Bilingual Experience (Hindi / English)

### Current State
Supports full English and Conversational Hindi (`आप` register, Devanagari loanwords like `पीरियड`, `डॉक्टर`, `सेव`).

### Friction Points & Improvement Opportunities
1. **Consistency in Mixed Units & Numbers:**
   - *Observation:* In Hindi mode, some numbers appear in Devanagari numerals (`१, २, ३`) in certain places and Arabic digits (`1, 2, 3`) in others.
   - *Recommendation:* Standardize strictly on Arabic digits (`1, 2, 3`) per modern Indian conversational UI standards (like UPI and Swiggy), which are much more readable for college students.
   - *File:* [`src/shared/strings.hi.ts`](file:///c:/Users/somya/cyculus/src/shared/strings.hi.ts).

2. **Audio/Voice Feedback in Hindi:**
   - *Observation:* When dictating symptoms in Hindi, error messages (e.g., if mic permissions are denied) default to browser English dialogs.
   - *Recommendation:* Provide an in-app Hindi message if permission is blocked: *"कृपया ब्राउज़र सेटिंग में माइक्रोफ़ोन की अनुमति दें।"*

---

## Prioritized Action Plan

| Priority | Improvement Item | Screen / Area | Estimated Effort | Impact |
|:---|:---|:---|:---|:---|
| **High** | Replace technical jargon (`IndexedDB`, `PWA`) with consumer-friendly privacy copy | Onboarding Step 1 | 30 mins | High (Removes initial confusion) |
| **High** | Auto-scroll confirmation card into view upon NLP extraction | OofLog | 20 mins | High (Avoids missed save button) |
| **High** | Add CSS print page-break containment (`break-inside: avoid`) for Doctor Brief PDF | Brief | 30 mins | High (Clinician consultation utility) |
| **Medium** | Add clinical severity anchors to pain slider (0, 3, 7, 10) | OofLog | 25 mins | Medium (Better data quality) |
| **Medium** | Add 3-step visual milestone roadmap to Cycle empty state | Dayum | 45 mins | Medium (Clearer user expectations) |
| **Medium** | Add CSV export option alongside JSON backup | Settings | 45 mins | High (Accessible data export) |
| **Medium** | Add `inputMode="numeric"` to cycle length stepper inputs | Onboarding Step 2 | 10 mins | Medium (Mobile keyboard usability) |
| **Low** | Dynamic appointment questions tailored to active FIGO flags | Brief | 60 mins | Medium (Consultation personalization) |
| **Low** | In-app PWA install prompt banner for returning mobile users | App Shell | 40 mins | Low (Long-term retention) |
