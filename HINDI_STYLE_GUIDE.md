# Cyculus Hindi Style Guide (नैचुरल हिंदी गाइड)

> **Core Philosophy**: Write from **intent**, in a natural conversational register. This is not a word-for-word translation from English. Speak like an empathetic, well-informed friend or college senior discussing menstrual health—warm, clear, respectful, and zero stigma.

---

## 1. Golden Rules

### 1. Address the user with "आप" in a friendly, gentle tone
- Always use **"आप"** (never *तू* or *तुम*).
- Use natural, friendly imperatives:
  - ✅ *"आज कैसा रहा? अपनी भाषा में लिख दीजिए"*
  - ❌ *"अपने शब्दों में आज के बारे में बताएं"* (stiff)
  - ✅ *"एक बार डॉक्टर से बात कर लेना अच्छा रहेगा"*
  - ❌ *"चिकित्सक से परामर्श किया जाना चाहिए"* (bureaucratic)

### 2. Short, active sentences
- Keep sentences concise. One thought per sentence.
- Favor active phrasing over passive grammatical constructions.
  - ✅ *"हमने 3 पीरियड्स के आधार पर यह अंदाज़ा लगाया है"*
  - ❌ *"3 चक्रों के डेटा द्वारा यह अनुमान परिकलित किया गया है"*

### 3. Common loanwords written in Devanagari
College students and young adults across India naturally say *period*, *flow*, *doctor*, *save*, *track*, *cramps*, *app*. Do not translate these into heavy Sanskritized equivalents.
- **पीरियड** (not माहवारी or मासिक धर्म)
- **डॉक्टर** (not चिकित्सक or वैद्य)
- **सेव करें / सेव** (not सुरक्षित करें or विलोपित)
- **लॉग करें / लॉग** (not दर्ज करें or प्रविष्टि)
- **गैप** (not अंतराल or कालावधि)
- **फ्लो** (not रक्तस्राव)
- **क्रैम्प्स** (not ऐंठन or कष्टार्तव)
- **स्पॉटिंग** (not धब्बे)
- **डिस्चार्ज** (not स्राव or प्रदर)
- **डेटा** (not आंकड़े or तथ्य)
- **नॉर्मल** (not सामान्य सीमा)
- **ऐप** (not अनुप्रयोग)
- **फ़्लैग / ध्यान देने वाली बात** (not नैदानिक संकेतक)
- **बैकअप / डाउनलोड** (not निर्यात)

### 4. Digits for all numbers
- Always use standard Arabic digits: **0, 1, 2, 3, 4, 5, 6, 7, 8, 9**.
- Never use Devanagari numerals (*१, २, ३*) in the UI.
- Never write numbers as long words (*पैंतीस*, *उनतीस*).
  - ✅ *"35 दिन से ज़्यादा"*, *"5 में से 3 बार"*, *"28 दिन का मिथक"*
  - ❌ *"पैंतीस दिनों से अधिक"*, *"३५ दिन"*

### 5. Strictly Banned Stiff & Bureaucratic Words
These words sound like a government circular or an automated machine translation. Never use them:

| Stiff / Banned Word | Why it fails | Natural conversational replacement |
|---|---|---|
| **हेतु** | Sarkari / Sanskritized | **के लिए** |
| **तथा** | Textbook / unnatural | **और** |
| **द्वारा** | Heavy passive voice | **से / के ज़रिए** |
| **अतः / तदुपरांत** | Archaic connective | **इसलिए / इसके बाद** |
| **प्रदर्शित** | High-register literary | **दिखेगा / दिखाएं** |
| **समस्त / विलोपित** | Bureaucratic legal | **सारा / मिटाएं** |
| **रक्तस्राव** | Medical textbook | **पीरियड / ब्लीडिंग** |
| **माहवारी / मासिक धर्म** | Formal / dated in urban apps | **पीरियड / पीरियड्स** |
| **कष्टार्तव** | Obscure Ayurvedic/clinical | **क्रैम्प्स / तेज़ दर्द** |
| **अंशांकित / अंशांकन** | Calibration literalism | **अंदाज़ा / तैयार होना** |
| **परामर्श** | Consultation | **बात करना / दिखाना** |
| **प्रविष्टि** | Entry log | **लॉग / एंट्री** |
| **सहेजें** | While understood, सेव is universally natural | **सेव करें** |

---

## 2. Mini Glossary (English Intent → College Student Conversational Hindi)

