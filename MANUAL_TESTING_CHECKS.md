# Cyculus: Manual QA & Sanity Testing Checklist

This checklist tracks real manual user tests you can run directly in your browser (`http://localhost:5174/` or `http://localhost:5173/`) to catch edge cases, UI glitches, and data persistence bugs.

---

## Phase 3: OofLog UI & Capture Testing

### 📋 Feature 3.1: Daily Tap Check-In (Offline-First)

| Test ID | Test Scenario | Steps to Execute | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TAP-01** | **Basic Tap Save** | 1. Open app at `http://localhost:5174/`<br>2. On OofLog screen, scroll to "Daily Tap Check-in".<br>3. Tap Flow = `Medium`.<br>4. Tap Pain = `6`.<br>5. Tap Symptoms = `Cramps` + `Bloating`.<br>6. Tap Mood = `Irritable`.<br>7. Click "Save Today's Check-in". | Toast appears: *"Daily check-in saved!"*<br>Badge shows: `✓ Logged for today`.<br>Buttons remain selected with no console errors. | 🔲 Pending |
| **TAP-02** | **Persistence on Hard Refresh** | 1. Complete TAP-01.<br>2. Press `Ctrl + Shift + R` (hard reload) in browser.<br>3. Inspect the tap check-in card. | All previously selected chips (Flow Medium, Pain 6, Cramps, Bloating, Mood Irritable) are still selected upon reload from Dexie IndexedDB. | 🔲 Pending |
| **TAP-03** | **Pain Scale Visual Threshold** | 1. Tap Pain numbers 0 through 7.<br>2. Tap Pain numbers 8, 9, 10. | Numbers 0–7 highlight in primary lavender/purple.<br>Numbers 8, 9, and 10 highlight in clinical warning red (alerting to severe dysmenorrhea). | 🔲 Pending |
| **TAP-04** | **Merge Semantics (Updating Same Day)** | 1. With existing log, select an additional symptom (e.g., `Headache`).<br>2. Change Flow from `Medium` to `Heavy`.<br>3. Click "Save Today's Check-in". | Symptoms now include `Cramps` + `Bloating` + `Headache` (union merge).<br>Flow updates to `Heavy` (latest non-null wins). | 🔲 Pending |
| **TAP-05** | **Offline Tap Logging** | 1. In Chrome DevTools, open Network tab & set throttling to **Offline** (or disconnect WiFi).<br>2. Select Flow = `Light`, Pain = `3`.<br>3. Click "Save Today's Check-in". | Check-in saves instantly to Dexie IndexedDB with success toast. Zero network errors. | 🔲 Pending |
| **TAP-06** | **Deselect / Toggle Off** | 1. Tap an active symptom chip (e.g. `Cramps`).<br>2. Tap an active flow button (e.g. `Heavy`). | Chip deselects cleanly.<br>Flow deselects to unselected state. | 🔲 Pending |

---

### 📋 Feature 3.2: Conversational Natural Language & Confirm Card

| Test ID | Test Scenario | Steps to Execute | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **NLP-01** | **One-Tap Suggestion Chip** | 1. Tap the quick chip: `"kal se pet mein bohot dard hai aur flow heavy hai"`. | Textarea automatically populates with the text. | 🔲 Pending |
| **NLP-02** | **Confirmation Card Modal** | 1. With text in textarea, click the Send (paper plane) button.<br>2. Observe response. | **Never auto-saves.**<br>A lavender **Confirm Card** appears showing understood fields: Flow: Heavy, Pain: 8/10, Symptoms: Cramps, Pelvic Pain. | 🔲 Pending |
| **NLP-03** | **Edit Mode in Confirm Card** | 1. On the Confirm Card, click **"Edit" (बदलें)** in the top right.<br>2. Change date, toggle an extra symptom (e.g., `Fatigue`), adjust pain slider.<br>3. Click "Confirm & Save Log". | Card saves your modified values to IndexedDB.<br>Textarea clears.<br>Success toast displays. | 🔲 Pending |
| **NLP-04** | **Discard / Cancel** | 1. Enter any text and click Send.<br>2. On Confirm Card, click **"Discard"** (रद्द करें). | Confirm card closes without writing to storage.<br>Existing logs remain unaffected. | 🔲 Pending |

---

### 📋 Feature 3.3: Web Speech API Voice Mic (`hi-IN` & `en-IN`)

| Test ID | Test Scenario | Steps to Execute | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **VOICE-01** | **Mic Visibility Check** | 1. Open on Chrome (Android or Desktop).<br>2. Open on Safari (iOS). | Mic button appears on Chrome (Speech API supported).<br>Mic gracefully hides on browsers where speech recognition is unsupported. | 🔲 Pending |
| **VOICE-02** | **Language-Aware Speech Recognition** | 1. In top bar, toggle language to **हिन्दी**.<br>2. Tap Mic (turns pulsing red).<br>3. Speak in Hindi: *"आज पेट में बहुत दर्द है"*. | Mic turns red while listening.<br>Speech transcript appends in textarea.<br>Mic turns back off when speech stops. | 🔲 Pending |

---

### 📋 Feature 3.4: Urgent Red Flags & Offline Queue

| Test ID | Test Scenario | Steps to Execute | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ALERT-01** | **Urgent Heavy Bleeding Alert** | 1. Type: *"Soaking a pad every 30 minutes and severe dizziness"*. Click Send. | Prominent, calm red alert banner appears stating clinical advisory (ACOG / NHS citation) directing to emergency care.<br>Language is non-diagnostic. | 🔲 Pending |
| **OFFLINE-01** | **Offline Text Queue Fallback** | 1. Turn off WiFi / Set network to **Offline**.<br>2. Type: *"Feeling cramps today"* and click Send. | App detects offline state, immediately saves raw text into today's log notes without crashing, and displays: *"Saved offline! Raw text saved into today's notes."* | 🔲 Pending |

---

## 🔍 How to Record Your Test Results
When running tests, mark:
- `✅ Pass`
- `❌ Fail: [Describe bug here]`
- `⚠️ Polish: [Describe UX tweak here]`
