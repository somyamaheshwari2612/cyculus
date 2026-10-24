# Acknowledgements & Citations

This project was built during **recHERsion 2026** (ACM-W NITK Surathkal, Engineer NITK 2K26) for **Problem Statement 1: Women's Healthcare**.

In compliance with hackathon rules regarding academic honesty and attribution, all third-party datasets, research benchmarks, algorithms, and key libraries used in this project are documented below.

---

## 1. Datasets & Research Foundations

- **Utah Hive Menstrual Cycle Dataset (CC BY-NC 3.0)**:
  - Stanford, J., & Najmabadi, S. (2023). *Menstrual Cycles Length of Women in the USA and Canada, 1990-2013* [Data set]. The Hive: University of Utah Research Data Repository. [https://doi.org/10.7278/S50d-4gxs-s4hj](https://doi.org/10.7278/S50d-4gxs-s4hj)
  - Used strictly for offline validation and calibration of cycle prediction intervals in `scripts/eval-utah.ts`.
  - Raw CSV is kept out of version control (`data/external/`, gitignored).
  
- **Clinical Benchmarks & Population Distributions**:
  - **Bull et al. (2019)**: Bull, J. R., Rowland, S. P., Scherwitzl, E. B., et al. *Real-world menstrual cycle characteristics of more than 600,000 menstrual cycles*. npj Digital Medicine 2, 83 (2019). [https://doi.org/10.1038/s41746-019-0152-7](https://doi.org/10.1038/s41746-019-0152-7)
  - **FIGO (International Federation of Gynecology and Obstetrics)**: Normal menstrual cycle parameters and definitions of abnormal uterine bleeding (AUB).
  - **ACOG (American College of Obstetricians and Gynecologists)**: Clinical guidelines on menstruation in girls and adolescents as a vital sign (Committee Opinion No. 651).
  - **Clearblue 2019 Poster**: Real-world cloud dataset reference on cycle length variations across age cohorts (non-peer reviewed industry poster).

---

## 2. Typography & Fonts

- **Noto Sans Devanagari** (`@fontsource/noto-sans-devanagari`):
  - Distributed under the Open Font License (OFL) by Google Fonts.
  - Bundled locally to guarantee offline rendering of Hindi (Devanagari script) in both the mobile PWA UI and the exported Doctor Brief PDF.

---

## 3. Libraries & Open Source Tools

- **Vite** — Frontend build tooling ([MIT License](https://github.com/vitejs/vite/blob/main/LICENSE))
- **React & React DOM** — UI library ([MIT License](https://github.com/facebook/react/blob/main/LICENSE))
- **Tailwind CSS** — Utility-first styling ([MIT License](https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE))
- **Dexie.js** — IndexedDB wrapper for local-first zero-cloud on-device storage ([Apache 2.0](https://github.com/dexie/Dexie.js/blob/master/LICENSE))
- **Recharts** — Composable charting library for React ([MIT License](https://github.com/recharts/recharts/blob/master/LICENSE))
- **Lucide React** — Clean, consistent icons ([ISC License](https://github.com/lucide-icons/lucide/blob/main/LICENSE))
- **vite-plugin-pwa** — Progressive Web App plugin with Workbox service worker ([MIT License](https://github.com/vite-pwa/vite-plugin-pwa/blob/main/LICENSE))
- **Vitest** — Unit testing framework ([MIT License](https://github.com/vitest-dev/vitest/blob/main/LICENSE))
- **Google Gen AI SDK** — Schema-constrained extraction and brief polish ([Apache 2.0](https://github.com/google/generative-ai-js/blob/main/LICENSE))

---

## 4. Privacy & Ethical Attribution Notice

- All daily health tracking data is stored locally in the user's browser IndexedDB via Dexie.
- No personal health diary entries are transmitted to or stored on any central server or database.
- AI features operate strictly with constrained JSON schemas and serverless functions without persistence.
