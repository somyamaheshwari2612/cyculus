# Cyculus: Manual QA & Sanity Testing Checklist

This checklist tracks real manual user tests you can run directly in your browser (`http://localhost:5173/` or `http://localhost:5174/`) to catch edge cases, UI glitches, and data persistence bugs.

---

## Phase 3: OofLog UI & Capture Testing

### 📋 Feature 3.1: Daily Tap Check-In (Offline-First)

| Test ID | Test Scenario | Steps to Execute | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TAP-01** | **Basic Tap Save** | 1. Open app at `http://localhost:5173/`<br>2. On OofLog screen, scroll to "Daily Tap Check-in".<br>3. Tap Flow = `Medium`.<br>4. Tap Pain = `6`.<br>5. Tap Symptoms = `Cramps` + `Bloating`.<br>6. Tap Mood = `Irritable`.<br>7. Click "Save Today's Check-in". | Toast appears: *"Daily check-in saved!"*<br>Badge shows: `✓ Logged for today`.<br>Buttons remain selected with no console errors. | ✅ Pass |
| **TAP-02** | **Persistence on Hard Refresh** | 1. Complete TAP-01.<br>2. Press `Ctrl + Shift + R` (hard reload) in browser.<br>3. Inspect the tap check-in card. | All previously selected chips (Flow Medium, Pain 7, Cramps, Bloating, Mood Irritable) are still selected upon reload from Dexie IndexedDB. | ✅ Pass |
| **TAP-03** | **Pain Scale Visual Threshold** | 1. Tap Pain numbers 0 through 7.<br>2. Tap Pain numbers 8, 9, 10. | Numbers 0–7 highlight in primary lavender/purple.<br>Numbers 8, 9, and 10 highlight in clinical warning red (alerting to severe dysmenorrhea). | ✅ Pass |
| **TAP-04** | **Merge Semantics (Updating Same Day)** | 1. With existing log, select an additional symptom (e.g., `Headache`).<br>2. Change Flow from `Medium` to `Heavy`.<br>3. Click "Save Today's Check-in". | Symptoms now include `Cramps` + `Bloating` + `Headache` (union merge).<br>Flow updates to `Heavy` (latest non-null wins). | ✅ Pass |
| **TAP-05** | **Offline Tap Logging** | 1. In Chrome DevTools, open Network tab & set throttling to **Offline** (or disconnect WiFi).<br>2. Select Flow = `Light`, Pain = `3`.<br>3. Click "Save Today's Check-in". | Check-in saves instantly to Dexie IndexedDB with success toast. Zero network errors. | ✅ Pass |
| **TAP-06** | **Deselect / Toggle Off** | 1. Tap an active symptom chip (e.g. `Cramps`).<br>2. Tap an active flow button (e.g. `Heavy`). | Chip deselects cleanly.<br>Flow deselects to unselected state. | ✅ Pass |

---

### 📋 Feature 3.2: Conversational Natural Language & Confirm Card

| Test ID | Test Scenario | Steps to Execute | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **NLP-01** | **One-Tap Suggestion Chip** | 1. Tap the quick chip: `"kal se pet mein bohot dard hai aur flow heavy hai"`. | Textarea automatically populates with the text. | ✅ Pass |
| **NLP-02** | **Confirmation Card Modal** | 1. With text in textarea, click the Send (paper plane) button.<br>2. Observe response. | **Never auto-saves.**<br>A lavender **Confirm Card** appears showing understood fields: Flow: Heavy, Pain: 8/10, Symptoms: Cramps, Pelvic Pain. | ✅ Pass |
| **NLP-03** | **Edit Mode in Confirm Card** | 1. On the Confirm Card, click **"Edit" (बदलें)** in the top right.<br>2. Change date, toggle an extra symptom (e.g., `Fatigue`), adjust pain slider.<br>3. Click "Confirm & Save Log". | Card saves your modified values to IndexedDB.<br>Textarea clears.<br>Success toast displays. | ✅ Pass |
| **NLP-04** | **Discard / Cancel** | 1. Enter any text and click Send.<br>2. On Confirm Card, click **"Discard"** (रद्द करें). | Confirm card closes without writing to storage.<br>Existing logs remain unaffected. | ✅ Pass |

---

### 📋 Feature 3.3: Web Speech API Voice Mic (`hi-IN` & `en-IN`)

| Test ID | Test Scenario | Steps to Execute | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **VOICE-01** | **Mic Visibility Check** | 1. Open on Chrome (Android or Desktop).<br>2. Open on Safari (iOS). | Mic button appears on Chrome (Speech API supported).<br>Mic gracefully hides on browsers where speech recognition is unsupported. | ✅ Pass |
| **VOICE-02** | **Language-Aware Speech Recognition** | 1. In top bar, toggle language to **हिन्दी**.<br>2. Tap Mic (turns pulsing red).<br>3. Speak in Hindi: *"आज पेट में बहुत दर्द है"*. | Mic turns red while listening.<br>Speech transcript appends in textarea.<br>Mic turns back off when speech stops. | 🔲 Needs Real Mic |

---

### 📋 Feature 3.4: Urgent Red Flags & Offline Queue

| Test ID | Test Scenario | Steps to Execute | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ALERT-01** | **Urgent Heavy Bleeding Alert** | 1. Type: *"Soaking a pad every 30 minutes and severe dizziness"*. Click Send. | Prominent, calm red alert banner appears stating clinical advisory (ACOG / NHS citation) directing to emergency care.<br>Language is non-diagnostic. | ✅ Pass |
| **OFFLINE-01** | **Offline Text Queue Fallback** | 1. Turn off WiFi / Set network to **Offline**.<br>2. Type: *"Feeling cramps today"* and click Send. | App detects offline state, immediately saves raw text into today's log notes without crashing, and displays: *"Saved offline! Raw text saved into today's notes."* | ✅ Pass |

