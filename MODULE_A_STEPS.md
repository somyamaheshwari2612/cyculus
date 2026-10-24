# Module A: Roadmap & Execution Guide (Somya)

**Module:** OofLog (Conversational Capture) + App Shell + Storage Layer + Clinical Rules Curation  
**Owner:** Somya  
**Strengths:** UI/UX, AI Integration, Clinical Data Curation  
**Scope Boundary:** `src/app/`, `src/modules/capture/`, `api/extract.ts`, `src/shared/knowledge.json`

---

## 1. Direct Answers: Dataset & Ownership

### Q: What files are needed from me?
You own and maintain:
- `src/app/` — Design tokens, shell layout, navigation, base components (Button, Card, Chip, Sheet, Toast, LanguageToggle).
- `src/modules/capture/` — OofLog diary interface, Confirm card, Urgent banner, Dexie storage integration, `useLogs` hook.
- `api/extract.ts` — Serverless Gemini extraction function with strict response schema & Hinglish glossary.
- `src/shared/knowledge.json` — Curating the clinical thresholds, FIGO/ACOG sources, and bilingual strings.

### Q: Where do I put that dataset? Am I working on it or somebody else?
- **Dataset location:** `data/external/CrMcyclelength_share.csv` (already configured in `.gitignore` so raw data is never committed).
- **Who works on it:** **Eva (Module B)** works on the Utah Hive dataset. She runs `scripts/eval-utah.ts` to calibrate cycle predictions and MAE baselines for the PPT.
- **You do NOT need to evaluate the Utah dataset.** Your focus is making OofLog capture effortless, curating `knowledge.json`, and providing the storage layer that Eva (Module B) and Devyani (Module C) depend on.

---

## 2. Phase-by-Phase Roadmap for Module A

We will work through these phases **step by step**. At the end of each phase, we will test and commit.

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Storage Engine & Merge Contracts (COMPLETED)       │
│ • Dexie IndexedDB setup + pure merge logic                  │
│ • Vitest unit tests (4/4 passing)                           │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 2: Responsive Shell & Desktop-Web Polish              │
│ • Mobile-first container that scales elegantly on desktop   │
│ • Responsive layout (sidebar/bottom-nav transition on web)  │
│ • Bilingual toggle & accessible touch targets (≥44px)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 3: OofLog UI & Speech Recognition                     │
│ • Conversational natural text box + Web Speech mic          │
│ • 100% offline daily tap logger (Flow, Pain 0-10, Chips)    │
│ • Editable Confirm Card (Never auto-saves unconfirmed)      │
│ • Offline queue fallback when disconnected                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 4: Gemini Serverless Extraction (api/extract.ts)      │
│ • Schema-bound output (FLOW_LEVELS, SYMPTOMS, MOODS enums)  │
│ • Hinglish few-shot glossary & relative date resolver       │
│ • In-memory cache & client-side rate limit safeguard        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 5: Clinical Safety, Urgent Flags & knowledge.json     │
│ • Verified FIGO / ACOG / WHO citations                      │
│ • Urgent red-flag banner (soaking pads, fainting, acute pain)│
│ • Non-diagnostic language audit (zero verdicts)             │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 6: Hand-off & Integration Testing                     │
│ • Verify Eva (Module B) can read LogEntry[]                 │
│ • Verify Devyani (Module C) can consume storage & brief data│
│ • Final check of PWA installability & offline resilience    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Working Agreements for Module A
1. **Step-by-Step execution:** Build one feature block at a time, test it, explain what was done, and confirm before moving to the next.
2. **Git discipline:** Remind to commit and push at every milestone.
3. **Responsive design:** Mobile-first, but looks like a top-tier web app on desktop (no stretched full-screen textareas).
4. **Safety first:** No diagnosis language; zero LLM calls without schema guards.
