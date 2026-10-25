# 🎬 Cyculus Hackathon Demo Video Guide & Walkthrough Script

> **recHERsion 2026** — *Problem Statement 1: Women's Healthcare*  
> **Recommended Video Duration:** 3:00 – 3:30 minutes  
> **App URL:** [https://cyculus.vercel.app](https://cyculus.vercel.app) or `http://localhost:5173`

---

## 📋 Quick Setup Before Recording

1. **Browser State:** Open Chrome in an Incognito window or clear browser site data so you start on the fresh watercolor **Welcome Screen**.
2. **Resolution:** 1080p (1920×1080) or 1366×768 with browser zoom at 100%.
3. **Audio:** Clear mic with enthusiastic, serene, and confident tone.

---

## ⏱️ Video Timeline & Screen-by-Screen Script

### Act 1: The Hook & Onboarding (0:00 – 0:40)
**Goal:** Show aesthetic beauty, zero-cloud privacy guarantee, and debunking the 28-day myth.

- **On Screen:**
  1. Open on the watercolor welcome screen with the soft cherry blossom artwork and Cyculus logo.
  2. Point your cursor to the headline: *"Your patterns, understood."*
  3. Click **"Begin your journal →"**.
  4. In Step 2:
     - Type Name: `Medhya`
     - Last period date: Pick a date ~10 days ago (e.g. `2026-10-15`).
     - Cycle length: Click the **"28 is a myth"** quick chips: tap `28d`, then `31d`, or adjust with `[-]` / `[+]`.
     - Click **"Open my journal →"**.

- **Voiceover / What to Say:**
  > *"Every month, hundreds of millions of women track their cycles. But almost every tracker on the market forces a rigid 28-day assumption, creating unnecessary anxiety for women with natural variation or conditions like PCOS. And when they visit a doctor, they're given only 5 minutes to recall months of vague symptoms.*
  >
  > *This is **Cyculus** — a private, longitudinal cycle and symptom diary built with clinical rigor, serene editorial aesthetics, and zero-cloud architecture.*
  >
  > *Right from onboarding, Cyculus debunks the 28-day myth — standardizing against FIGO and ACOG clinical ranges from 24 to 38 days, storing 100% of your data locally on your device in IndexedDB."*

---

### Act 2: The Overview Dashboard (0:40 – 1:10)
**Goal:** Show the dynamic cycle ring, calibrated prediction window, and 14-day strip.

- **On Screen:**
  1. Arrive on the **Overview** dashboard.
  2. Show the personalized greeting: *"Good afternoon, Medhya"*.
  3. Point to the **Cycle Ring**: shows current cycle day progress.
  4. Point to the **"Next period · estimate"** card showing the empirical prediction window based on real rolling averages (validated against the Utah Hive dataset).
  5. Click **"⚙️ Cycle length setup"** in the header to briefly reveal the **Cycle Prior Calibration Modal**, show the stepper, and close it.
  6. Hover over the **Last two weeks (14-day interactive strip)**.

- **Voiceover / What to Say:**
  > *"On the Overview dashboard, Cyculus gives an instant, calming view of your current cycle day. Rather than an arbitrary single-day guess, our prediction engine computes an evidence-based window validated against the Utah Hive dataset of over 1,600 real cycles.*
  >
  > *You can recalibrate your cycle length or earlier period dates anytime with one tap."*

---

### Act 3: Conversational Check-in & Clinical Safety (1:10 – 2:05)
**Goal:** Show natural language extraction in Hinglish, Confirmation Card review, Deselect/Toggle, Pain threshold, and Urgent Alert.

- **On Screen:**
  1. Click **"Log today"** or navigate to the **"Log symptoms"** tab.
  2. **Test NLP-01 (Suggestion Chip):**
     - Tap the suggestion chip: `"kal se pet mein bohot dard hai aur flow heavy hai"`.
     - Show how it instantly populates the smart check-in bar.
  3. **Test NLP-02 & NLP-03 (Confirmation Card Modal):**
     - Click the **Send (Paper Plane)** button.
     - Highlight the lavender **Confirm Card** that pops up:
       - Show that Cyculus *never auto-saves unreviewed AI text*.
       - Point to the understood fields: *Flow: Heavy, Pain: 8/10 (Severe), Symptoms: Cramps*.
       - Click **"बदलें (Edit)"** in the top right to demonstrate that the user has complete manual control over any field.
       - Click **"Confirm & Save Log"**.
     - Toast appears: *"Daily check-in saved!"* and badge shows *"✓ Logged for today"*.
  4. **Test TAP-03 & TAP-06 (Pain scale & Deselect):**
     - Tap Pain `6` (lavender highlight).
     - Tap Pain `9` (notice it turns clinical warning red `bg-rose-deep` alerting to severe dysmenorrhea).
     - Tap Flow `Heavy` again to show clean deselection and re-select `Medium`.
     - Select Mood: `Irritable ⚡`.
  5. **Test ALERT-01 (Urgent Clinical Red Flag):**
     - In the smart input bar, type:
       `"Soaking a pad every 30 minutes and severe dizziness"`
     - Click **Send**.
     - Show the prominent red alert banner citing ACOG & NHS protocols for excessive bleeding and directing to emergency evaluation.

- **Voiceover / What to Say:**
  > *"Logging shouldn't feel like filling a bureaucratic form. With Cyculus's conversational check-in, users can type or speak naturally in everyday Hinglish or English.*
  >
  > *When we say 'kal se pet mein bohot dard hai aur flow heavy hai', Cyculus parses the intent and presents a lavender Confirmation Card. We believe in strict human-in-the-loop safety: no AI inference is ever written to your medical diary without explicit user approval.*
  >
  > *Our visual pain scale highlights severe dysmenorrhea (levels 8 to 10) in clinical warning red. And if high-risk phrases like soaking a pad every 30 minutes are logged, Cyculus immediately triggers an ACOG-grounded urgent advisory banner."*

---

### Act 4: Doctor Brief (चिट्ठी · 1-Page Summary) (2:05 – 2:40)
**Goal:** Show the clinical consultation summary, bilingual Hindi/English switch, and anti-hallucination numeric guard.

- **On Screen:**
  1. Click the **"Summary for Doctor"** tab in the sidebar.
  2. Scroll through the editorial brief:
     - Point out the cycle summary statistics (Cycle length, Bleeding duration, Heavy days).
     - Point out the **Clinical Observations** grounded in ACOG/FIGO criteria.
     - Point out the **Questions for Doctor Consultation** with checkboxes.
  3. Click the language toggle button: switch from **English** to **हिंदी (Hinglish)**.
     - Show how all clinical facts translate smoothly into natural Devanagari script.
  4. Click the **"Print / Save PDF"** button to show the clean, print-ready 1-page layout dialog (cancel or preview).

- **Voiceover / What to Say:**
  > *"The heart of Cyculus is bridging the 5-minute doctor consultation gap. The Doctor Brief — or चिट्ठी — transforms months of complex daily logs into a factual, high-density 1-page clinical summary.*
  >
  > *Our zero-hallucination Numeric Guard ensures that every number, cycle length, and date printed is verified against ground-truth IndexedDB logs.*
  >
  > *It offers full bilingual English and Hindi Devanagari support, so patients can prepare for appointments in the language they are most comfortable with, complete with suggested doctor questions."*

---

### Act 5: Demonstration Personas & Conclusion (2:40 – 3:15)
**Goal:** Show instant 180-day judge demo scenarios (PCOS, Menorrhagia), JSON export, and closing impact.

- **On Screen:**
  1. Click the **"Settings & privacy"** tab.
  2. Point out the **"Clinical Scenarios (Instant Demo)"** panel.
  3. Click **"Riya (PCOS / Irregular)"**:
     - Toast confirms: *"Loaded 180 days of Riya's scenario!"*.
  4. Switch back to **"Insights"** or **"Summary for Doctor"**:
     - Show how the app instantly recalibrated to reflect 180 days of 32–54 day irregular cycles with FIGO cycle variation flags.
  5. Return to **Settings** and point out the **"Export all records (JSON)"** button.

- **Voiceover / What to Say:**
  > *"For evaluators and doctors, Cyculus provides instant 1-click clinical scenarios in Settings — like Riya, simulating 180 days of irregular PCOS cycles that reactively recompute all insights and doctor briefs without manual data entry.*
  >
  > *Cyculus is private, scientifically grounded in FIGO and ACOG standards, and designed to empower women with clarity and dignity over their bodies.*
  >
  > *Thank you!"*

---

## 🎯 High-Scoring Tips for Hackathon Judges

| What Judges Look For | Where to Show It in Video |
|---|---|
| **Clinical Credibility** | Point to FIGO/ACOG citations, the "28 is a myth" badge, and the Utah Hive dataset validation table. |
| **Conversational AI Value** | Show typing in Hinglish (`"kal se pet mein..."`) and the editable Confirmation Card. |
| **Safety & Anti-Hallucination** | Emphasize that LLMs never guess numbers or diagnose; mention the `numericGuard.ts` layer. |
| **User Privacy** | Highlight that data stays 100% on the phone in IndexedDB with zero remote tracking. |
| **Ease of Evaluation** | Demonstrate the 1-click **Riya (PCOS)** persona in Settings. |