---

## 📋 Feature 3.5: Rate Limit Enforcement

| Test ID | Test Scenario | Steps to Execute | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **RATE-01** | **14 RPM Free-Tier Guard** | Exceed 14 requests within 60 seconds on `/api/extract`. | Returns HTTP 429: *"Rate limit reached (capped at 14 requests/min). Please wait a few moments before trying again."* Protects Gemini free-tier quota. | ✅ Pass |

---

## 📋 Feature 3.6: Aesthetic & Visual Makeover (Pastel & Editorial Serif)

| Test ID | Test Scenario | Steps to Execute | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **VIS-01** | **Onboarding Modal Floral Aesthetic** | 1. Open app in an incognito window (or clear `cyculus_onboarding_done` in localStorage).<br>2. Observe the welcome dialog. | Soft blush background with cherry blossom emblem (`🌸`), serif title (*Welcome to Cyculus*), pastel guarantee cards, and a rounded pill "Get Started →" button. | ✅ Pass |
| **VIS-02** | **OofLog Editorial Header & Cards** | 1. Dismiss onboarding.<br>2. Inspect the OofLog header and cards. | Ambient warm blush canvas (`#FAF5F7`), DM Serif Display heading (*Hey there, what's on your mind today?*), soft floating cards with rounded corners, pill badges, and circular action buttons. | ✅ Pass |
| **VIS-03** | **Dayum Prediction & Timeline** | 1. Click the "Dayum" tab.<br>2. Inspect the prediction window card. | Soft pastel gradient card (`tint-lavender` to `tint-peach`), large serif dates (*Nov 18 – Nov 24*), Utah Hive baseline tag, and FIGO clinical flag card. | ✅ Pass |
| **VIS-04** | **Doctor Brief (Chitthi) Styling** | 1. Click "Doctor Brief" tab.<br>2. Switch between English and हिन्दी. | Editorial 1-page health summary with 4 pastel metric cards (Average, Latest, Range, Bleeding), bulleted clinical observations, and print button. | ✅ Pass |
| **VIS-05** | **Settings Demo Personas** | 1. Click "Settings" tab.<br>2. Inspect the Demo Personas section.<br>3. Click "✨ Riya (Irregular)". | 3 floating pastel cards (Lavender, Mint, Peach) matching showcase reference. Clicking Riya preloads 41-day cycle data with instant success toast. | ✅ Pass |
| **VIS-06** | **Desktop Sidebar & Dual-Column Dashboard** | 1. Open app on desktop / wide screen (`>= 1024px`).<br>2. Observe left sidebar with brand logo, nav pills, and botanical quote card.<br>3. Inspect the top banner (*Hey there, Somya 👋*) with botanical SVG flourish.<br>4. Inspect OofLog dual-column layout (NLP on left, Tap check-in on right). | Full desktop dashboard fills space elegantly without awkward empty margins or excessive vertical scrolling. | ✅ Pass |
| **VIS-07** | **Mobile Phone-First View & Quick Categories** | 1. Resize viewport to mobile screen (`< 768px`).<br>2. Observe hidden desktop sidebar and active bottom navigation bar.<br>3. Tap circular quick category pills (*Periods, Cramps, Mood, Energy, Bloating, Headache*). | Sidebar collapses into sleek top header & bottom navigation bar. Quick category circles instantly pre-select symptoms with 1 tap. | ✅ Pass |
| **VIS-08** | **Adaptive Bottom Navigation on Phones & Tablets** | 1. View Cyculus on any screen `< 1024px` (e.g. mobile phones 390px, 500px, tablets 768px).<br>2. Observe side menu disappears completely.<br>3. Inspect the bottom navigation bar docked at the bottom.<br>4. Switch tabs (`OofLog`, `Dayum`, `Brief`, `Settings`).<br>5. Expand viewport to `>= 1024px`. | On all phone/tablet screens, navigation docks at the bottom with active pill indicators and safe-area padding.<br>At `>= 1024px`, the left sidebar smoothly resumes. | ✅ Pass |

---

## 📋 Feature 3.7: On-Device Personal Profile & Dynamic Rolling Average Engine

| Test ID | Test Scenario | Steps to Execute | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **PROF-01** | **Personal Profile Setup & Zero-Cloud Storage** | 1. Navigate to Settings & click "Re-open Guided Setup Wizard".<br>2. Step 1: Click "Set Up Your Profile →".<br>3. Step 2: Enter Name = `Somya`, Last Period = `2026-10-11`, Cycle = `28`, Bleed = `5`, Past 3 cycles = `28, 29, 28`.<br>4. Click "Save & Enter Diary". | Saved 100% locally to browser `localStorage` & IndexedDB.<br>Zero remote database needed.<br>Header updates to `Hey there, Somya 👋` and avatar pill `S`. | ✅ Pass |
| **PROF-02** | **Dynamic Cycle Calculation & Reactive Recalibration** | 1. Inspect Dayum after saving profile.<br>2. Verify Predicted Period Window center and range.<br>3. Check Cycle Day pill and phase band.<br>4. Log an early bleeding episode in OofLog. | Dayum dynamically computes prediction window based on rolling average.<br>Cycle Day and phase band (Early Follicular, Mid-Cycle, Luteal) update reactively without page reloads.<br>Doctor Brief displays personalized cycle characteristics and evidence-grounded questions. | ✅ Pass |