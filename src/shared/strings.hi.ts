/**
 * Centralized Hindi Strings & Full Sentence Templates for Cyculus
 *
 * Tone & Style Rules:
 * 1. Warm, conversational Hindustani register addressing the user with "आप".
 * 2. Short, active sentences.
 * 3. Devanagari loanwords: पीरियड, डॉक्टर, सेव, लॉग, गैप, फ्लो, क्रैम्प्स, स्पॉटिंग, डेटा, नॉर्मल, ऐप.
 * 4. Standard Arabic numerals (0-9) for all quantities, days, and dates.
 * 5. Banned bureaucratic words: NO हेतु, तथा, द्वारा, अतः, प्रदर्शित, समस्त, विलोपित, रक्तस्राव, कष्टार्तव, अंशांकित.
 * 6. Full sentence templates with parameters — NO piecemeal string concatenation.
 */

export const STRINGS_HI = {
  // Navigation & Shell
  nav: {
    logTab: 'लॉग',
    cycleTab: 'चक्र',
    briefTab: 'चिट्ठी',
    ooflogSub: 'आज कैसा रहा',
    cycleSub: 'साइकिल टाइमलाइन',
    briefSub: 'डॉक्टर के लिए चिट्ठी',
    settingsTitle: 'प्राइवेसी और सेटिंग्स',
    settingsSub: '100% आपके फ़ोन में',
    onDeviceBadge: '100% आपके फ़ोन में',
    tagline: 'पीरियड्स और अपनी सेहत समझना हुआ आसान',
    sidebarPromise: 'आपकी सेहत। आपके सवाल। पूरी प्राइवेसी।',
    sidebarZeroCloud: '100% आपके फ़ोन में · कोई क्लाउड नहीं',
    offlinePwa: 'बिना इंटरनेट भी तैयार',
  },

  // Global Toasts & Status
  toasts: {
    baselineSaved: 'शुरुआती अंदाज़ा सेव हो गया! अब आज का दिन लॉग कर लीजिए।',
    firstDayWelcome: 'शुरू करते हैं! अपनी डायरी के लिए आज का दिन लॉग करें।',
    entrySaved: 'आज का लॉग सुरक्षित सेव हो गया!',
    demoLoaded: (name: string) => `${name} का 6 महीने का डेमो डेटा लोड हो गया!`,
    demoRemoved: 'डेमो डेटा हट गया। अब आपकी डायरी खाली है।',
    setupCleared: 'शुरुआती अंदाज़ा हट गया।',
    allCleared: 'सारा डेटा मिट गया।',
  },

  // Daily Logging (OofLog)
  ooflog: {
    title: 'OofLog',
    badge: 'आज कैसा रहा',
    tagline: 'एक टैप में या बोलकर आज के लक्षण, फ्लो और मूड लॉग करें',
    inputPrompt: 'आज कैसा रहा? अपनी भाषा में लिखें',
    inputPlaceholder: 'जैसे: "कल से पेट में बहुत दर्द है और फ्लो काफी हेवी है..."',
    voiceHint: 'बोलकर लॉग करें',
    tryPillsLabel: 'सुझाव:',
    tryPill1: 'कल से पेट में बहुत दर्द है...',
    tryPill2: 'हल्की स्पॉटिंग और कमर दर्द',
    listening: 'सुन रहे हैं... बोलिए',
    voiceError: 'आवाज़ रिकॉर्ड नहीं हो पाई। आप टाइप करके बता सकते हैं।',

    // 1-Tap Quick Sections
    sectionFlow: 'पीरियड फ्लो (Flow)',
    sectionPain: 'दर्द कैसा है? (0–10)',
    painZero: 'बिल्कुल नहीं',
    painMild: 'हल्का',
    painModerate: 'काफी दर्द',
    painSevere: 'असहनीय',
    sectionSymptoms: 'क्या-क्या महसूस हुआ? (लक्षण)',
    sectionMood: 'मूड (Mood)',
    sectionNotes: 'कुछ और बताना चाहें तो (ज़रूरी नहीं)',
    notesPlaceholder: 'दवा, वॉक, कैसा महसूस हुआ वगैरह...',
    saveButton: 'आज का लॉग सेव करें',
    savingButton: 'सेव हो रहा है...',
    alreadyLoggedToday: 'आज का लॉग पहले से सेव है। कुछ बदलना है? फिर से सेव करें।',

    // Confirm Card (trust story & reassurance)
    confirmTitle: 'मैंने यह समझा',
    confirmSubtitle: 'अगर कुछ ठीक करना हो तो बदल लीजिए, फिर सेव करें।',
    trustNote: '100% आपके फ़ोन में सेव होगा · कोई डेटा बाहर नहीं जाता',
    confirmSaveButton: 'हाँ, यह सही है — सेव करें',
    confirmEditButton: 'बदलें',
    confirmCancelButton: 'रद्द करें',
  },

  // Urgent Red Flag Banner
  urgent: {
    bannerTitle: 'अभी डॉक्टर को दिखाएं',
    contactEmergency: 'देर न करें। पास के डॉक्टर या इमरजेंसी में जाएं।',
    callNotice: 'यह ऐप इमरजेंसी सेवाओं का विकल्प नहीं है।',
  },

  // Cycle Timeline & Predictions (Dayum)
  dayum: {
    title: 'Dayum',
    badge: 'साइकिल टाइमलाइन',
    tagline: 'समय के साथ अपने पीरियड्स का पैटर्न देखें और अगली तारीख का अंदाज़ा पाएं',

    // Primary Prediction Headline & Card
    predictionReadyHeadline: (daysUntil: number, rangeStr: string) =>
      daysUntil === 0
        ? `पीरियड आज आने का अंदाज़ा है (${rangeStr})`
        : daysUntil > 0
          ? `अगला पीरियड लगभग ${daysUntil} दिन में आने की उम्मीद है (${rangeStr})`
          : `अपेक्षित तारीख से ${Math.abs(daysUntil)} दिन ऊपर हो चुके हैं (${rangeStr})`,

    predictionEarlyHeadline: 'अगले पीरियड की तारीख का अंदाज़ा अभी तैयार नहीं है',
    predictionEarlyBody:
      'अभी चार्ट खाली है। जैसे ही आप अगला पीरियड लॉग करेंगी और एक पूरा चक्र हो जाएगा, यहाँ अगली तारीख का अंदाज़ा दिखने लगेगा।',

    basedOnCycles: (count: number) => `पिछले ${count} पीरियड्स के हिसाब से`,
    whyAmISeeingThis: 'यह अंदाज़ा कैसे लगाया जाता है?',
    predictionWindowCoverage: '~80% संभावना का दायरा',

    // Calendar & Timeline
    calendarTitle: 'पीरियड कैलेंडर और टाइमलाइन',
    calendarHeadline: (monthYear: string, periodDays: number, totalDays: number) =>
      `${monthYear} में ${periodDays} दिन पीरियड रहा, कुल ${totalDays} दिन लॉग किए।`,
    legendPeriod: 'पीरियड फ्लो',
    legendWindow: 'अपेक्षित विंडो',
    legendSymptom: 'लक्षण',

    // Cycle Length Trends
    trendTitle: 'पीरियड्स के बीच का गैप (Trend)',
    trendHeadline: (cyclesCount: number, min: number, max: number) =>
      `आपके पिछले ${cyclesCount} पीरियड्स ${min} से ${max} दिन के गैप पर आए।`,
    trendHeadlineSingle: (days: number) =>
      `पिछला पीरियड ${days} दिन के गैप पर आया।`,
    trendEmpty:
      'अभी चार्ट खाली है। 2-3 पीरियड्स लॉग करने के बाद यहाँ आपके पीरियड्स के बीच के गैप का पैटर्न दिखने लगेगा।',
    normalRangeNote: 'नॉर्मल दायरा: 24 से 38 दिन (FIGO गाइडलाइन्स)',

    // Symptom Patterns
    symptomTitle: 'लक्षण और पीरियड के चरण',
    symptomHeadline: (symptomName: string, days: number, phase: string) =>
      `${symptomName} सबसे ज़्यादा रहा (${days} दिन), खासकर ${phase} में।`,
    symptomHeadlineGeneric: (count: number) =>
      `आपके लॉग किए गए ${count} मुख्य लक्षणों का पैटर्न`,
    symptomEmpty: 'लक्षण लॉग करें, फिर यहाँ दिखेगा कि पीरियड के किस समय कौन-सी परेशानी ज़्यादा होती है।',
    phasePeriod: 'पीरियड के दिन',
    phasePostPeriod: 'पीरियड के बाद',
    phaseMidCycle: 'साइकिल के बीच में',
    phasePrePeriod: 'पीरियड से पहले',
    phaseDisclaimer: 'पीरियड के चरण आपके लॉग किए गए दिनों पर आधारित हैं। यह कोई ओव्यूलेशन टेस्ट नहीं है।',

    // History
    historyTitle: 'हालिया पीरियड्स का इतिहास',
    historyHeadline: (count: number) => `पिछले ${count} पीरियड्स का गैप और ब्लीडिंग के दिन`,
    currentCycleOngoing: 'चालू पीरियड',
    cycleDaysCount: (length: number, bleedDays: number) => `${length} दिन का गैप · ${bleedDays} दिन ब्लीडिंग`,
    ongoingCycleBleed: (bleedDays: number) => `${bleedDays} दिन ब्लीडिंग दर्ज`,

    // Algorithm Explainer Modal (Why am I seeing this)
    whyModalTitle: 'हम यह अंदाज़ा कैसे लगाते हैं?',
    whyModalSub: 'यह अंदाज़ा कैसे काम करता है (FIGO और Utah Hive मॉडल)',
    whyPoint1Title: 'हम सिर्फ एक तारीख का दावा नहीं करते',
    whyPoint1Text: 'हम एक पक्की तारीख बताने के बजाय वह समय बताते हैं जिसमें पीरियड आने की लगभग 80% संभावना है। हर किसी का शरीर अलग होता है।',
    whyPoint2Title: 'आपके अपने डेटा से सीखता है',
    whyPoint2Text: 'शुरुआत में यह आम तौर पर देखे गए औसत से अंदाज़ा लगाता है। आप 3 पीरियड्स लॉग कर लें, तो यह आपके अपने पैटर्न के हिसाब से अंदाज़ा लगाने लगता है।',
    whyPoint3Title: '100% सुरक्षित और ऑन-डिवाइस',
    whyPoint3Text: 'यह सारा कैलकुलेशन आपके फ़ोन में ही होता है। कोई भी डेटा किसी सर्वर पर नहीं भेजा जाता।',
  },

  // Doctor Brief (Chitthi)
  brief: {
    title: 'डॉक्टर ब्रीफ',
    badge: 'क्लिनिकल चिट्ठी',
    subtitle: 'डॉक्टर को दिखाने के लिए 1 पेज का आसान सारांश',
    printButton: 'PDF प्रिंट / डाउनलोड करें',
    printHeaderTitle: 'सेहत का सारांश (डॉक्टर के लिए)',
    verifiedBadge: '100% आपके फ़ोन में · FIGO मानकों पर आधारित',

    // Empty state
    emptyTitle: 'अभी कुछ लॉग नहीं किया है',
    emptyBody: 'आज कैसा रहा, यह लॉग करें। 2-3 पीरियड्स के बाद डॉक्टर के लिए आपका सारांश यहाँ अपने-आप तैयार हो जाएगा।',
    emptyAction: 'आज का दिन लॉग करें',
    emptyPreviewTitle: 'लॉग करने पर डॉक्टर के लिए क्या तैयार होगा:',
    previewPoint1Title: '1. पीरियड का पूरा हिसाब',
    previewPoint1Body: 'औसत गैप, ब्लीडिंग के दिन और तारीखों में कितना बदलाव रहा।',
    previewPoint2Title: '2. ध्यान देने वाली बातें',
    previewPoint2Body: 'अगर ब्लीडिंग बहुत ज़्यादा हुई या दर्द तेज़ रहा, तो मेडिकल गाइडलाइन्स के हिसाब से ध्यान देने वाली बातें।',
    previewPoint3Title: '3. डॉक्टर से पूछने लायक सवाल',
    previewPoint3Body: 'आपके लक्षणों के आधार पर डॉक्टर से बात करने के लिए तैयार प्रश्न।',

    // Full Sentence Brief Templates (Never piecemeal concatenation!)
    summaryFull: (cycles: number, avgDays: number) =>
      `पिछले ${cycles} पूरे पीरियड्स के हिसाब से, आपका औसत गैप ${avgDays} दिन रहा है।`,
    earlyPictureNote: 'यह अभी सिर्फ 1 या 2 पीरियड्स पर आधारित है, इसलिए अंदाज़ा बदल सकता है।',
    flagsFoundNote: (count: number) =>
      `${count} बातें ऐसी हैं जिन पर डॉक्टर से बात कर लेना अच्छा रहेगा।`,
    noFlagsNote: 'इस दौरान ऐसी कोई बात नहीं दिखी जिस पर डॉक्टर से अलग से बात करना ज़रूरी हो।',
    notEnoughData: 'अभी जानकारी कम है। रोज़ थोड़ा-बहुत लॉग करें। कुछ समय बाद आपके पीरियड्स का पैटर्न यहाँ दिखने लगेगा।',

    // Metrics list
    cycleCountLabel: 'जितने पीरियड चक्र शामिल हैं',
    avgLengthLabel: 'पीरियड्स के बीच का औसत गैप',
    rangeLabel: 'सबसे कम से सबसे ज़्यादा गैप',
    avgBleedingLabel: 'पीरियड में ब्लीडिंग के औसत दिन',
    latestCycleLabel: 'पिछला पूरा पीरियड गैप',
    daysUnit: 'दिन',

    symptomsSection: 'मुख्य लक्षण',
    flagsSection: 'डॉक्टर से बात करने वाली बातें',
    questionsSection: 'डॉक्टर से पूछने वाले सवाल',
    sourcesLabel: 'मेडिकल संदर्भ: ',
    disclaimer:
      'यह ऐप डॉक्टर की सलाह की जगह नहीं लेता। यह किसी बीमारी की पहचान या इलाज नहीं करता।',
  },

  // Onboarding Modal (First Minute)
  onboarding: {
    badge: 'Cyculus · 100% ऑन-डिवाइस',
    welcomeTitle: 'साइकुलस में आपका स्वागत है',
    welcomeSubtitle: 'आपकी निजी पीरियड डायरी और डॉक्टर के लिए आसान सारांश',

    // Step 1 Guarantees
    card1Title: '100% आपके फ़ोन में (कोई नाम या प्रोफ़ाइल नहीं)',
    card1Body: 'कोई खाता, पासवर्ड या नाम नहीं चाहिए। आपका स्वास्थ्य डेटा केवल इस फ़ोन में रहता है और बिना इंटरनेट भी चलता है।',
    card2Title: 'डॉक्टर के लिए आसान सारांश',
    card2Body: 'हिंग्लिश या अपनी भाषा में लिखें। डॉक्टर को दिखाने के लिए 1 पेज का साफ़ PDF सारांश बनाएं।',
    card3Title: 'यह ऐप क्या करता है और क्या नहीं',
    card3Body: 'यह ऐप किसी बीमारी की पहचान नहीं करता। यह आपके पीरियड्स का पैटर्न समझने और डॉक्टर से सही सवाल पूछने में मदद करता है।',

    nextSetupButton: 'पीरियड का अंदाज़ा बताएं (ऐच्छिक)',
    skipToFirstDayButton: 'सीधे पहला दिन लॉग करें',

    // Step 2 Prior Calibration
    step2Badge: 'कदम 2 · पीरियड का अंदाज़ा',
    step2Pill: 'शुरुआती अंदाज़ा (Prior)',
    step2Title: 'अपने पीरियड का थोड़ा अंदाज़ा बताएं',
    step2Body: 'यह सिर्फ शुरुआती दिनों का अंदाज़ा लगाने के लिए है। जैसे-जैसे आप असली दिन लॉग करेंगी, यह अपने-आप सही हो जाएगा।',

    lastPeriodLabel: 'पिछला पीरियड कब शुरू हुआ था?',
    optionalTag: 'ऑप्शनल',
    cycleLengthLabel: 'आमतौर पर कितने दिन का गैप रहता है?',
    mythNotice: '28 दिन का नियम सिर्फ मिथक है',
    modeKnow: 'मुझे अपना गैप पता है',
    modeNotSure: 'पक्का नहीं पता / अनियमित',
    quickSelectLabel: 'आम तौर पर रहने वाले दिन:',
    adjustDaysLabel: 'दिन सेट करें:',
    daysSuffix: 'दिन',
    normalRangeHint: 'आम तौर पर 24 से 38 दिन का गैप नॉर्मल माना जाता है (FIGO गाइडलाइन्स)।',
    populationFallbackTitle: 'आम औसत से शुरुआत',
    populationFallbackBody: 'कोई बात नहीं! हम 29 दिन के आम औसत से शुरुआत करेंगे। आप लॉग करेंगी, तो अंदाज़ा आपके पैटर्न के हिसाब से बदलने लगेगा।',

    earlierDatesTitle: 'उससे पहले की तारीखें (सटीकता बढ़ाने के लिए)',
    earlierDatesHint: 'अगर कैलेंडर से पिछली 1-2 तारीखें याद हों तो जोड़ लीजिए। इससे अंदाज़ा और सटीक हो जाता है।',
    addDatesToggle: '+ तारीखें जोड़ें',
    hideDatesToggle: 'छिपाएं',

    backButton: 'पीछे',
    logFirstDayButton: 'पहला दिन लॉग करें',
    saveBaselineButton: 'अंदाज़ा सेव करें',
  },

  // Settings & Privacy
  settings: {
    title: 'प्राइवेसी और सेटिंग्स',
    subtitle: 'आपका डेटा, आपका कंट्रोल — सब कुछ आपके फ़ोन में सुरक्षित।',

    // Baseline Card
    baselineBadge: 'शुरुआती अंदाज़ा',
    baselineTitle: 'पीरियड का शुरुआती अंदाज़ा',
    baselineBody: 'यह केवल शुरुआती दिनों का अंदाज़ा लगाने के लिए है और असली लॉग बढ़ने पर अपने-आप अपडेट हो जाता है।',
    changeBaselineButton: 'अंदाज़ा बदलें',
    removeBaselineButton: 'अंदाज़ा हटाएं',
    lastPeriodField: 'पिछला पीरियड शुरू',
    notLoggedField: 'दर्ज नहीं',
    cyclePriorField: 'अपेक्षित गैप',
    earlierDatesField: 'पिछली तारीखें',
    noneField: 'कोई नहीं',

    // Zero-Cloud Guarantee
    zeroCloudTitle: 'आपका डेटा सिर्फ आपके डिवाइस पर',
    zeroCloudBody: 'आपका कोई भी डेटा किसी सर्वर पर नहीं भेजा जाता। सब कुछ आपके इसी ब्राउज़र के सुरक्षित स्टोरेज में रहता है।',
    loggedDaysCount: (count: number) => `इस ब्राउज़र में ${count} दिन का डेटा सेव है`,

    // PWA Guide
    pwaTitle: 'ऐप इंस्टॉल करें और बिना इंटरनेट चलाएं',
    pwaSubtitle: 'होम स्क्रीन पर जोड़ें — बिना इंटरनेट भी तेज़ी से खुलेगा',
    offlineReadyBadge: 'बिना इंटरनेट तैयार',
    iosStep: 'सफ़ारी में शेयर (Share) दबाएं → "Add to Home Screen" चुनें।',
    androidStep: 'क्रोम में 3 डॉट्स (⋮) दबाएं → "Install app" चुनें।',
    desktopStep: 'ब्राउज़र एड्रेस बार में इंस्टॉल आइकन (⊕) पर क्लिक करें।',

    // Developer / Seed Tool (Secondary)
    demoBadge: 'टेस्ट करने के लिए',
    demoTitle: 'डेमो डेटा (टेस्ट करने के लिए)',
    demoSubtitle: 'ऐप को आज़माने के लिए 6 महीने का बना-बनाया डेटा लोड करें।',
    openDemoButton: 'डेमो टूल खोलें',
    closeDemoButton: 'बंद करें',
    demoWarning: 'डेमो डेटा लोड करने से पहले आपकी खुद की एंट्रीज सुरक्षित रहेंगी या आप नया शुरू कर सकती हैं।',
    removeDemoDataButton: 'डेमो डेटा हटाएं',

    // Data Management
    dataSectionTitle: 'डेटा मैनेज करें',
    exportTitle: 'डेटा डाउनलोड करें (JSON बैकअप)',
    exportBody: 'अपने पूरे डेटा की एक कॉपी अपने पास सुरक्षित डाउनलोड करके रखें।',
    exportButton: 'डाउनलोड करें',
    clearTitle: 'सारा डेटा मिटाएं',
    clearBody: 'इस फ़ोन से सभी लॉग और सेटिंग्स हमेशा के लिए हटा दें।',
    clearButton: 'सारा डेटा मिटाएं',

    // Confirmation Modal for Clear All
    clearConfirmTitle: 'क्या आप सारा डेटा मिटाना चाहती हैं?',
    clearConfirmBody: 'यह कदम वापस नहीं लिया जा सकता। आपके सभी लॉग और सेटिंग्स हमेशा के लिए हट जाएंगे।',
    clearConfirmYes: 'हाँ, सारा डेटा मिटाएं',
    clearConfirmCancel: 'रद्द करें',

    // Medical References
    referencesTitle: 'मेडिकल रिसर्च और संदर्भ',
  },

  // Confirm Seed Modal
  seedModal: {
    badge: 'डेमो डेटा',
    title: 'क्या आप डेमो डेटा लोड करना चाहती हैं?',
    confirmButton: 'हाँ, लोड करें',
    cancelButton: 'रद्द करें',
  },
} as const;
