# Cyculus (`{APP_NAME}`)

> **Private, longitudinal cycle tracking with conversational symptom capture and clinician-ready briefs.**  
> Built for **recHERsion 2026** (ACM-W NITK Surathkal, Engineer NITK 2K26) — **Problem Statement 1: Women's Healthcare**.  
> **Team:** Somya (`{OWNER_A}`), Eva (`{OWNER_B}`), Devyani (`{OWNER_C}`) — GLA University, Mathura.

---

## 🌸 Overview

Most menstrual apps either assume a textbook "28-day cycle" or reduce tracking to rigid date inputs, while medical appointments routinely lack longitudinal, structured symptom data. Women often struggle to convey patterns accurately, particularly in multilingual or colloquial contexts (e.g., Hinglish).

**Cyculus** answers: *"What is happening to my body over time, and what specific facts do I share with my doctor?"*

### Key Features
1. **OofLog · Symptom Diary (Module A)**: Fast, natural logging. Type or speak in everyday Hinglish or English (e.g., *"kal se pet mein bohot dard hai aur flow heavy hai"*). Schema-bound extraction extracts structured records with user confirmation before saving.
2. **Dayum · Cycle Tracker & Insights (Module B)**: Deterministic cycle derivation (FIGO-aligned). Predicts next-period as a **calibrated window** rather than a naive point estimate. Evaluates cited clinical rules to surface plain-language *"worth discussing with a doctor"* flags.
3. **Doctor Brief · Clinician Summary (Module C)**: Generates a one-page, factual summary (PDF / print) in English or Hindi (Devanagari) with targeted questions for doctor visits.
4. **Privacy-First & Zero-Cloud**: All health data lives strictly on-device in IndexedDB (Dexie). No accounts, no cloud sync, and your data never leaves your phone.

---

## 🛡️ Non-Negotiable Safety Architecture (Zero-Hallucination)

1. **Schema-Bound Extraction**: LLM extraction is constrained to strict enums (`FLOW_LEVELS`, `SYMPTOMS`, `MOODS`). Output is verified server-side and must be explicitly confirmed by the user before storage.
2. **Deterministic Insights Engine**: All statistics, cycle bands, and flags are calculated deterministically by pure functions against thresholds in [`src/shared/knowledge.json`](file:///c:/Users/somya/cyculus/src/shared/knowledge.json). No LLM generates clinical advice or verdicts.
3. **Numeric & Date Guard on Briefs**: Any generated brief strictly reports verified numbers from local logs; text is verified against a strict fact whitelist.
4. **No Diagnosis Language**: Language is strictly descriptive and communicative (e.g., *"outside commonly cited ranges, worth discussing with a doctor"*), never diagnostic.

---

## 📐 Project Structure & Module Contracts

```
/
├─ api/                      # Vercel serverless functions (Gemini extraction & polish)
├─ src/
│  ├─ app/                   # Shell, theme tokens, navigation, routes (Module A)
│  ├─ shared/
│  │  ├─ types.ts            # Core contracts & data schemas
│  │  ├─ knowledge.json      # Cited rules & algorithm parameters
│  │  └─ mocks/              # Offline mock datasets (regular, irregular/Riya, heavy)
│  ├─ modules/
│  │  ├─ capture/            # Module A: OofLog UI, storage layer & voice capture
│  │  ├─ insights/           # Module B: Dayum timeline, stats & flag engine
│  │  └─ brief/              # Module C: Doctor brief, PDF export, privacy & PWA
├─ scripts/                  # Persona generator & Utah dataset evaluation
├─ data/external/            # Gitignored external datasets (Utah Hive)
├─ ACKNOWLEDGEMENTS.md       # Attribution, citations & licenses
└─ README.md
```

Core contracts are frozen in [`src/shared/types.ts`](file:///c:/Users/somya/cyculus/src/shared/types.ts).

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm or pnpm

### Installation
```bash
git clone https://github.com/somyamaheshwari2612/cyculus.git
cd cyculus
npm install
```

### Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Add your Google Gemini API key to `.env` (`GEMINI_API_KEY=...`).

### Running Locally
```bash
# Start local development server
npm run dev

# Run unit tests
npm test

# Typecheck
npm run typecheck
```

---

## 📚 Datasets & Clinical Citations
See [`ACKNOWLEDGEMENTS.md`](file:///c:/Users/somya/cyculus/ACKNOWLEDGEMENTS.md) for full academic citations including the **Utah Hive Menstrual Cycle Dataset**, **Bull et al. (2019)**, FIGO standards, and ACOG guidelines.

Module C (Brief, Privacy, PWA) - work in progress by Eva.