| Purpose / Concept | English Intent | Stiff pattern to avoid | Natural Hindi |
|---|---|---|---|
| **Daily Input Prompt** | "Tell us about today in your own words" | "अपने शब्दों में आज के बारे में बताएं" | **"आज कैसा रहा? अपनी भाषा में लिख दीजिए"** |
| **Clinical Flag Title** | "Longer cycle intervals observed" | "मासिक धर्म चक्र सामान्य से लंबा पाया गया" | **"पीरियड्स के बीच का गैप लंबा रहा"** |
| **Clinical Flag Body** | "Cycle length outside standard range; review with doctor" | "आपके चक्र की अवधि सामान्य सीमा से बाहर पाई गई है। चिकित्सक से परामर्श लें।" | **"आपके पीरियड्स के बीच का गैप आमतौर पर माने जाने वाले दायरे से ज़्यादा है। एक बार डॉक्टर से बात कर लेना अच्छा रहेगा।"** |
| **Evidence Line** | "3 of the last 5 cycles exceeded 35 days" | "पिछले 5 चक्रों में से 3 की अवधि 35 दिनों से अधिक थी" | **"पिछले 5 में से 3 बार पीरियड 35 दिन से ज़्यादा के गैप पर आए"** |
| **Delete Action** | "Clear all logs" | "समस्त डेटा विलोपित करें" | **"सारा डेटा मिटाएं"** |
| **Save Action** | "Save daily check-in" | "आज का चेक-इन सुरक्षित करें" | **"आज का लॉग सेव करें"** |
| **Onboarding Next Step** | "Log your first day" | "पहला दिन दर्ज करें" | **"पहला दिन लॉग करें"** |
| **Prediction Card** | "Predictive Window Calibrated (~80% coverage)" | "व्यक्तिगत विंडो का अंशांकन (~80% कवरेज)" | **"अगले पीरियड का अंदाज़ा (~80% दायरा)"** |
| **Prediction Explanation** | "Based on 3 cycles" | "3 चक्रों के आधार पर" | **"पिछले 3 पीरियड्स के हिसाब से"** |
| **Empty State** | "No entries yet. Tell us about today, and your pattern will appear here after a few cycles." | "कोई प्रविष्टि नहीं है। चक्र सांख्यिकी हेतु डेटा दर्ज करें।" | **"अभी कोई एंट्री नहीं है। आज कैसा रहा यह बताइए—2-3 पीरियड्स के बाद आपका पूरा पैटर्न यहाँ दिखने लगेगा।"** |
| **Pain Level** | "Pain scale (0–10)" | "दर्द का पैमाना (0-10)" | **"दर्द कैसा है? (0–10)"** |
| **Pain Zero** | "None" | "शून्य" | **"बिल्कुल नहीं"** |
| **Bleeding Flow** | "Bleeding flow level" | "रक्तस्राव का स्तर (FLOW)" | **"पीरियड फ्लो (Flow)"** |
| **Doctor Brief Title** | "Clinical consultation brief" | "डॉक्टर से परामर्श हेतु 1-पेज का संक्षिप्त क्लिनिकल सारांश" | **"डॉक्टर को दिखाने के लिए 1-पेज की क्लिनिकल चिट्ठी"** |
| **Brief Disclaimer** | "Non-diagnostic wellness summary" | "यह ऐप कोई चिकित्सा उपकरण नहीं है और निदान नहीं करता।" | **"यह ऐप कोई मेडिकल डिवाइस नहीं है और डॉक्टर का विकल्प नहीं है। यह किसी बीमारी की जांच या इलाज नहीं करता।"** |
| **Privacy Guarantee** | "100% on-device, zero cloud" | "पूर्ण रूप से ऑन-डिवाइस, शून्य-क्लाउड" | **"100% आपके फ़ोन में · कोई क्लाउड नहीं"** |
| **Confirm Card** | "This is what I understood. Change anything that's wrong, then save." | "यह वही है जो सिस्टम ने समझा। अशुद्धि सुधारें और सुरक्षित करें।" | **"मैंने यह समझा। अगर कुछ ठीक करना हो तो बदल लीजिए, फिर सेव करें।"** |

---

## 3. Structural Rule: Full Sentence Templates (No Concatenation)

Hindi grammar places verbs at the end (SOV: Subject-Object-Verb), whereas English is SVO (Subject-Verb-Object). 
**Never concatenate string fragments** like:
```ts
// ❌ BROKEN CONCATENATION:
`${cycles} ${completedCycles} ${avgDays} ${days}` 
// -> "3 पूरे चक्र, आपकी औसत चक्र लंबाई है 29 दिन।" (Disjointed, ungrammatical)
```

Instead, use **full sentence functions with parameters**:
```ts
// ✅ FULL SENTENCE TEMPLATE:
cycleSummarySentence: (cycles: number, avgDays: number) => 
  `पिछले ${cycles} पूरे पीरियड्स के हिसाब से, आपका औसत गैप ${avgDays} दिन रहा है।`
```

---

## 4. Gemini Brief Polish Prompt Integration
When sending facts to Gemini for conversational polish:
1. Provide the exact **Hindi Style Guide** rules directly in the system prompt.
2. Provide **3–4 concrete before/after examples**.
3. Require that the model preserve every single digit and date without hallucinating.
4. Run the model's output through the strict [`passesNumericGuard`](file:///c:/Users/somya/cyculus/src/modules/brief/numericGuard.ts) to guarantee zero numeric drift.
