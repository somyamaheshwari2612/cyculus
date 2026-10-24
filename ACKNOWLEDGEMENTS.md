# Acknowledgements & Citations

This project was built during **recHERsion 2026** (ACM-W NITK Surathkal, Engineer NITK 2K26) for **Problem Statement 1: Women's Healthcare**.

In compliance with hackathon rules regarding academic honesty, open-source attribution, and dataset licensing, all third-party datasets, research literature, fonts, and open-source packages utilized in this repository are comprehensively documented below.

---

## 1. Datasets & Clinical Research Foundations

### Primary Validation Dataset
- **Utah Hive Menstrual Cycle Dataset (CC BY-NC 3.0)**:
  - Stanford, J., & Najmabadi, S. (2023). *Menstrual Cycles Length of Women in the USA and Canada, 1990-2013* [Data set]. The Hive: University of Utah Research Data Repository. [https://doi.org/10.7278/S50d-4gxs-s4hj](https://doi.org/10.7278/S50d-4gxs-s4hj)
  - Used for offline calibration and empirical interval evaluation in `scripts/eval-utah.ts`.
  - Raw CSV is maintained out of version control (`data/external/`, gitignored) in adherence to non-commercial sharing guidelines.

### Epidemiological Benchmarks
- **Bull et al. (2019)**:
  - Bull, J. R., Rowland, S. P., Scherwitzl, E. B., et al. *Real-world menstrual cycle characteristics of more than 600,000 menstrual cycles*. npj Digital Medicine 2, 83 (2019). [https://doi.org/10.1038/s41746-019-0152-7](https://doi.org/10.1038/s41746-019-0152-7)
  - Provides population distributions for cycle length (mean 29.3 days), follicular/luteal variation, and physiological variance.
- **Clearblue 2019 Industry Poster**:
  - Real-world cloud dataset analyzing cycle length variance trends across age cohorts.

### Clinical Guidelines & Diagnostic Reference Criteria
Encoded in `src/shared/knowledge.json` for deterministic clinician-reviewed rules:
- **FIGO (International Federation of Gynecology and Obstetrics)**:
  - Munro, M. G., et al. (2018). *The two FIGO systems for normal and abnormal uterine bleeding symptoms and classification of causes of abnormal uterine bleeding in the reproductive years*. Int J Gynecol Obstet 143: 393-408. [https://doi.org/10.1002/ijgo.12666](https://doi.org/10.1002/ijgo.12666)
  - Standard clinical ranges: normal cycle length (24–38 days), normal bleeding duration (4.5–8 days), cycle variation threshold (≤7–9 days), and intermenstrual bleeding definitions.
- **ACOG (American College of Obstetricians and Gynecologists)**:
  - *Committee Opinion No. 651*: Menstruation in Girls and Adolescents: Using the Menstrual Cycle as a Vital Sign.
  - *Committee Opinion No. 760*: Dysmenorrhea and Endometriosis in the Adolescent.
  - *Practice Bulletin No. 128*: Diagnosis of Abnormal Uterine Bleeding in Reproductive-Aged Women.
  - *Practice Bulletin No. 217*: Clinical Management Guidelines for Secondary Amenorrhea.
  - *Committee Opinion No. 557 / Clinical Guidance*: Management of Acute Abnormal Uterine Bleeding in Nonpregnant Reproductive-Aged Women.
- **NICE (National Institute for Health and Care Excellence, UK)**:
  - *NICE Guideline [NG88]*: Heavy menstrual bleeding: assessment and management. [https://www.nice.org.uk/guidance/ng88](https://www.nice.org.uk/guidance/ng88)
- **AAFP (American Academy of Family Physicians)**:
  - *Clinical Review*: Acute Pelvic Pain in Nonpregnant Women. [https://www.aafp.org/pubs/afp/issues/2016/0301/p380.html](https://www.aafp.org/pubs/afp/issues/2016/0301/p380.html)
- **NHS (National Health Service, UK)**:
  - Clinical red-flag triggers for acute menorrhagia requiring urgent emergency assessment.
- **WHO (World Health Organization)**:
  - *WHO Guidelines on Assessment of Acute Emergencies*: Thresholds for syncope, severe hemorrhage, and hemodynamic instability.

---

## 2. Typography & Fonts

All fonts used in Cyculus are distributed under open licenses:

- **Noto Sans Devanagari** (`@fontsource/noto-sans-devanagari`):
  - Author: Google / Modular Infotech
  - License: [SIL Open Font License 1.1](https://scripts.sil.org/OFL)
  - Bundled locally via npm to ensure 100% offline rendering of bilingual Hindi text in both the mobile PWA and the exported Doctor Brief (Chitthi).
- **Inter**:
  - Author: Rasmus Andersson
  - License: [SIL Open Font License 1.1](https://scripts.sil.org/OFL)
  - Loaded via Google Fonts CDN in `index.html`; serves as the core sans-serif UI typography for all data, charts, and conversational components.
- **DM Serif Display**:
  - Author: Colophon Foundry
  - License: [SIL Open Font License 1.1](https://scripts.sil.org/OFL)
  - Loaded via Google Fonts CDN; used for warm, welcoming display headings across the application.
- **Playfair Display**:
  - Author: Claus Eggers Sørensen
  - License: [SIL Open Font License 1.1](https://scripts.sil.org/OFL)
  - Loaded via Google Fonts CDN; editorial serif paired with DM Serif Display in the Doctor Brief printable export.

---

## 3. Runtime Libraries & UI Frameworks

The client-side mobile PWA runtime depends on the following open-source packages:

| Library | Version | Author / Maintainer | License | Role in Cyculus |
|---|---|---|---|---|
| **React** | `^18.3.1` | Meta Open Source | [MIT](https://github.com/facebook/react/blob/main/LICENSE) | Component architecture and reactive rendering |
| **React DOM** | `^18.3.1` | Meta Open Source | [MIT](https://github.com/facebook/react/blob/main/LICENSE) | DOM rendering and portal mounting |
| **Dexie.js** | `^4.0.11` | David Fahlander | [Apache 2.0](https://github.com/dexie/Dexie.js/blob/master/LICENSE) | On-device IndexedDB database for zero-cloud local-first health records |
| **dexie-react-hooks** | `^1.1.7` | David Fahlander | [Apache 2.0](https://github.com/dexie/Dexie.js/blob/master/LICENSE) | `useLiveQuery` hook for observable, zero-latency reactive UI updates from IndexedDB |
| **Recharts** | `^2.13.3` | Recharts Team | [MIT](https://github.com/recharts/recharts/blob/master/LICENSE) | SVG rendering of longitudinal cycle duration bars and pain trend charts |
| **Lucide React** | `^0.460.0` | Lucide Contributors | [ISC](https://github.com/lucide-icons/lucide/blob/main/LICENSE) | Clean, accessible iconography throughout navigation and status badges |
| **clsx** | `^2.1.1` | Luke Edwards | [MIT](https://github.com/lukeed/clsx/blob/master/license) | Lightweight utility for conditionally joining CSS class names |
| **tailwind-merge** | `^2.5.4` | Dany Castillo | [MIT](https://github.com/dcastil/tailwind-merge/blob/main/LICENSE) | Efficient merging of conflicting Tailwind CSS utility classes without style collisions |
| **@google/generative-ai** | `^0.21.0` | Google LLC | [Apache 2.0](https://github.com/google/generative-ai-js/blob/main/LICENSE) | Gemini SDK powering the server-side `/api/extract` conversational symptom extractor |

---

## 4. Build Tooling, Compilers & Developer Dependencies

Tooling utilized for building, testing, optimizing, and evaluating Cyculus:

| Tool | Version | Author / Maintainer | License | Purpose in Cyculus |
|---|---|---|---|---|
| **Vite** | `^5.4.11` | Yuxi (Evan) You & Vite Contributors | [MIT](https://github.com/vitejs/vite/blob/main/LICENSE) | Next-generation frontend bundler, HMR server, and SSR dev API middleware |
| **@vitejs/plugin-react** | `^4.3.4` | Vite Team | [MIT](https://github.com/vitejs/vite-plugin-react/blob/main/LICENSE) | Fast Refresh and Babel JSX transformation |
| **vite-plugin-pwa** | `^0.20.5` | Anthony Fu & PWA Team | [MIT](https://github.com/vite-pwa/vite-plugin-pwa/blob/main/LICENSE) | Zero-config PWA generation with Workbox offline caching and service worker registration |
| **Tailwind CSS** | `^3.4.15` | Tailwind Labs Inc. | [MIT](https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE) | Design system tokens (pastel palette, clinical severity tokens, responsive typography) |
| **PostCSS** | `^8.4.49` | Andrey Sitnik | [MIT](https://github.com/postcss/postcss/blob/main/LICENSE) | CSS transformation pipeline for Tailwind |
| **Autoprefixer** | `^10.4.20` | Andrey Sitnik | [MIT](https://github.com/postcss/autoprefixer/blob/main/LICENSE) | Automatic CSS vendor prefixing for cross-browser mobile compatibility |
| **TypeScript** | `^5.6.3` | Microsoft Corporation | [Apache 2.0](https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt) | Static type checking for strict schema guarantees and zero runtime regressions |
| **Vitest** | `^2.1.8` | Vitest Team | [MIT](https://github.com/vitest-dev/vitest/blob/main/LICENSE) | Unit and integration test runner executing persona and clinical flag test suites |
| **tsx** | *(via npx)* | Hiroki Osame (privatenumber) | [MIT](https://github.com/privatenumber/tsx/blob/master/LICENSE) | High-speed TypeScript execution engine for `scripts/eval-utah.ts` and `scripts/generate-personas.ts` |
| **DefinitelyTyped** (`@types/*`) | Various | DefinitelyTyped Contributors | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE) | TypeScript definitions for Node, React, and ReactDOM |

---

## 5. Privacy & Ethical Attribution Notice

- **Local-First Zero Cloud Ingestion**: All menstrual diary entries, symptom notes, pain scores, and flow logs are stored strictly inside the client device's IndexedDB via Dexie. No user health records are transmitted to or stored on any remote cloud database.
- **Transient AI Processing**: Conversational entries processed via Gemini operate exclusively with constrained JSON schemas on stateless serverless functions with zero session persistence.
- **Clear Clinical Boundaries**: Cyculus flags, charts, and summaries are explicitly intended as longitudinal preparation tools to facilitate informed discussions with qualified healthcare providers, not as autonomous medical diagnosis systems.
